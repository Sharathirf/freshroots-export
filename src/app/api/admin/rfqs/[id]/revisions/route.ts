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
      proposed_unit_price_inr,
      freight_charges_inr = 0,
      requested_quantity,
      change_reason,
      created_by = 'Commercial Desk',
      issue_immediately = true,
      valid_hours = 48,
      notes
    } = body;

    if (!proposed_unit_price_inr || Number(proposed_unit_price_inr) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid proposed unit price is required' }, { status: 400 });
    }
    if (!change_reason || !change_reason.trim()) {
      return NextResponse.json({ success: false, error: 'Reason for quotation revision is mandatory' }, { status: 400 });
    }

    // Fetch current quote
    const rfqRows = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const current = rfqRows[0];

    const currentRev = Number(current.revision_number || 1);
    const newRev = currentRev + 1;
    const qty = requested_quantity ? Number(requested_quantity) : Number(current.requested_quantity);
    const unitPrice = Number(proposed_unit_price_inr);
    const freight = Number(freight_charges_inr);
    const newTotal = (unitPrice * qty) + freight;
    const newStatus = issue_immediately ? 'revised_quotation_issued' : 'quotation_draft';

    // 1. Snapshot previous quotation revision into quotation_revisions table
    await query(
      `INSERT INTO quotation_revisions (
        rfq_id, revision_number, quote_number, proposed_unit_price_inr,
        freight_charges_inr, total_quote_inr, requested_quantity, unit,
        change_reason, created_by, status, valid_until, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
      [
        id,
        currentRev,
        current.quote_number,
        current.proposed_unit_price_inr || 0,
        current.freight_charges_inr || 0,
        current.total_quote_inr || 0,
        current.requested_quantity,
        current.unit,
        change_reason.trim(),
        created_by,
        current.status,
        current.valid_until,
        current.notes
      ]
    );

    // 2. Update wholesale_quotations with new revision details
    const validUntilDate = new Date(Date.now() + valid_hours * 60 * 60 * 1000).toISOString();
    const updated = await query(
      `UPDATE wholesale_quotations
       SET revision_number = $1,
           proposed_unit_price_inr = $2,
           freight_charges_inr = $3,
           total_quote_inr = $4,
           requested_quantity = $5,
           status = $6,
           valid_until = $7,
           notes = COALESCE($8, notes),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        newRev,
        unitPrice,
        freight,
        newTotal,
        qty,
        newStatus,
        validUntilDate,
        notes || null,
        id
      ]
    );

    // 3. Log to activity timeline
    await logRfqActivity({
      rfqId: id,
      quotationRevision: newRev,
      activityType: 'revised_quotation_issued',
      activityTitle: `Revised Quotation (Rev ${newRev}) created & issued for ₹${newTotal.toLocaleString('en-IN')}`,
      description: `Unit Price: ₹${unitPrice}/${current.unit} • Freight: ₹${freight} • Total: ₹${newTotal}`,
      previousStatus: current.status,
      newStatus: newStatus,
      comments: change_reason,
      reason: change_reason,
      actingUser: created_by,
      actorRole: 'quotation_manager',
      visibility: 'internal_note'
    });

    return NextResponse.json({
      success: true,
      quotation: updated[0],
      revision_number: newRev,
      message: `Revision ${newRev} created successfully.`
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/revisions (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation revision', details: error.message },
      { status: 500 }
    );
  }
}
