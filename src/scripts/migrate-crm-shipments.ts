import fs from 'fs';
import path from 'path';
import pool, { query } from '../lib/db';

function normalizePhone(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

async function runMigration() {
  console.log('🚀 Running Customer CRM, Shipments & Notifications Migration...');

  // 1. Execute SQL schema
  const sqlPath = path.join(__dirname, '../lib/migrations/20261029_customer_crm_shipments_notifications.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Applying schema statements...');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Schema created successfully.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Schema creation error:', err.message);
    throw err;
  } finally {
    client.release();
  }

  // 2. Backfill Customers from Orders
  console.log('Populating centralized customers from orders and quotations...');
  const orders = await query<{
    customer_phone: string;
    customer_name: string;
    customer_email: string;
    shipping_address: string;
    destination_pincode: string;
    order_type: string;
    created_at: string;
  }>(`
    SELECT customer_phone, customer_name, customer_email, shipping_address, destination_pincode, order_type, MIN(created_at) as created_at
    FROM orders
    WHERE customer_phone IS NOT NULL AND TRIM(customer_phone) != ''
    GROUP BY customer_phone, customer_name, customer_email, shipping_address, destination_pincode, order_type
    ORDER BY MIN(created_at) ASC
  `);

  console.log(`Found ${orders.length} order profile groups to ingest.`);

  let customerSeq = 1000;
  for (const o of orders) {
    const phone = normalizePhone(o.customer_phone);
    if (!phone || phone.length < 10) continue;

    // Check if customer already exists by phone
    const existing = await query<{ id: string }>('SELECT id FROM customers WHERE phone = $1', [phone]);
    if (existing.length === 0) {
      customerSeq++;
      const code = `CUST-${customerSeq}`;
      const name = o.customer_name || 'Retail Customer';
      const custType = o.order_type === 'wholesale' ? 'wholesale' : 'retail';

      await query(
        `INSERT INTO customers (
          customer_code, customer_type, name, phone, email, shipping_address, pincode, acquisition_source, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'website', $8)
        ON CONFLICT (customer_code) DO NOTHING`,
        [code, custType, name, phone, o.customer_email || null, o.shipping_address || null, o.destination_pincode || null, o.created_at]
      );
    }
  }

  // 3. Backfill Customers from Wholesale Quotations
  const quotations = await query<{
    contact_phone: string;
    company_name: string;
    contact_person: string;
    contact_email: string;
    destination_city: string;
    destination_pincode: string;
    delivery_address: string;
    created_at: string;
  }>(`
    SELECT contact_phone, company_name, contact_person, contact_email, destination_city, destination_pincode, delivery_address, MIN(created_at) as created_at
    FROM wholesale_quotations
    WHERE contact_phone IS NOT NULL AND TRIM(contact_phone) != ''
    GROUP BY contact_phone, company_name, contact_person, contact_email, destination_city, destination_pincode, delivery_address
  `);

  for (const q of quotations) {
    const phone = normalizePhone(q.contact_phone);
    if (!phone || phone.length < 10) continue;

    const existing = await query<{ id: string; customer_type: string }>('SELECT id, customer_type FROM customers WHERE phone = $1', [phone]);
    if (existing.length === 0) {
      customerSeq++;
      const code = `CUST-${customerSeq}`;
      const name = q.contact_person || q.company_name || 'Wholesale Buyer';
      await query(
        `INSERT INTO customers (
          customer_code, customer_type, name, company_name, contact_person, phone, email, shipping_address, city, pincode, acquisition_source, created_at
        ) VALUES ($1, 'wholesale', $2, $3, $4, $5, $6, $7, $8, $9, 'mandi_outreach', $10)
        ON CONFLICT (customer_code) DO NOTHING`,
        [code, name, q.company_name || null, q.contact_person || null, phone, q.contact_email || null, q.delivery_address || null, q.destination_city || null, q.destination_pincode || null, q.created_at]
      );
    } else {
      // Upgrade customer record with company details if missing
      await query(
        `UPDATE customers
         SET company_name = COALESCE(company_name, $1),
             contact_person = COALESCE(contact_person, $2),
             city = COALESCE(city, $3),
             customer_type = CASE WHEN customer_type = 'retail' THEN 'wholesale' ELSE customer_type END
         WHERE id = $4`,
        [q.company_name || null, q.contact_person || null, q.destination_city || null, existing[0].id]
      );
    }
  }

  // 4. Link orders.customer_id
  console.log('Linking orders to customers by phone number...');
  await query(`
    UPDATE orders o
    SET customer_id = c.id
    FROM customers c
    WHERE RIGHT(REGEXP_REPLACE(o.customer_phone, '\\D', '', 'g'), 10) = c.phone
      AND o.customer_id IS NULL
  `);

  // 5. Backfill shipments from orders that have tracking_reference
  console.log('Backfilling shipments from existing dispatched/delivered orders...');
  const ordersWithTracking = await query<{
    id: string;
    customer_id: string;
    order_number: string;
    tracking_reference: string;
    status: string;
    shipping_address: string;
    destination_pincode: string;
    created_at: string;
  }>(`
    SELECT id, customer_id, order_number, tracking_reference, status, shipping_address, destination_pincode, created_at
    FROM orders
    WHERE tracking_reference IS NOT NULL AND TRIM(tracking_reference) != ''
  `);

  let shpCount = 0;
  for (const o of ordersWithTracking) {
    const existing = await query<{ id: string }>('SELECT id FROM shipments WHERE order_id = $1', [o.id]);
    if (existing.length === 0) {
      shpCount++;
      const shpNum = `SHP-${o.order_number.replace(/^AGR-/, '')}`;
      const partner = o.tracking_reference.startsWith('SR') ? 'Shiprocket' : o.tracking_reference.startsWith('DL') ? 'Delhivery' : 'Direct Farm Fleet';
      const shpStatus = o.status === 'delivered' ? 'delivered' : 'in_transit';

      const inserted = await query<{ id: string }>(
        `INSERT INTO shipments (
          shipment_number, order_id, customer_id, delivery_partner, shipment_type, tracking_number,
          tracking_url, status, destination, destination_pincode, dispatch_date, actual_delivery_date, created_by_name
        ) VALUES (
          $1, $2, $3, $4, 'courier', $5,
          $6, $7, $8, $9, $10, $11, 'Operations System'
        ) RETURNING id`,
        [
          shpNum, o.id, o.customer_id || null, partner, o.tracking_reference,
          `https://shiprocket.co/tracking/${o.tracking_reference}`, shpStatus,
          o.shipping_address || 'Regional Delivery', o.destination_pincode || null,
          o.created_at, o.status === 'delivered' ? o.created_at : null
        ]
      );

      if (inserted.length > 0) {
        await query(
          `INSERT INTO shipment_tracking_events (shipment_id, status, description, source, created_by_name)
           VALUES ($1, $2, $3, 'manual', 'Operations System')`,
          [inserted[0].id, shpStatus, `Initial shipment dispatched with reference ${o.tracking_reference}`]
        );
      }
    }
  }

  console.log(`✅ Backfilled ${shpCount} shipments with tracking events.`);

  const totalCust = await query<{ count: string }>('SELECT count(*) as count FROM customers');
  const linkedOrders = await query<{ count: string }>('SELECT count(*) as count FROM orders WHERE customer_id IS NOT NULL');
  console.log(`🎉 Migration complete!`);
  console.log(`Total Customers in Centralized DB: ${totalCust[0].count}`);
  console.log(`Orders linked to Customers: ${linkedOrders[0].count}`);
}

runMigration()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal Migration Error:', e);
    process.exit(1);
  });
