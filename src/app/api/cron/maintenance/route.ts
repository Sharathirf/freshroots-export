import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import pool from '@/lib/db';
import { getDailyMandiPrice } from '@/lib/mandi-prices';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!secret || !supplied) return false;
  const expectedDigest = createHmac('sha256', 'cron-auth').update(secret).digest();
  const suppliedDigest = createHmac('sha256', 'cron-auth').update(supplied).digest();
  return timingSafeEqual(expectedDigest, suppliedDigest);
}

async function releaseExpiredOrders() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const expired = await client.query<{ id: string; order_number: string }>(
      `SELECT id, order_number FROM orders
       WHERE status = 'pending_payment' AND payment_expires_at <= NOW()
       ORDER BY payment_expires_at ASC
       LIMIT 100 FOR UPDATE SKIP LOCKED`
    );
    for (const order of expired.rows) {
      const reservations = await client.query<{ batch_id: string; quantity: number }>(
        `SELECT batch_id, quantity FROM order_inventory_reservations
         WHERE order_id = $1 AND status = 'reserved' FOR UPDATE`,
        [order.id]
      );
      for (const reservation of reservations.rows) {
        await client.query(
          `UPDATE inventory_batches
           SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
               available_quantity = available_quantity + $1
           WHERE id = $2`,
          [reservation.quantity, reservation.batch_id]
        );
      }
      await client.query(
        `UPDATE order_inventory_reservations
         SET status = 'released', updated_at = NOW()
         WHERE order_id = $1 AND status = 'reserved'`,
        [order.id]
      );
      await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND status = 'pending_payment'`,
        [order.id]
      );
      await client.query(
        `UPDATE payment_attempts SET status = 'failed', updated_at = NOW()
         WHERE order_id = $1 AND status IN ('created', 'authorized')`,
        [order.id]
      );
      await client.query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('UNPAID_ORDER_EXPIRED', 'orders', $1, $2)`,
        [order.id, JSON.stringify({ order_number: order.order_number })]
      );
    }
    await client.query('COMMIT');
    return expired.rows.length;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function handle(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const expiredOrders = await releaseExpiredOrders();
    const [copra, arecanut] = await Promise.all([
      getDailyMandiPrice('copra'),
      getDailyMandiPrice('arecanut'),
    ]);
    return NextResponse.json({
      success: true,
      expiredOrders,
      mandi: {
        copra: { checkedOn: copra.checkedOn, reportedAt: copra.reportedAt, stale: copra.isFallback },
        arecanut: { checkedOn: arecanut.checkedOn, reportedAt: arecanut.reportedAt, stale: arecanut.isFallback },
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Scheduled maintenance failed:', error);
    Sentry.captureException(error, { tags: { route: '/api/cron/maintenance' } });
    return NextResponse.json({ success: false, error: 'Scheduled maintenance failed.' }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
