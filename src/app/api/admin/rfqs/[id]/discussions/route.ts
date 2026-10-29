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
      communication_channel,
      channel_other_explanation,
      employee_name = 'Commercial Desk',
      employee_role = 'sales',
      buyer_contact_person,
      discussion_summary,
      buyer_concerns,
      price_changes_requested,
      spec_changes_requested,
      delivery_terms,
      payment_terms,
      commercial_commitments,
      outstanding_questions,
      next_action,
      followup_due_date,
      responsible_employee,
      visibility = 'internal_note'
    } = body;

    // Validations
    if (!communication_channel) {
      return NextResponse.json({ success: false, error: 'Communication channel is required' }, { status: 400 });
    }
    if (communication_channel === 'other' && (!channel_other_explanation || !channel_other_explanation.trim())) {
      return NextResponse.json({ success: false, error: 'Explanation is mandatory when channel is "other"' }, { status: 400 });
    }
    if (!discussion_summary || !discussion_summary.trim()) {
      return NextResponse.json({ success: false, error: 'Discussion summary is mandatory' }, { status: 400 });
    }
    if (!buyer_contact_person || !buyer_contact_person.trim()) {
      return NextResponse.json({ success: false, error: 'Buyer contact person is required' }, { status: 400 });
    }

    // Verify RFQ exists
    const rfqCheck = await query(`SELECT quote_number, revision_number FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqCheck.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const rfq = rfqCheck[0];

    // Insert discussion
    const inserted = await query(
      `INSERT INTO rfq_discussions (
        rfq_id, discussion_date, communication_channel, channel_other_explanation,
        employee_name, employee_role, buyer_contact_person, discussion_summary,
        buyer_concerns, price_changes_requested, spec_changes_requested,
        delivery_terms, payment_terms, commercial_commitments,
        outstanding_questions, next_action, followup_due_date,
        responsible_employee, visibility, created_at
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
      RETURNING *`,
      [
        id,
        communication_channel,
        channel_other_explanation || null,
        employee_name,
        employee_role,
        buyer_contact_person,
        discussion_summary.trim(),
        buyer_concerns || null,
        price_changes_requested || null,
        spec_changes_requested || null,
        delivery_terms || null,
        payment_terms || null,
        commercial_commitments || null,
        outstanding_questions || null,
        next_action || null,
        followup_due_date || null,
        responsible_employee || employee_name,
        visibility
      ]
    );

    // If a follow-up date was set, also create a follow-up task automatically!
    if (followup_due_date) {
      await query(
        `INSERT INTO b2b_followups (
          rfq_id, followup_type, due_date, responsible_employee, assigned_by, notes, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
        [
          id,
          communication_channel === 'whatsapp' ? 'whatsapp' : 'phone_call',
          followup_due_date,
          responsible_employee || employee_name,
          employee_name,
          `Follow up after discussion: ${discussion_summary.slice(0, 100)}`
        ]
      );
    }

    // Log to activity timeline
    await logRfqActivity({
      rfqId: id,
      quotationRevision: rfq.revision_number || 1,
      activityType: 'discussion_recorded',
      activityTitle: `${communication_channel.toUpperCase()} discussion logged with ${buyer_contact_person}`,
      description: discussion_summary,
      comments: commercial_commitments || buyer_concerns || null,
      communicationSource: communication_channel,
      actingUser: employee_name,
      actorRole: employee_role,
      visibility
    });

    return NextResponse.json({ success: true, discussion: inserted[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/discussions (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record discussion', details: error.message },
      { status: 500 }
    );
  }
}
