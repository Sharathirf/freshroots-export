import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { formatCustomerNotification } from '@/lib/crm-constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow admin or webhook signature
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  const client = await pool.connect();
  try {
    const { id: shipmentId } = await params;
    const body = await request.json();

    const {
      status,
      description,
      location,
      source = 'manual',
      created_by_name = 'Logistics Officer',
      delivered_to_name,
      pod_reference,
      exception_reason,
    } = body;

    if (!status || !description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Status and event description are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const shpRes = await client.query('SELECT * FROM shipments WHERE id = $1 FOR UPDATE', [shipmentId]);
    if (shpRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    const shp = shpRes.rows[0];
    const isDelivered = status === 'delivered';

    // Insert tracking event
    const eventRes = await client.query(
      `INSERT INTO shipment_tracking_events (
        shipment_id, status, description, location, source, created_by_name, event_timestamp, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      ) RETURNING *`,
      [shipmentId, status, description.trim(), location || null, source, created_by_name]
    );

    // Update shipment
    const updatedShp = await client.query(
      `UPDATE shipments
       SET status = $1,
           actual_delivery_date = CASE WHEN $2 THEN NOW() ELSE actual_delivery_date END,
           delivered_to_name = COALESCE($3, delivered_to_name),
           pod_reference = COALESCE($4, pod_reference),
           exception_reason = COALESCE($5, exception_reason),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status, isDelivered, delivered_to_name || null, pod_reference || null, exception_reason || null, shipmentId]
    );

    // If delivered, update order status
    if (isDelivered) {
      await client.query(
        `UPDATE orders
         SET status = 'delivered',
             fulfilment_status = 'delivered',
             updated_at = NOW()
         WHERE id = $1`,
        [shp.order_id]
      );

      // Fetch order for customer notification
      const ordRes = await client.query('SELECT * FROM orders WHERE id = $1', [shp.order_id]);
      if (ordRes.rows.length > 0) {
        const order = ordRes.rows[0];
        const notif = formatCustomerNotification('order_delivered', {
          order_number: order.order_number,
          customer_name: order.customer_name,
        });

        const notifKey = `notif_${shipmentId}_delivered`;
        await client.query(
          `INSERT INTO customer_notifications (
            customer_id, order_id, shipment_id, channel, event_type, recipient, title, message, status, idempotency_key
          ) VALUES ($1, $2, $3, 'whatsapp', 'order_delivered', $4, $5, $6, 'sent', $7)
          ON CONFLICT (idempotency_key) DO NOTHING`,
          [shp.customer_id, shp.order_id, shipmentId, order.customer_phone, notif.title, notif.message, notifKey]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      event: eventRes.rows[0],
      shipment: updatedShp.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('API Error in /api/admin/crm/shipments/[id]/events (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/shipments/[id]/events', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to record tracking event', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
