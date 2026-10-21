import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

export async function GET() {
  try {
    const orders = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('API Error in /api/admin/orders (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, next_status, tracking_reference } = body;

    if (!id || !next_status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and next_status are required' },
        { status: 400 }
      );
    }

    const currentOrder = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (currentOrder.length === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const o = currentOrder[0];
    const allowed = VALID_TRANSITIONS[o.status as OrderStatus] || [];

    if (!allowed.includes(next_status as OrderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition: Cannot move from '${o.status}' to '${next_status}'. Allowed transitions: ${allowed.join(', ') || 'None'}`
        },
        { status: 400 }
      );
    }

    // If order moved to dispatched and has items, move reserved_quantity to final deductions
    if (next_status === 'dispatched') {
      const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
      for (const item of items) {
        await query(
          `UPDATE inventory_batches 
           SET reserved_quantity = GREATEST(0, reserved_quantity - $1)
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    // If order is cancelled, restore reserved_quantity back to available_quantity
    if (next_status === 'cancelled') {
      const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
      for (const item of items) {
        await query(
          `UPDATE inventory_batches 
           SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
               available_quantity = available_quantity + $1
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    const updated = await query(
      `UPDATE orders 
       SET status = $1,
           tracking_reference = COALESCE($2, tracking_reference),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [next_status, tracking_reference || null, id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('ORDER_STATUS_CHANGED', 'orders', $1, $2)`,
      [id, JSON.stringify({ from: o.status, to: next_status, order_number: o.order_number })]
    );

    return NextResponse.json({ success: true, order: updated[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/orders (PATCH):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order state', details: error.message },
      { status: 500 }
    );
  }
}
