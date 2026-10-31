import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { order_number, customer_phone, payment_reference, comment } = body;

    if (!order_number || !payment_reference) {
      return NextResponse.json(
        { success: false, error: 'Order Number and UPI UTR / Payment Reference are required.' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Look up order
    const res = await client.query(
      `SELECT * FROM orders WHERE order_number = $1 FOR UPDATE`,
      [order_number.trim()]
    );

    if (res.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: `Order ${order_number} not found.` },
        { status: 404 }
      );
    }

    const order = res.rows[0];

    // Verify phone matches if phone was provided
    if (customer_phone && customer_phone.trim()) {
      const cleanInput = customer_phone.replace(/\D/g, '').slice(-10);
      const cleanOrderPhone = (order.customer_phone || '').replace(/\D/g, '').slice(-10);
      if (cleanInput && cleanOrderPhone && cleanInput !== cleanOrderPhone) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Phone number does not match the contact number on this order.' },
          { status: 403 }
        );
      }
    }

    const noteEntry = `[Customer UPI Payment Update: UTR ${payment_reference.trim()}${
      comment?.trim() ? ` | Comment: ${comment.trim()}` : ''
    } | At: ${new Date().toISOString()}]`;

    const existingNotes = order.admin_notes || '';
    const updatedNotes = existingNotes ? `${existingNotes} | ${noteEntry}` : noteEntry;

    // Advance to 'paid' if currently pending
    const newStatus = order.status === 'pending_payment' || order.status === 'pending' || order.status === 'draft'
      ? 'paid'
      : order.status;

    const updated = await client.query(
      `UPDATE orders
       SET payment_reference = $1,
           payment_status = 'paid',
           status = $2,
           admin_notes = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [payment_reference.trim(), newStatus, updatedNotes, order.id]
    );

    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('CUSTOMER_UPI_PAYMENT_CONFIRMED', 'orders', $1, $2)`,
      [
        order.id,
        JSON.stringify({
          order_number: order.order_number,
          utr: payment_reference.trim(),
          comment: comment || null,
          previous_status: order.status,
          new_status: newStatus,
        }),
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Payment reference and comments recorded successfully! Your order has been confirmed.',
      order: updated.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment reference', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
