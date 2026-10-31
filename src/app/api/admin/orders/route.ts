import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import pool, { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { OrderStatus } from '@/types';

// Valid order status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'cancelled'],
  paid: ['allocated', 'cancelled', 'refunded'],
  allocated: ['packed', 'cancelled'],
  packed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: []
};

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    const orders = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('API Error in /api/admin/orders (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/orders', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, next_status, tracking_reference, carrier_name, payment_status, admin_notes } = body;

    if (!id || !next_status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and next_status are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');
    const currentOrder = await client.query(`SELECT * FROM orders WHERE id = $1 FOR UPDATE`, [id]);
    if (currentOrder.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const o = currentOrder.rows[0];
    const allowed = VALID_TRANSITIONS[o.status as OrderStatus] || [];

    if (!allowed.includes(next_status as OrderStatus)) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition: Cannot move from '${o.status}' to '${next_status}'. Allowed transitions: ${allowed.join(', ') || 'None'}`
        },
        { status: 400 }
      );
    }

    const reservations = await client.query<{ batch_id: string; quantity: number }>(
      `SELECT batch_id, quantity FROM order_inventory_reservations
       WHERE order_id = $1 AND status = 'reserved' FOR UPDATE`,
      [id]
    );
    const shouldReleaseReservation = next_status === 'cancelled' || next_status === 'refunded';
    if (reservations.rows.length && (next_status === 'dispatched' || shouldReleaseReservation)) {
      for (const reservation of reservations.rows) {
        await client.query(
          `UPDATE inventory_batches
           SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
               available_quantity = available_quantity + CASE WHEN $3 THEN $1 ELSE 0 END
           WHERE id = $2`,
          [reservation.quantity, reservation.batch_id, shouldReleaseReservation]
        );
      }
      await client.query(
        `UPDATE order_inventory_reservations
         SET status = $2, updated_at = NOW()
         WHERE order_id = $1 AND status = 'reserved'`,
        [id, shouldReleaseReservation ? 'released' : 'fulfilled']
      );
    } else if (!reservations.rows.length && (next_status === 'dispatched' || shouldReleaseReservation)) {
      // Historical orders predate per-order reservations. Preserve their old stock reconciliation path.
      const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
      for (const item of items) {
        await client.query(
          `UPDATE inventory_batches
           SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
               available_quantity = available_quantity + CASE WHEN $3 THEN $1 ELSE 0 END
           WHERE product_id = $2`,
          [item.quantity, item.product_id, shouldReleaseReservation]
        );
      }
    }

    const newNotes = admin_notes && typeof admin_notes === 'string' && admin_notes.trim()
      ? (o.admin_notes ? `${o.admin_notes} | [${new Date().toISOString().slice(0, 16)}] ${admin_notes.trim()}` : admin_notes.trim())
      : o.admin_notes;

    const newPaymentStatus = payment_status || (next_status === 'paid' ? 'paid' : o.payment_status);

    const updated = await client.query(
      `UPDATE orders 
       SET status = $1,
           tracking_reference = COALESCE($2, tracking_reference),
           carrier_name = COALESCE($3, carrier_name),
           payment_status = $4,
           admin_notes = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [next_status, tracking_reference || null, carrier_name || null, newPaymentStatus, newNotes, id]
    );

    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('ORDER_STATUS_CHANGED', 'orders', $1, $2)`,
      [id, JSON.stringify({ from: o.status, to: next_status, order_number: o.order_number, comment: admin_notes || null })]
    );

    await client.query('COMMIT');

    return NextResponse.json({ success: true, order: updated.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('API Error in /api/admin/orders (PATCH):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/orders', method: 'PATCH' } });
    return NextResponse.json(
      { success: false, error: 'Failed to update order state', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
