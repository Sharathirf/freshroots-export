import pool from '../../src/lib/db';

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount_inr: string | number;
  status: string;
  payment_status: string;
  fulfilment_status: string;
  created_at: Date;
}

export interface RfqRow {
  id: string;
  quote_number: string;
  contact_person: string;
  contact_phone: string | null;
  contact_email: string | null;
  product_title: string;
  requested_quantity: number;
  status: string;
  created_at: Date;
}

export interface UserRow {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  role: string;
}

export async function getOrderFromDb(orderNumber: string): Promise<OrderRow | null> {
  const res = await pool.query('SELECT * FROM orders WHERE order_number = $1 LIMIT 1', [orderNumber]);
  return res.rows[0] || null;
}

export async function getRfqFromDb(quoteNumber: string): Promise<RfqRow | null> {
  const res = await pool.query('SELECT * FROM wholesale_quotations WHERE quote_number = $1 LIMIT 1', [quoteNumber]);
  return res.rows[0] || null;
}

export async function getUserFromDb(phone: string): Promise<UserRow | null> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const res = await pool.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [cleanPhone]);
  return res.rows[0] || null;
}

export async function getAuditLogs(actionPrefix: string): Promise<any[]> {
  const res = await pool.query(
    'SELECT * FROM audit_logs WHERE action ILIKE $1 ORDER BY created_at DESC LIMIT 20',
    [`%${actionPrefix}%`]
  );
  return res.rows;
}

export async function getTableCounts(): Promise<Record<string, number>> {
  const tables = ['orders', 'wholesale_quotations', 'users', 'customers', 'shipments', 'abandoned_carts'];
  const counts: Record<string, number> = {};
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*)::int as count FROM ${t}`);
    counts[t] = res.rows[0].count;
  }
  return counts;
}
