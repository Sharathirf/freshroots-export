import pool, { query } from './db';
import { Customer, CustomerCall, CustomerFeedback, CustomerComplaint, Order, Shipment, ShipmentTrackingEvent } from '@/types';
import { computeCustomerMetrics, normalizePhoneNumber, formatCustomerNotification } from './crm-constants';

/**
 * Retrieves paginated customers list with search, filtering, and computed segmentation metrics
 */
export async function getCustomersWithMetrics(params: {
  search?: string;
  type?: string;
  segment?: string;
  reorderStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  const { search, type, segment, reorderStatus, sortBy = 'total_spend', sortOrder = 'desc', limit = 50, offset = 0 } = params;

  let sql = `
    SELECT c.*,
           COALESCE(ord.total_orders, 0) as total_orders,
           COALESCE(ord.successful_orders, 0) as successful_orders,
           COALESCE(ord.cancelled_orders, 0) as cancelled_orders,
           COALESCE(ord.total_sales_value, 0) as total_sales_value,
           COALESCE(ord.collected_revenue, 0) as collected_revenue,
           COALESCE(ord.outstanding_balance, 0) as outstanding_balance,
           ord.last_order_date,
           ord.previous_order_date,
           COALESCE(comp.open_complaints_count, 0) as open_complaints_count,
           calls.next_action as latest_next_action,
           calls.next_action_due as latest_next_action_due
    FROM customers c
    LEFT JOIN (
      SELECT customer_id,
             COUNT(*) as total_orders,
             COUNT(*) FILTER (WHERE status IN ('paid', 'allocated', 'packed', 'dispatched', 'delivered')) as successful_orders,
             COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
             SUM(CASE WHEN status IN ('paid', 'allocated', 'packed', 'dispatched', 'delivered') THEN total_amount_inr ELSE 0 END) as total_sales_value,
             SUM(CASE WHEN status = 'paid' OR payment_status = 'paid' THEN total_amount_inr ELSE 0 END) as collected_revenue,
             SUM(CASE WHEN (status = 'delivered' OR status = 'dispatched') AND payment_status != 'paid' THEN total_amount_inr ELSE 0 END) as outstanding_balance,
             MAX(created_at) as last_order_date,
             (ARRAY_AGG(created_at ORDER BY created_at DESC))[2] as previous_order_date
      FROM orders
      WHERE customer_id IS NOT NULL
      GROUP BY customer_id
    ) ord ON ord.customer_id = c.id
    LEFT JOIN (
      SELECT customer_id, COUNT(*) as open_complaints_count
      FROM customer_complaints
      WHERE status IN ('open', 'escalated')
      GROUP BY customer_id
    ) comp ON comp.customer_id = c.id
    LEFT JOIN (
      SELECT DISTINCT ON (customer_id) customer_id, next_action, next_action_due
      FROM customer_calls
      WHERE next_action IS NOT NULL
      ORDER BY customer_id, created_at DESC
    ) calls ON calls.customer_id = c.id
    WHERE c.merged_into IS NULL
  `;

  const queryParams: any[] = [];
  let paramIdx = 1;

  if (search && search.trim()) {
    sql += ` AND (c.name ILIKE $${paramIdx} OR c.phone ILIKE $${paramIdx} OR c.company_name ILIKE $${paramIdx} OR c.email ILIKE $${paramIdx} OR c.customer_code ILIKE $${paramIdx})`;
    queryParams.push(`%${search.trim()}%`);
    paramIdx++;
  }

  if (type && type !== 'all') {
    sql += ` AND c.customer_type = $${paramIdx}`;
    queryParams.push(type);
    paramIdx++;
  }

  // Ordering
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  if (sortBy === 'name') {
    sql += ` ORDER BY c.name ${orderDirection}`;
  } else if (sortBy === 'order_count') {
    sql += ` ORDER BY COALESCE(ord.successful_orders, 0) ${orderDirection}, c.created_at DESC`;
  } else if (sortBy === 'last_order') {
    sql += ` ORDER BY ord.last_order_date ${orderDirection} NULLS LAST`;
  } else if (sortBy === 'outstanding') {
    sql += ` ORDER BY COALESCE(ord.outstanding_balance, 0) ${orderDirection}`;
  } else {
    // Default total_spend
    sql += ` ORDER BY COALESCE(ord.total_sales_value, 0) ${orderDirection}, c.created_at DESC`;
  }

  sql += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
  queryParams.push(limit, offset);

  const rawCustomers = await query(sql, queryParams);

  // Compute rich segments dynamically
  const customers = rawCustomers.map((c: any) => {
    const totalOrders = Number(c.total_orders) || 0;
    const successfulOrders = Number(c.successful_orders) || 0;
    const totalSales = Number(c.total_sales_value) || 0;
    const collectedRevenue = Number(c.collected_revenue) || 0;
    const outstandingBalance = Number(c.outstanding_balance) || 0;
    const openComplaints = Number(c.open_complaints_count) || 0;

    const recommendedReorderDays = c.customer_type === 'wholesale' ? 21 : c.customer_type === 'export' ? 45 : 30;

    let daysSinceLastOrder: number | undefined;
    if (c.last_order_date) {
      daysSinceLastOrder = Math.max(
        0,
        Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    let reorder_status: 'due' | 'overdue' | 'ok' | 'inactive' = 'ok';
    if (daysSinceLastOrder !== undefined) {
      if (daysSinceLastOrder > 60) {
        reorder_status = 'inactive';
      } else if (daysSinceLastOrder > recommendedReorderDays + 5) {
        reorder_status = 'overdue';
      } else if (daysSinceLastOrder >= recommendedReorderDays - 3) {
        reorder_status = 'due';
      }
    } else {
      reorder_status = 'inactive';
    }

    const highValueThreshold = c.customer_type === 'retail' ? 25000 : 200000;
    let seg = 'New Customer';
    let segReason = 'Recently registered with 0 completed orders.';

    if (openComplaints > 0) {
      seg = 'Recent Complaint';
      segReason = 'Has unresolved complaint requiring customer care escalation.';
    } else if (outstandingBalance > 0) {
      seg = 'Outstanding Balance';
      segReason = `Unsettled balance of ₹${outstandingBalance.toLocaleString('en-IN')}.`;
    } else if (totalSales >= highValueThreshold) {
      seg = c.customer_type === 'wholesale' ? 'High-Value Wholesale Buyer' : 'High-Value Retail Customer';
      segReason = `High-spend account with ₹${totalSales.toLocaleString('en-IN')} across ${successfulOrders} orders.`;
    } else if (reorder_status === 'overdue') {
      seg = 'Overdue for Reorder';
      segReason = `Last order delivered ${daysSinceLastOrder} days ago (exceeds ${recommendedReorderDays}d target).`;
    } else if (reorder_status === 'due') {
      seg = 'Customers Due for Reorder';
      segReason = `Due for regular restock (${daysSinceLastOrder} days since last consignment).`;
    } else if (successfulOrders >= 2) {
      seg = 'Repeat Customer';
      segReason = `${successfulOrders} completed orders, last delivered ${daysSinceLastOrder ?? 0} days ago.`;
    } else if (successfulOrders === 1) {
      seg = 'First-Time Buyer';
      segReason = `Completed 1 order of ₹${totalSales.toLocaleString('en-IN')}. Target for feedback call.`;
    } else if (reorder_status === 'inactive' && totalOrders > 0) {
      seg = 'Inactive Customer';
      segReason = `No completed purchase in over 60 days. Re-engagement needed.`;
    }

    return {
      ...c,
      total_orders: totalOrders,
      successful_orders: successfulOrders,
      total_sales_value: totalSales,
      collected_revenue: collectedRevenue,
      outstanding_balance: outstandingBalance,
      average_order_value: successfulOrders > 0 ? Math.round(totalSales / successfulOrders) : 0,
      days_since_last_order: daysSinceLastOrder,
      reorder_status,
      recommended_reorder_days: recommendedReorderDays,
      segment: seg,
      segment_reason: segReason,
    };
  });

  // In-memory filter if segment or reorderStatus is passed
  let filtered = customers;
  if (segment && segment !== 'all') {
    filtered = filtered.filter((c: any) => c.segment.toLowerCase().includes(segment.toLowerCase()));
  }
  if (reorderStatus && reorderStatus !== 'all') {
    filtered = filtered.filter((c: any) => c.reorder_status === reorderStatus);
  }

  const countRes = await query<{ count: string }>('SELECT COUNT(*) as count FROM customers WHERE merged_into IS NULL');
  return {
    total: Number(countRes[0]?.count || 0),
    count: filtered.length,
    customers: filtered,
  };
}

/**
 * Retrieves complete customer dossier (profile, orders, quotes, calls, feedback, complaints, shipments)
 */
export async function getCustomerDossier(customerId: string) {
  const custRes = await query<Customer>('SELECT * FROM customers WHERE id = $1', [customerId]);
  if (custRes.length === 0) return null;
  const customer = custRes[0];

  const orders = await query<Order>(
    `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId]
  );

  const quotes = await query<any>(
    `SELECT * FROM wholesale_quotations WHERE contact_phone LIKE $1 ORDER BY created_at DESC`,
    [`%${customer.phone}%`]
  );

  const calls = await query<CustomerCall>(
    `SELECT * FROM customer_calls WHERE customer_id = $1 ORDER BY call_date DESC`,
    [customerId]
  );

  const feedback = await query<CustomerFeedback>(
    `SELECT * FROM customer_feedback WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId]
  );

  const complaints = await query<CustomerComplaint>(
    `SELECT * FROM customer_complaints WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId]
  );

  const shipments = await query<Shipment>(
    `SELECT * FROM shipments WHERE customer_id = $1 OR order_id IN (SELECT id FROM orders WHERE customer_id = $1) ORDER BY created_at DESC`,
    [customerId]
  );

  const notifications = await query<any>(
    `SELECT * FROM customer_notifications WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [customerId]
  );

  const summary = computeCustomerMetrics(customer, orders, complaints);

  return {
    customer,
    summary,
    orders,
    quotes,
    calls,
    feedback,
    complaints,
    shipments,
    notifications,
  };
}

/**
 * Creates an admin order originating from phone, WhatsApp, email, or in-person
 */
export async function createAdminOrder(payload: {
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  destination_pincode: string;
  order_source: 'phone' | 'whatsapp' | 'email' | 'in_person' | 'admin';
  order_channel: 'retail' | 'wholesale' | 'export';
  customer_consent_source: string;
  admin_notes?: string;
  items: {
    product_id: string;
    sku: string;
    title: string;
    quantity: number;
    unit_price_inr: number;
    total_price_inr: number;
    unit_of_measure: string;
    estimated_weight_kg: number;
  }[];
  subtotal_inr: number;
  delivery_fee_inr: number;
  tax_inr: number;
  total_amount_inr: number;
  payment_method: string;
  payment_status: 'paid' | 'pending' | 'unpaid';
  initial_status: 'draft' | 'pending_payment' | 'paid' | 'allocated';
  admin_user_name: string;
  admin_user_id?: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Resolve or Create Centralized Customer
    const cleanPhone = normalizePhoneNumber(payload.customer_phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Valid 10-digit Indian customer phone number is required');
    }

    let customerId = payload.customer_id;
    if (!customerId) {
      const existing = await client.query('SELECT id FROM customers WHERE phone = $1 LIMIT 1', [cleanPhone]);
      if (existing.rows.length > 0) {
        customerId = existing.rows[0].id;
      } else {
        const custCode = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
        const newCust = await client.query(
          `INSERT INTO customers (
            customer_code, customer_type, name, phone, email, shipping_address, pincode, acquisition_source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id`,
          [
            custCode,
            payload.order_channel,
            payload.customer_name,
            cleanPhone,
            payload.customer_email || null,
            payload.shipping_address,
            payload.destination_pincode,
            payload.order_source,
          ]
        );
        customerId = newCust.rows[0].id;
      }
    }

    // 2. Generate unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AGR-${dateStr}-${randSuffix}`;

    // 3. Insert order
    const orderRes = await client.query(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, customer_email,
        shipping_address, destination_pincode, order_type, order_source, order_channel,
        status, payment_status, fulfilment_status, subtotal_inr, delivery_fee_inr,
        tax_inr, total_amount_inr, payment_method, items, created_by_admin_name,
        created_by_admin_id, admin_notes, customer_consent_source, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, 'unfulfilled', $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, NOW(), NOW()
      ) RETURNING *`,
      [
        orderNumber,
        customerId,
        payload.customer_name,
        cleanPhone,
        payload.customer_email || null,
        payload.shipping_address,
        payload.destination_pincode,
        payload.order_channel === 'retail' ? 'retail' : 'wholesale',
        payload.order_source,
        payload.order_channel,
        payload.initial_status,
        payload.payment_status,
        payload.subtotal_inr,
        payload.delivery_fee_inr,
        payload.tax_inr,
        payload.total_amount_inr,
        payload.payment_method,
        JSON.stringify(payload.items),
        payload.admin_user_name,
        payload.admin_user_id || null,
        payload.admin_notes || null,
        payload.customer_consent_source,
      ]
    );

    const createdOrder = orderRes.rows[0];

    // 4. Audit Log
    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('ADMIN_ORDER_CREATED', 'orders', $1, $2)`,
      [
        createdOrder.id,
        JSON.stringify({
          order_number: orderNumber,
          source: payload.order_source,
          admin_user: payload.admin_user_name,
          consent: payload.customer_consent_source,
          total: payload.total_amount_inr,
        }),
      ]
    );

    // 5. Automatic Notification Queue
    const notifContent = formatCustomerNotification('order_confirmed', {
      order_number: orderNumber,
      customer_name: payload.customer_name,
      items_summary: payload.items.map((i) => `${i.quantity}x ${i.title}`).join(', '),
      total_inr: payload.total_amount_inr,
    });

    const notifKey = `notif_${createdOrder.id}_order_confirmed`;
    await client.query(
      `INSERT INTO customer_notifications (
        customer_id, order_id, channel, event_type, recipient, title, message, status, idempotency_key
      ) VALUES ($1, $2, 'whatsapp', 'order_confirmed', $3, $4, $5, 'sent', $6)
      ON CONFLICT (idempotency_key) DO NOTHING`,
      [customerId, createdOrder.id, cleanPhone, notifContent.title, notifContent.message, notifKey]
    );

    await client.query('COMMIT');
    return createdOrder;
  } catch (err: any) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Creates a shipment against an order and links tracking
 */
export async function createShipmentForOrder(payload: {
  order_id: string;
  delivery_partner: string;
  shipment_type?: 'courier' | 'truckload' | 'part_truckload' | 'air_cargo';
  tracking_number: string;
  tracking_url?: string;
  origin?: string;
  destination?: string;
  package_count?: number;
  dispatched_quantity_kg?: number;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  consignment_note_number?: string;
  lr_number?: string;
  estimated_delivery_date?: string;
  created_by_name: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [payload.order_id]);
    if (orderRes.rows.length === 0) throw new Error('Order not found');
    const order = orderRes.rows[0];

    const shpNumber = `SHP-${order.order_number.replace(/^AGR-/, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const insertRes = await client.query(
      `INSERT INTO shipments (
        shipment_number, order_id, customer_id, delivery_partner, shipment_type,
        tracking_number, tracking_url, status, origin, destination,
        destination_pincode, package_count, dispatched_quantity_kg, vehicle_number,
        driver_name, driver_phone, consignment_note_number, lr_number,
        dispatch_date, estimated_delivery_date, created_by_name, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, 'dispatched', $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17,
        NOW(), $18, $19, NOW(), NOW()
      ) RETURNING *`,
      [
        shpNumber,
        order.id,
        order.customer_id || null,
        payload.delivery_partner,
        payload.shipment_type || 'courier',
        payload.tracking_number,
        payload.tracking_url || `https://track.freshrootsexport.com/${payload.tracking_number}`,
        payload.origin || 'Tiptur Mandi Hub, Karnataka',
        payload.destination || order.shipping_address,
        order.destination_pincode || null,
        payload.package_count || 1,
        payload.dispatched_quantity_kg || null,
        payload.vehicle_number || null,
        payload.driver_name || null,
        payload.driver_phone || null,
        payload.consignment_note_number || null,
        payload.lr_number || null,
        payload.estimated_delivery_date || null,
        payload.created_by_name,
      ]
    );

    const shipment = insertRes.rows[0];

    // Initial milestone event
    await client.query(
      `INSERT INTO shipment_tracking_events (shipment_id, status, description, location, source, created_by_name)
       VALUES ($1, 'dispatched', $2, $3, 'manual', $4)`,
      [
        shipment.id,
        `Dispatched via ${payload.delivery_partner} with tracking ${payload.tracking_number}`,
        payload.origin || 'Tiptur Mandi Hub',
        payload.created_by_name,
      ]
    );

    // Update order fulfillment status and tracking reference
    await client.query(
      `UPDATE orders
       SET status = CASE WHEN status = 'delivered' THEN 'delivered' ELSE 'dispatched' END,
           fulfilment_status = 'dispatched',
           tracking_reference = $1,
           carrier_name = $2,
           estimated_delivery_date = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [payload.tracking_number, payload.delivery_partner, payload.estimated_delivery_date || null, order.id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('SHIPMENT_CREATED', 'shipments', $1, $2)`,
      [
        shipment.id,
        JSON.stringify({
          shipment_number: shpNumber,
          order_id: order.id,
          tracking_number: payload.tracking_number,
          partner: payload.delivery_partner,
        }),
      ]
    );

    // Customer Notification
    const notif = formatCustomerNotification('order_dispatched', {
      order_number: order.order_number,
      customer_name: order.customer_name,
      delivery_partner: payload.delivery_partner,
      tracking_number: payload.tracking_number,
      estimated_delivery: payload.estimated_delivery_date
        ? new Date(payload.estimated_delivery_date).toLocaleDateString('en-IN')
        : undefined,
    });

    const notifKey = `notif_${shipment.id}_dispatched`;
    await client.query(
      `INSERT INTO customer_notifications (
        customer_id, order_id, shipment_id, channel, event_type, recipient, title, message, status, idempotency_key
      ) VALUES ($1, $2, $3, 'whatsapp', 'order_dispatched', $4, $5, $6, 'sent', $7)
      ON CONFLICT (idempotency_key) DO NOTHING`,
      [order.customer_id, order.id, shipment.id, order.customer_phone, notif.title, notif.message, notifKey]
    );

    await client.query('COMMIT');
    return shipment;
  } catch (err: any) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
