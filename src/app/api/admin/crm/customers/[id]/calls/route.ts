import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const { id: customerId } = await params;
    const body = await request.json();

    const {
      order_id,
      call_type,
      call_outcome,
      summary,
      rep_name,
      reorder_interest = false,
      requested_products = [],
      next_action,
      next_action_due,
      internal_notes,
    } = body;

    if (!call_type || !call_outcome || !summary || !summary.trim() || !rep_name) {
      return NextResponse.json(
        { success: false, error: 'Call type, outcome, summary, and representative name are required' },
        { status: 400 }
      );
    }

    const inserted = await query(
      `INSERT INTO customer_calls (
        customer_id, order_id, call_type, call_outcome, summary, rep_name,
        reorder_interest, requested_products, next_action, next_action_due, internal_notes, call_date, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING *`,
      [
        customerId,
        order_id || null,
        call_type,
        call_outcome,
        summary.trim(),
        rep_name.trim(),
        reorder_interest,
        JSON.stringify(requested_products),
        next_action || null,
        next_action_due || null,
        internal_notes || null,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('CUSTOMER_CALL_RECORDED', 'customers', $1, $2)`,
      [
        customerId,
        JSON.stringify({
          call_id: inserted[0].id,
          type: call_type,
          outcome: call_outcome,
          rep: rep_name,
        }),
      ]
    );

    return NextResponse.json({ success: true, call: inserted[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id]/calls (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]/calls', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to record customer call', details: error.message },
      { status: 500 }
    );
  }
}
