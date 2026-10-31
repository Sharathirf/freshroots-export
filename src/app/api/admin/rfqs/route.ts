import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import {
  validateStatusTransition,
  logRfqActivity,
  REJECTION_CATEGORIES,
  RejectionCategory
} from '@/lib/b2b-workflow';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const stage = searchParams.get('stage')?.trim() || 'all';
    const owner = searchParams.get('owner')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    // 1. Text Search across quote number, company, contact person, phone, destination
    if (search) {
      whereConditions.push(
        `(q.quote_number ILIKE $${paramIndex} OR q.company_name ILIKE $${paramIndex} OR q.contact_person ILIKE $${paramIndex} OR q.contact_phone ILIKE $${paramIndex} OR q.destination_city ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 2. Exact Status Filter
    if (status && status !== 'all') {
      whereConditions.push(`q.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // 3. Stage Filter (Stage A: Intake, Stage B: Quotation, Stage C: Fulfilment, Closed)
    if (stage === 'intake') {
      whereConditions.push(`q.status IN ('submitted', 'new_rfq', 'under_review', 'needs_information', 'ready_to_quote', 'on_hold')`);
    } else if (stage === 'quotation') {
      whereConditions.push(`q.status IN ('quotation_draft', 'pending_approval', 'quote_issued', 'discussion_in_progress', 'revision_requested', 'revised_quotation_issued')`);
    } else if (stage === 'fulfilment') {
      whereConditions.push(`q.status = 'accepted'`);
    } else if (stage === 'closed') {
      whereConditions.push(`q.status IN ('rejected', 'cancelled', 'expired')`);
    }

    // 4. Owner Filter
    if (owner && owner !== 'all') {
      whereConditions.push(`(q.sales_owner_name = $${paramIndex} OR q.operations_owner_name = $${paramIndex})`);
      params.push(owner);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Query quotations with subquery counts for activities, discussions, and pending follow-ups
    const sql = `
      SELECT 
        q.*,
        COALESCE(act.activity_count, 0)::int AS activity_count,
        COALESCE(disc.discussion_count, 0)::int AS discussion_count,
        COALESCE(fol.pending_followup_count, 0)::int AS pending_followup_count
      FROM wholesale_quotations q
      LEFT JOIN (
        SELECT rfq_id, COUNT(*) AS activity_count 
        FROM rfq_activities 
        GROUP BY rfq_id
      ) act ON act.rfq_id = q.id
      LEFT JOIN (
        SELECT rfq_id, COUNT(*) AS discussion_count 
        FROM rfq_discussions 
        GROUP BY rfq_id
      ) disc ON disc.rfq_id = q.id
      LEFT JOIN (
        SELECT rfq_id, COUNT(*) AS pending_followup_count 
        FROM b2b_followups 
        WHERE status = 'pending' 
        GROUP BY rfq_id
      ) fol ON fol.rfq_id = q.id
      WHERE ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const quotations = await query(sql, params);

    // Compute live pipeline aggregate metrics
    const metricsRow = await query(`
      SELECT
        COUNT(*) AS total_rfqs,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'new_rfq')) AS new_rfqs,
        COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
        COUNT(*) FILTER (WHERE status IN ('quote_issued', 'revised_quotation_issued')) AS quotations_awaiting_response,
        COUNT(*) FILTER (WHERE status = 'discussion_in_progress') AS discussions_in_progress,
        COUNT(*) FILTER (WHERE status = 'accepted') AS accepted_quotations,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_rfqs,
        COUNT(*) FILTER (WHERE status = 'accepted' AND fulfilment_status != 'completed') AS orders_in_fulfilment,
        COUNT(*) FILTER (WHERE fulfilment_status = 'delivered' OR fulfilment_status = 'completed') AS delivered_orders,
        COALESCE(SUM(total_quote_inr) FILTER (WHERE status NOT IN ('rejected', 'cancelled', 'expired')), 0)::numeric AS total_pipeline_value
      FROM wholesale_quotations
    `);

    return NextResponse.json({
      success: true,
      count: quotations.length,
      quotations,
      metrics: metricsRow[0] || {}
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve quotations', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const body = await request.json();
    const {
      id,
      status,
      proposed_unit_price_inr,
      freight_charges_inr,
      admin_notes,
      internal_notes,
      sales_owner_name,
      operations_owner_name,
      rejection_category,
      rejection_reason,
      rejection_notes,
      reopen_reason,
      actor_name = 'Admin / Commercial Desk',
      actor_role = 'admin',
      visibility = 'internal_note'
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID is required' }, { status: 400 });
    }

    const currentQuote = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (currentQuote.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const q = currentQuote[0];
    const prevStatus = q.status;
    const targetStatus = status || prevStatus;

    // 1. Validate State Transition
    if (targetStatus !== prevStatus) {
      const check = validateStatusTransition(prevStatus, targetStatus, actor_role, reopen_reason);
      if (!check.valid) {
        return NextResponse.json({ success: false, error: check.error }, { status: 400 });
      }
    }

    // 2. Validate Rejection Rules
    if (targetStatus === 'rejected') {
      if (!rejection_category || !REJECTION_CATEGORIES.includes(rejection_category as RejectionCategory)) {
        return NextResponse.json({
          success: false,
          error: `A valid rejection category is required. Options: ${REJECTION_CATEGORIES.join(', ')}`
        }, { status: 400 });
      }
      if (!rejection_reason || !rejection_reason.trim()) {
        return NextResponse.json({
          success: false,
          error: 'An explanatory rejection comment is mandatory and cannot be empty or whitespace.'
        }, { status: 400 });
      }
    }

    // 3. Pricing & Calculations
    const newUnitPrice = proposed_unit_price_inr !== undefined ? Number(proposed_unit_price_inr) : Number(q.proposed_unit_price_inr);
    const newFreight = freight_charges_inr !== undefined ? Number(freight_charges_inr) : Number(q.freight_charges_inr);
    const newTotal = (newUnitPrice * q.requested_quantity) + newFreight;

    // 4. Update wholesale_quotations record with explicit type casts to avoid PostgreSQL 42P08 parameter deduction errors
    const updated = await query(
      `UPDATE wholesale_quotations 
       SET proposed_unit_price_inr = $1,
           freight_charges_inr = $2,
           total_quote_inr = $3,
           status = $4::varchar,
           notes = COALESCE($5, notes),
           internal_notes = COALESCE($6, internal_notes),
           sales_owner_name = COALESCE($7, sales_owner_name),
           operations_owner_name = COALESCE($8, operations_owner_name),
           rejection_category = CASE WHEN $4::text = 'rejected' THEN $9 ELSE rejection_category END,
           rejection_reason = CASE WHEN $4::text = 'rejected' THEN $10 ELSE rejection_reason END,
           rejection_notes = CASE WHEN $4::text = 'rejected' THEN $11 ELSE rejection_notes END,
           rejection_actor = CASE WHEN $4::text = 'rejected' THEN $12 ELSE rejection_actor END,
           rejection_timestamp = CASE WHEN $4::text = 'rejected' THEN NOW() ELSE rejection_timestamp END,
           reopen_reason = CASE WHEN $13::text IS NOT NULL AND $13::text != '' THEN $13 ELSE reopen_reason END,
           reopened_by = CASE WHEN $13::text IS NOT NULL AND $13::text != '' THEN $12 ELSE reopened_by END,
           reopened_at = CASE WHEN $13::text IS NOT NULL AND $13::text != '' THEN NOW() ELSE reopened_at END,
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        newUnitPrice,
        newFreight,
        newTotal,
        targetStatus,
        admin_notes || null,
        internal_notes || null,
        sales_owner_name || null,
        operations_owner_name || null,
        rejection_category || null,
        rejection_reason || null,
        rejection_notes || null,
        actor_name,
        reopen_reason || null,
        id
      ]
    );

    // 5. Append Activity to RFQ Timeline
    let activityType = 'rfq_updated';
    let activityTitle = `RFQ updated by ${actor_name}`;
    let comments = admin_notes || internal_notes || null;
    let reason = null;

    if (targetStatus !== prevStatus) {
      if (targetStatus === 'rejected') {
        activityType = 'rfq_rejected';
        activityTitle = `RFQ rejected: ${rejection_category}`;
        reason = rejection_reason;
        comments = rejection_notes || rejection_reason;
      } else if (prevStatus === 'rejected' && targetStatus === 'under_review') {
        activityType = 'rfq_reopened';
        activityTitle = `Rejected RFQ reopened by ${actor_name}`;
        reason = reopen_reason;
      } else if (targetStatus === 'quote_issued') {
        activityType = 'quotation_issued';
        activityTitle = `Quotation ${q.quote_number} issued for ₹${newTotal.toLocaleString('en-IN')}`;
      } else if (targetStatus === 'accepted') {
        activityType = 'quotation_accepted';
        activityTitle = `Quotation ${q.quote_number} accepted by buyer`;
      } else {
        activityType = 'status_transition';
        activityTitle = `Status transitioned from ${prevStatus.replace(/_/g, ' ')} to ${targetStatus.replace(/_/g, ' ')}`;
      }
    } else if (sales_owner_name && sales_owner_name !== q.sales_owner_name) {
      activityType = 'owner_assigned';
      activityTitle = `Sales ownership assigned to ${sales_owner_name}`;
    }

    await logRfqActivity({
      rfqId: id,
      quotationRevision: q.revision_number || 1,
      activityType,
      activityTitle,
      previousStatus: prevStatus,
      newStatus: targetStatus,
      comments,
      reason,
      actingUser: actor_name,
      actorRole: actor_role,
      visibility: targetStatus === 'rejected' ? 'internal_note' : visibility
    });

    return NextResponse.json({ success: true, quotation: updated[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs (PATCH):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/rfqs', method: 'PATCH' } });
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation', details: error.message },
      { status: 500 }
    );
  }
}
