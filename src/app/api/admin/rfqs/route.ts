import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, proposed_unit_price_inr, freight_charges_inr, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID is required' }, { status: 400 });
    }

    const currentQuote = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (currentQuote.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const q = currentQuote[0];
    const newUnitPrice = proposed_unit_price_inr !== undefined ? Number(proposed_unit_price_inr) : Number(q.proposed_unit_price_inr);
    const newFreight = freight_charges_inr !== undefined ? Number(freight_charges_inr) : Number(q.freight_charges_inr);
    const newTotal = (newUnitPrice * q.requested_quantity) + newFreight;
    const newStatus = status || q.status;

    const updated = await query(
      `UPDATE wholesale_quotations 
       SET proposed_unit_price_inr = $1,
           freight_charges_inr = $2,
           total_quote_inr = $3,
           status = $4,
           notes = COALESCE($5, notes),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [newUnitPrice, newFreight, newTotal, newStatus, admin_notes, id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('WHOLESALE_QUOTE_UPDATED', 'wholesale_quotations', $1, $2)`,
      [id, JSON.stringify({ old_status: q.status, new_status: newStatus, total: newTotal })]
    );

    return NextResponse.json({ success: true, quotation: updated[0] });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs (PATCH):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation', details: error.message },
      { status: 500 }
    );
  }
}
