import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logRfqActivity } from '@/lib/b2b-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      action = 'schedule', // 'schedule' or 'complete'
      followup_id,
      followup_type = 'phone_call',
      due_date,
      responsible_employee = 'Commercial Desk',
      assigned_by = 'Sales Lead',
      notes,
      completion_notes
    } = body;

    const rfqRows = await query(`SELECT quote_number, revision_number FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const rfq = rfqRows[0];

    if (action === 'schedule') {
      if (!due_date) {
        return NextResponse.json({ success: false, error: 'Follow-up due date is required' }, { status: 400 });
      }

      const inserted = await query(
        `INSERT INTO b2b_followups (
          rfq_id, followup_type, due_date, responsible_employee, assigned_by, notes, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
        RETURNING *`,
        [
          id,
          followup_type,
          due_date,
          responsible_employee.trim(),
          assigned_by.trim(),
          notes || null
        ]
      );

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'followup_scheduled',
        activityTitle: `Follow-up (${followup_type.replace(/_/g, ' ')}) scheduled for ${new Date(due_date).toLocaleDateString('en-IN')}`,
        description: `Assigned to: ${responsible_employee}. Notes: ${notes || 'Standard check-in.'}`,
        actingUser: assigned_by,
        actorRole: 'sales',
        visibility: 'internal_note'
      });

      return NextResponse.json({ success: true, followup: inserted[0] });
    }

    if (action === 'complete') {
      if (!followup_id) {
        return NextResponse.json({ success: false, error: 'Follow-up ID is required' }, { status: 400 });
      }

      const updated = await query(
        `UPDATE b2b_followups
         SET status = 'completed',
             completed_at = NOW(),
             completion_notes = $1
         WHERE id = $2 AND rfq_id = $3
         RETURNING *`,
        [completion_notes || 'Follow-up executed successfully.', followup_id, id]
      );

      if (updated.length === 0) {
        return NextResponse.json({ success: false, error: 'Follow-up not found' }, { status: 404 });
      }

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'followup_completed',
        activityTitle: `Follow-up marked complete by ${assigned_by}`,
        description: completion_notes || 'Outcome recorded in negotiations.',
        actingUser: assigned_by,
        actorRole: 'sales',
        visibility: 'internal_note'
      });

      return NextResponse.json({ success: true, followup: updated[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid follow-up action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/followups (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage follow-up', details: error.message },
      { status: 500 }
    );
  }
}
