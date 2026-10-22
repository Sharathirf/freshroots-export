import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { calculateLocalShiprocketRates } from '@/lib/shiprocket';
import { findMatchingVariant } from '@/lib/variants';
import { OrderItem } from '@/types';

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
      items
    } = body;

    if (!customer_name || !customer_phone || !shipping_address || !destination_pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory shipping information' },
        { status: 400 }
      );
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

    for (const item of items) {
      const dbProd = await query(
        `SELECT id, sku, title, retail_price_inr, unit_of_measure, estimated_weight_kg, tax_rate_percentage, bulk_min_quantity 
         FROM products WHERE id = $1 AND is_active = true`,
        [item.product_id]
      );

      if (dbProd.length === 0) {
        return NextResponse.json(
          { success: false, error: `Product ID ${item.product_id} is no longer available` },
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
        estimated_weight_kg: itemUnitWeight * qty,
        item_key: item.item_key || `${prod.id}__${itemUnitOfMeasure.replace(/\s+/g, '_')}`
      });

      // Atomically decrement available inventory in newest batch
      await query(
        `UPDATE inventory_batches 
         SET available_quantity = available_quantity - $1,
             reserved_quantity = reserved_quantity + $1
         WHERE id = (
           SELECT id FROM inventory_batches 
           WHERE product_id = $2 AND available_quantity >= $1 
           ORDER BY intake_date ASC LIMIT 1
         )`,
        [qty, prod.id]
      );
    }

    // Delivery fee calculation:
    // Threshold-based Free Shipping: Free delivery for cart value > ₹2,999, otherwise calculated at actuals.
    const FREE_SHIPPING_THRESHOLD = 2999;
    let deliveryFee = 0.00;
    const isFreeShipping = subtotal > FREE_SHIPPING_THRESHOLD;

    if (isFreeShipping) {
      deliveryFee = 0.00;
    } else if (body.delivery_fee !== undefined && !isNaN(Number(body.delivery_fee))) {
      deliveryFee = Math.max(0, Number(body.delivery_fee));
    } else {
      const totalWeightKg = validatedItems.reduce((acc, it) => acc + (it.estimated_weight_kg || 1), 0);
      try {
        const shippingCalc = calculateLocalShiprocketRates({
          pickup_postcode: '571423',
          delivery_postcode: destination_pincode,
          weight: Math.max(1.0, totalWeightKg),
          declared_value: subtotal
        });
        deliveryFee = shippingCalc.lowest_rate;
      } catch {
        deliveryFee = 150.00;
      }
    }
    const grandTotal = subtotal + deliveryFee + totalTax;

    // Generate Order Number: AGR-YYYYMM-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = `${Date.now().toString().slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumber = `AGR-${dateStr}-${randSuffix}`;

    const paymentRef = `PAY-SIM-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const trackingRef = `VRL-BLR-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const insertedOrder = await query(
      `INSERT INTO orders (
        order_number, order_type, status, customer_name, customer_phone, customer_email,
        shipping_address, destination_pincode, subtotal_inr, delivery_fee_inr, tax_inr,
        total_amount_inr, payment_method, payment_reference, tracking_reference, items
      ) VALUES ($1, 'retail', 'paid', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        orderNumber,
        customer_name,
        customer_phone,
        customer_email || null,
        shipping_address,
        destination_pincode,
        subtotal,
        deliveryFee,
        totalTax,
        grandTotal,
        payment_method || 'upi',
        paymentRef,
        trackingRef,
        JSON.stringify(validatedItems)
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('RETAIL_ORDER_CREATED', 'orders', $1, $2)`,
      [insertedOrder[0].id, JSON.stringify({ order_number: orderNumber, total: grandTotal })]
    );

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

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      order: insertedOrder[0]
    });
  } catch (error: any) {
    console.error('API Error in /api/orders (POST):', error);
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
