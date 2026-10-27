import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import pool, { query } from '@/lib/db';
import { findMatchingVariant } from '@/lib/variants';
import { validateCoupon } from '@/lib/coupons';
import { OrderItem } from '@/types';
import { deliverTransactionalEmail, emailIsConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      destination_pincode,
      payment_method,
      payment_reference,
      items,
      coupon_code
    } = body;

    if (!customer_name || !customer_phone || !shipping_address || !destination_pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory shipping information' },
        { status: 400 }
      );
    }

    // Pay on Delivery is strictly disabled per business policy
    if (payment_method === 'cod') {
      return NextResponse.json(
        { success: false, error: 'Pay on Delivery is currently disabled. Please select UPI or Card payment.' },
        { status: 400 }
      );
    }

    const paymentMethod = payment_method === 'card' ? 'razorpay' : payment_method;
    if (paymentMethod !== 'upi' && paymentMethod !== 'razorpay') {
      return NextResponse.json({ success: false, error: 'Unsupported payment method' }, { status: 400 });
    }

    let upiReference: string | null = null;
    if (paymentMethod === 'upi' && typeof payment_reference === 'string' && payment_reference.trim()) {
      const candidate = payment_reference.trim().replace(/^UTR-/i, '');
      if (!/^[A-Za-z0-9-]{6,35}$/.test(candidate)) {
        return NextResponse.json({ success: false, error: 'Enter a valid UPI reference number' }, { status: 400 });
      }
      upiReference = `UTR-${candidate}`;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart cannot be empty' },
        { status: 400 }
      );
    }

    // Calculate Subtotal & Verify Prices from DB
    let subtotal = 0;
    let totalTax = 0;
    const validatedItems: OrderItem[] = [];

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const item of items) {
      let dbProd: any[] = [];
      const hasValidUuid = UUID_REGEX.test(item.product_id || '');

      if (hasValidUuid) {
        dbProd = await query(
          `SELECT id, sku, title, retail_price_inr, unit_of_measure, estimated_weight_kg, tax_rate_percentage, bulk_min_quantity 
           FROM products WHERE id = $1 AND is_active = true`,
          [item.product_id]
        );
      }

      // Fallback 1: Match by SKU if provided (heals stale product_id from prior sessions/re-seeds)
      if (dbProd.length === 0 && item.sku) {
        dbProd = await query(
          `SELECT id, sku, title, retail_price_inr, unit_of_measure, estimated_weight_kg, tax_rate_percentage, bulk_min_quantity 
           FROM products WHERE sku = $1 AND is_active = true`,
          [item.sku]
        );
      }

      // Fallback 2: Match by Title keyword
      if (dbProd.length === 0 && item.title) {
        const titleKey = item.title.replace(/\(.*?\)/g, '').trim().split(' ')[0];
        dbProd = await query(
          `SELECT id, sku, title, retail_price_inr, unit_of_measure, estimated_weight_kg, tax_rate_percentage, bulk_min_quantity 
           FROM products WHERE title ILIKE $1 AND is_active = true LIMIT 1`,
          [`%${titleKey}%`]
        );
      }

      // Fallback 3: Lookup historical order items for prior UUID re-seeds (e.g. 77ba25a6...)
      if (dbProd.length === 0 && item.product_id) {
        const pastOrderMatch = await query(
          `SELECT items FROM orders WHERE items::text LIKE $1 LIMIT 1`,
          [`%${item.product_id}%`]
        );
        if (pastOrderMatch.length > 0) {
          try {
            const pastItems = typeof pastOrderMatch[0].items === 'string'
              ? JSON.parse(pastOrderMatch[0].items)
              : pastOrderMatch[0].items;
            const matchedPast = pastItems.find((pi: any) => pi.product_id === item.product_id);
            if (matchedPast && matchedPast.sku) {
              dbProd = await query(
                `SELECT id, sku, title, retail_price_inr, unit_of_measure, estimated_weight_kg, tax_rate_percentage, bulk_min_quantity 
                 FROM products WHERE sku = $1 AND is_active = true`,
                [matchedPast.sku]
              );
            }
          } catch {}
        }
      }

      if (dbProd.length === 0) {
        return NextResponse.json(
          { success: false, error: `Product "${item.title || item.product_id}" is no longer available in the active harvest catalog. Please remove it from your cart.` },
          { status: 400 }
        );
      }

      const prod = dbProd[0];

      // Reject retail checkout for bulk-only commodities
      if (prod.sku.includes('BLK')) {
        return NextResponse.json(
          { success: false, error: `${prod.title} is available only for wholesale bulk inquiries via RFQ quotation.` },
          { status: 400 }
        );
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for ${prod.title}` },
          { status: 400 }
        );
      }

      const minQty = Number(prod.bulk_min_quantity) || 1;
      if (qty < minQty) {
        return NextResponse.json(
          { success: false, error: `Minimum order quantity for ${prod.title} is ${minQty} units.` },
          { status: 400 }
        );
      }

      let itemUnitPrice = Number(prod.retail_price_inr);
      let itemUnitOfMeasure = prod.unit_of_measure;
      let itemTitle = prod.title;
      let itemUnitWeight = Number(prod.estimated_weight_kg || 0);

      // Check if an authorized variant was selected (e.g. 500 ml @ ₹480 for Ghee)
      const matchedVariant = findMatchingVariant(
        prod.sku,
        item.unit_price_inr !== undefined ? Number(item.unit_price_inr) : undefined,
        item.unit_of_measure
      );

      if (matchedVariant) {
        itemUnitPrice = matchedVariant.price;
        itemUnitOfMeasure = matchedVariant.unitOfMeasure;
        itemTitle = matchedVariant.title;
        itemUnitWeight = matchedVariant.weightKg;
      }

      const itemTotal = itemUnitPrice * qty;
      const taxRate = Number(prod.tax_rate_percentage) || 0;
      const itemTax = (itemTotal * taxRate) / 100;

      subtotal += itemTotal;
      totalTax += itemTax;

      validatedItems.push({
        product_id: prod.id,
        sku: prod.sku,
        title: itemTitle,
        unit_of_measure: itemUnitOfMeasure,
        quantity: qty,
        unit_price_inr: itemUnitPrice,
        total_price_inr: itemTotal,
        tax_rate_percentage: taxRate,
        estimated_weight_kg: itemUnitWeight * qty,
        item_key: item.item_key || `${prod.id}__${itemUnitOfMeasure.replace(/\s+/g, '_')}`
      });

    }

    // Validate coupon if provided
    let discountInr = 0.00;
    let appliedCouponCode: string | null = null;

    if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim()) {
      // Check if this customer phone has any previous orders on record
      const cleanPhone = customer_phone.replace(/\D/g, '').slice(-10);
      const pastOrders = await query(
        `SELECT id FROM orders
         WHERE customer_phone LIKE $1 AND status IN ('paid', 'allocated', 'packed', 'dispatched', 'delivered')
         LIMIT 1`,
        [`%${cleanPhone}%`]
      );
      const isFirstOrder = pastOrders.length === 0;

      const couponRes = validateCoupon(coupon_code, subtotal, isFirstOrder);
      if (!couponRes.valid) {
        return NextResponse.json(
          { success: false, error: couponRes.message },
          { status: 400 }
        );
      }
      discountInr = couponRes.discountAmount;
      appliedCouponCode = couponRes.coupon?.code || coupon_code.trim().toUpperCase();
    }

    // 100% Free Doorstep Delivery across India on ALL orders (No minimum quantity)
    const deliveryFee = 0.00;
    const grandTotal = Math.max(0, subtotal - discountInr + deliveryFee + totalTax);

    // Generate Order Number: AGR-YYYYMM-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = randomBytes(6).toString('hex').toUpperCase();
    const orderNumber = `AGR-${dateStr}-${randSuffix}`;

    const trackingRef = `VRL-BLR-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderStatus = 'pending_payment';
    const expiresInHours = paymentMethod === 'razorpay' || !upiReference ? 0.5 : 24;
    const client = await pool.connect();
    let order: any;
    try {
      await client.query('BEGIN');

      // Reserve stock under row locks so two checkouts cannot sell the same units.
      const requestedByProduct = new Map<string, number>();
      for (const item of validatedItems) {
        requestedByProduct.set(item.product_id, (requestedByProduct.get(item.product_id) || 0) + item.quantity);
      }

      const allocations: Array<{ productId: string; batchId: string; quantity: number }> = [];
      for (const [productId, requestedQuantity] of requestedByProduct) {
        const batches = await client.query<{ id: string; available_quantity: number }>(
          `SELECT id, available_quantity
           FROM inventory_batches
           WHERE product_id = $1 AND available_quantity > 0
           ORDER BY intake_date ASC, created_at ASC
           FOR UPDATE`,
          [productId]
        );
        let remaining = requestedQuantity;
        for (const batch of batches.rows) {
          if (remaining <= 0) break;
          const available = Number(batch.available_quantity);
          const allocated = Math.min(available, remaining);
          await client.query(
            `UPDATE inventory_batches
             SET available_quantity = available_quantity - $1,
                 reserved_quantity = reserved_quantity + $1
             WHERE id = $2`,
            [allocated, batch.id]
          );
          allocations.push({ productId, batchId: batch.id, quantity: allocated });
          remaining -= allocated;
        }
        if (remaining > 0) {
          throw new Error(`INSUFFICIENT_STOCK:${validatedItems.find((item) => item.product_id === productId)?.title || 'A product'}`);
        }
      }

      const insertedOrder = await client.query(
        `INSERT INTO orders (
          order_number, order_type, status, customer_name, customer_phone, customer_email,
          shipping_address, destination_pincode, subtotal_inr, delivery_fee_inr, tax_inr,
          total_amount_inr, payment_method, payment_reference, tracking_reference, items,
          discount_inr, coupon_code, payment_expires_at
        ) VALUES ($1, 'retail', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW() + ($18 * INTERVAL '1 hour'))
        RETURNING *`,
        [
          orderNumber,
          orderStatus,
          customer_name,
          customer_phone,
          customer_email || null,
          shipping_address,
          destination_pincode,
          subtotal,
          deliveryFee,
          totalTax,
          grandTotal,
          paymentMethod,
          upiReference,
          trackingRef,
          JSON.stringify(validatedItems),
          discountInr,
          appliedCouponCode,
          expiresInHours,
        ]
      );
      order = insertedOrder.rows[0];

      for (const allocation of allocations) {
        await client.query(
          `INSERT INTO order_inventory_reservations (order_id, batch_id, quantity)
           VALUES ($1, $2, $3)`,
          [order.id, allocation.batchId, allocation.quantity]
        );
      }

      await client.query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('RETAIL_ORDER_CREATED', 'orders', $1, $2)`,
        [order.id, JSON.stringify({ order_number: orderNumber, total: grandTotal, payment_status: orderStatus })]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
        return NextResponse.json(
          { success: false, error: `${error.message.slice('INSUFFICIENT_STOCK:'.length)} does not have enough stock. Please update your cart.` },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      client.release();
    }

    // Synchronize customer profile into users table
    if (customer_phone) {
      try {
        await query(
          `INSERT INTO users (full_name, phone, email, role)
           VALUES ($1, $2, $3, 'retail_customer')
           ON CONFLICT (phone) DO UPDATE 
           SET full_name = EXCLUDED.full_name,
               email = COALESCE(EXCLUDED.email, users.email),
               updated_at = NOW()`,
          [customer_name || 'Customer', customer_phone, customer_email || null]
        );
      } catch (userSyncErr) {
        console.warn('Customer profile sync warning:', userSyncErr);
      }
    }

    if (emailIsConfigured()) {
      const orderLines = validatedItems.map((item) => `• ${item.quantity} ${item.unit_of_measure} ${item.title}`).join('\n');
      const emailTasks = [];
      if (customer_email) {
        emailTasks.push(deliverTransactionalEmail({
          to: customer_email,
          subject: `FreshRoots order ${orderNumber} received`,
          text: [
            `Hello ${customer_name},`,
            '',
            `We received your order ${orderNumber}.`,
            `Payment status: Pending verification`,
            '',
            orderLines,
            '',
            `Order total: ₹${grandTotal.toLocaleString('en-IN')}`,
            `Tracking reference: ${trackingRef}`,
            '',
            'We will send another update when your order is dispatched.',
            'FreshRoots Export',
          ].join('\n'),
        }, 'order_buyer_confirmation'));
      }

      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        emailTasks.push(deliverTransactionalEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New retail order ${orderNumber}`,
          text: [
            `Order: ${orderNumber}`,
            `Customer: ${customer_name}`,
            `Phone: ${customer_phone}`,
            `Email: ${customer_email || 'Not provided'}`,
            `Amount: ₹${grandTotal.toLocaleString('en-IN')}`,
            `Status: ${orderStatus}`,
            `Tracking reference: ${trackingRef}`,
          ].join('\n'),
        }, 'order_admin_notification'));
      }
      await Promise.all(emailTasks);
    }

    // Generate Direct WhatsApp Alert Link for Farm Desk (+91 95911 42548)
    const alertMessage = encodeURIComponent(
      `🌾 *NEW FARM ORDER #${orderNumber}*\n` +
      `👤 *Customer:* ${customer_name} (${customer_phone})\n` +
      `📍 *Delivery:* ${shipping_address}, PIN: ${destination_pincode}\n` +
      `📦 *Items:*\n` +
      validatedItems.map((it: any) => `  • ${it.quantity}x ${it.title} (${it.unit_of_measure})`).join('\n') + '\n' +
      `💰 *Total Amount:* ₹${grandTotal} (Payment pending verification)\n` +
      `🚚 *Courier Ref:* ${trackingRef}\n` +
      `⚠️ Do not dispatch until payment is verified in the Operations Desk.`
    );
    const whatsappAlertUrl = `https://wa.me/919591142548?text=${alertMessage}`;

    const orderRecord = {
      ...order,
      whatsapp_alert_url: whatsappAlertUrl
    };

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      order: orderRecord,
      whatsapp_alert_url: whatsappAlertUrl
    });
  } catch (error: any) {
    console.error('API Error in /api/orders (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/orders', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to process order', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const orderNumber = searchParams.get('order_number');

    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params: any[] = [];

    if (orderNumber) {
      params.push(orderNumber);
      sql += ` AND order_number = $${params.length}`;
    } else if (phone) {
      params.push(phone);
      sql += ` AND customer_phone = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 20`;

    const orders = await query(sql, params);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('API Error in /api/orders (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders', details: error.message },
      { status: 500 }
    );
  }
}
