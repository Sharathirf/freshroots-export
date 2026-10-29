import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminOrder } from '@/lib/crm-service';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const channel = searchParams.get('channel') || undefined; // retail, wholesale, export
    const source = searchParams.get('source') || undefined; // phone, whatsapp, website, etc.
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT o.*,
             c.customer_code,
             c.customer_type as linked_customer_type,
             c.company_name as customer_company
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (search && search.trim()) {
      sql += ` AND (o.order_number ILIKE $${pIdx} OR o.customer_name ILIKE $${pIdx} OR o.customer_phone ILIKE $${pIdx} OR o.tracking_reference ILIKE $${pIdx} OR c.customer_code ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (channel && channel !== 'all') {
      sql += ` AND (o.order_channel = $${pIdx} OR o.order_type = $${pIdx})`;
      params.push(channel);
      pIdx++;
    }

    if (source && source !== 'all') {
      sql += ` AND o.order_source = $${pIdx}`;
      params.push(source);
      pIdx++;
    }

    if (status && status !== 'all') {
      sql += ` AND o.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    sql += ` ORDER BY o.created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
    params.push(limit, offset);

    const orders = await query(sql, params);

    // Summary counts
    const counts = await query<{
      retail_count: string;
      wholesale_count: string;
      phone_count: string;
      whatsapp_count: string;
      dispatched_count: string;
      delivered_count: string;
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE order_channel = 'retail' OR order_type = 'retail') as retail_count,
        COUNT(*) FILTER (WHERE order_channel = 'wholesale' OR order_type = 'wholesale') as wholesale_count,
        COUNT(*) FILTER (WHERE order_source = 'phone') as phone_count,
        COUNT(*) FILTER (WHERE order_source = 'whatsapp') as whatsapp_count,
        COUNT(*) FILTER (WHERE status = 'dispatched') as dispatched_count,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_count
      FROM orders
    `);

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      metrics: {
        retail: Number(counts[0]?.retail_count || 0),
        wholesale: Number(counts[0]?.wholesale_count || 0),
        phone: Number(counts[0]?.phone_count || 0),
        whatsapp: Number(counts[0]?.whatsapp_count || 0),
        dispatched: Number(counts[0]?.dispatched_count || 0),
        delivered: Number(counts[0]?.delivered_count || 0),
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/orders (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/orders', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      destination_pincode,
      order_source,
      order_channel = 'retail',
      customer_consent_source,
      admin_notes,
      items,
      subtotal_inr,
      delivery_fee_inr = 0,
      tax_inr = 0,
      total_amount_inr,
      payment_method = 'upi_manual',
      payment_status = 'paid',
      initial_status = 'paid',
      admin_user_name = 'Admin Desk Officer',
    } = body;

    if (!customer_name || !customer_phone || !shipping_address || !destination_pincode) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, shipping address, and destination PIN code are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one product item' },
        { status: 400 }
      );
    }

    if (!order_source) {
      return NextResponse.json(
        { success: false, error: 'Order source (phone, whatsapp, email, in_person) is required' },
        { status: 400 }
      );
    }

    if (!customer_consent_source || !customer_consent_source.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mandatory customer consent verification note is required before placing offline order' },
        { status: 400 }
      );
    }

    const order = await createAdminOrder({
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      destination_pincode,
      order_source,
      order_channel,
      customer_consent_source,
      admin_notes,
      items,
      subtotal_inr: Number(subtotal_inr),
      delivery_fee_inr: Number(delivery_fee_inr),
      tax_inr: Number(tax_inr),
      total_amount_inr: Number(total_amount_inr),
      payment_method,
      payment_status,
      initial_status,
      admin_user_name,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/orders (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/orders', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
