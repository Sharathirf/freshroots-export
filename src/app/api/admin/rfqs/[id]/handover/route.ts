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
      action = 'initiate', // 'initiate' or 'acknowledge'
      initiated_by = 'Commercial Lead',
      operations_owner,
      product_specs,
      packaging_requirements,
      delivery_commitments,
      quality_requirements,
      buyer_discussions_summary,
      outstanding_questions,
      required_ops_actions,
      acknowledgement_comments,
      acknowledged_by = 'Operations Lead'
    } = body;

    const rfqRows = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const rfq = rfqRows[0];

    if (action === 'initiate') {
      if (!operations_owner || !operations_owner.trim()) {
        return NextResponse.json({ success: false, error: 'An Operations Owner must be assigned for handover' }, { status: 400 });
      }

      // Insert or update handover
      const handover = await query(
        `INSERT INTO b2b_handovers (
          rfq_id, initiated_by, operations_owner, product_specs,
          confirmed_quantity, unit, quotation_revision, destination,
          commercial_terms, payment_terms, packaging_requirements,
          delivery_commitments, quality_requirements, buyer_discussions_summary,
          outstanding_questions, required_ops_actions, handover_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending_acknowledgement', NOW())
        RETURNING *`,
        [
          id,
          initiated_by,
          operations_owner.trim(),
          product_specs || `${rfq.product_title} (${rfq.requested_quantity} ${rfq.unit})`,
          rfq.requested_quantity,
          rfq.unit,
          rfq.revision_number || 1,
          `${rfq.destination_city || ''} (${rfq.destination_pincode || ''})`,
          `Quotation ${rfq.quote_number} total ₹${rfq.total_quote_inr}`,
          'Commercial milestone terms',
          packaging_requirements || 'Standard agricultural mesh bags with moisture grading seals',
          delivery_commitments || 'Direct surface freight from Kikkeri Mandi Yard',
          quality_requirements || 'Grade A inspection: Moisture ≤ 5.5%, cracked nuts write-off',
          buyer_discussions_summary || 'Quotation accepted by buyer',
          outstanding_questions || null,
          required_ops_actions || 'Sourcing, quality grading, and transporter dispatch assignment'
        ]
      );

      // Update wholesale_quotations operational owner
      await query(
        `UPDATE wholesale_quotations
         SET operations_owner_name = $1,
             fulfilment_status = 'procurement_in_progress',
             updated_at = NOW()
         WHERE id = $2`,
        [operations_owner.trim(), id]
      );

      // Log activity
      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'handover_initiated',
        activityTitle: `Sales-to-Operations handover initiated by ${initiated_by}`,
        description: `Assigned Operations Owner: ${operations_owner}. Packaging: ${packaging_requirements || 'Standard'}.`,
        comments: required_ops_actions || null,
        actingUser: initiated_by,
        actorRole: 'sales',
        visibility: 'ops_update'
      });

      return NextResponse.json({ success: true, handover: handover[0] });
    } else if (action === 'acknowledge') {
      const existing = await query(`SELECT id FROM b2b_handovers WHERE rfq_id = $1 ORDER BY created_at DESC LIMIT 1`, [id]);
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: 'No pending handover found for this quotation' }, { status: 404 });
      }

      const updatedHandover = await query(
        `UPDATE b2b_handovers
         SET handover_status = 'acknowledged',
             acknowledged_by = $1,
             acknowledged_at = NOW(),
             acknowledgement_comments = $2
         WHERE id = $3
         RETURNING *`,
        [acknowledged_by, acknowledgement_comments || 'Handover verified and accepted into yard queue.', existing[0].id]
      );

      // Initialize fulfilment record if none exists yet
      await query(
        `INSERT INTO b2b_fulfilments (
          rfq_id, procurement_status, quality_status, dispatch_status, delivery_status, created_at, updated_at
        ) VALUES ($1, 'in_progress', 'pending', 'pending', 'pending', NOW(), NOW())
        ON CONFLICT DO NOTHING`,
        [id]
      );

      // Log activity
      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'handover_accepted',
        activityTitle: `Operations Handover acknowledged by ${acknowledged_by}`,
        description: acknowledgement_comments || 'Consignment entered procurement and fulfillment queue.',
        actingUser: acknowledged_by,
        actorRole: 'operations',
        visibility: 'ops_update'
      });

      return NextResponse.json({ success: true, handover: updatedHandover[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid handover action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/handover (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process handover', details: error.message },
      { status: 500 }
    );
  }
}
