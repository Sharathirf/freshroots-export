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
      severity = 'medium',
      category,
      description,
      assigned_to,
      deadline,
    } = body;

    if (!category || !description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Complaint category and description are required' },
        { status: 400 }
      );
    }

    const complaintNum = `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inserted = await query(
      `INSERT INTO customer_complaints (
        complaint_number, customer_id, order_id, severity, category, description,
        assigned_to, deadline, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, 'open', NOW(), NOW()
      ) RETURNING *`,
      [
        complaintNum,
        customerId,
        order_id || null,
        severity,
        category,
        description.trim(),
        assigned_to || null,
        deadline || null,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('COMPLAINT_LOGGED', 'customer_complaints', $1, $2)`,
      [
        inserted[0].id,
        JSON.stringify({
          complaint_number: complaintNum,
          customer_id: customerId,
          severity,
          category,
        }),
      ]
    );

    return NextResponse.json({ success: true, complaint: inserted[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id]/complaints (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]/complaints', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to log complaint', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { complaint_id, status, resolution_notes, customer_acknowledgment, assigned_to } = body;

    if (!complaint_id) {
      return NextResponse.json({ success: false, error: 'complaint_id is required' }, { status: 400 });
    }

    const isResolving = status === 'resolved' || status === 'closed';

    const updated = await query(
      `UPDATE customer_complaints
       SET status = COALESCE($1, status),
           resolution_notes = COALESCE($2, resolution_notes),
           customer_acknowledgment = COALESCE($3, customer_acknowledgment),
           assigned_to = COALESCE($4, assigned_to),
           resolved_at = CASE WHEN $5 THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        status,
        resolution_notes,
        customer_acknowledgment,
        assigned_to,
        isResolving,
        complaint_id,
      ]
    );

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('COMPLAINT_STATUS_UPDATED', 'customer_complaints', $1, $2)`,
      [
        complaint_id,
        JSON.stringify({
          status,
          resolution: resolution_notes,
        }),
      ]
    );

    return NextResponse.json({ success: true, complaint: updated[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/customers/[id]/complaints (PATCH):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/customers/[id]/complaints', method: 'PATCH' } });
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint', details: error.message },
      { status: 500 }
    );
  }
}
