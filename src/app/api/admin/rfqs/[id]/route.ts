import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateOperationalSummary } from '@/lib/b2b-workflow';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await params;

    // 1. Fetch core RFQ
    const rfqRows = await query(
      `SELECT q.*, p.description as product_description, p.specifications as product_specs
       FROM wholesale_quotations q
       LEFT JOIN products p ON q.product_id = p.id
       WHERE q.id = $1`,
      [id]
    );

    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const rfq = rfqRows[0];

    // 2. Fetch parallel child records
    const [
      activities,
      discussions,
      revisions,
      handovers,
      fulfilments,
      payments,
      followups
    ] = await Promise.all([
      query(`SELECT * FROM rfq_activities WHERE rfq_id = $1 ORDER BY created_at DESC`, [id]),
      query(`SELECT * FROM rfq_discussions WHERE rfq_id = $1 ORDER BY discussion_date DESC`, [id]),
      query(`SELECT * FROM quotation_revisions WHERE rfq_id = $1 ORDER BY revision_number DESC`, [id]),
      query(`SELECT * FROM b2b_handovers WHERE rfq_id = $1 ORDER BY created_at DESC LIMIT 1`, [id]),
      query(`SELECT * FROM b2b_fulfilments WHERE rfq_id = $1 ORDER BY created_at DESC LIMIT 1`, [id]),
      query(`SELECT * FROM b2b_payments WHERE rfq_id = $1 ORDER BY payment_date DESC`, [id]),
      query(`SELECT * FROM b2b_followups WHERE rfq_id = $1 ORDER BY due_date ASC`, [id])
    ]);

    // 3. Financial calculations
    const totalPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount_paid_inr || 0), 0);
    const quoteTotal = Number(rfq.total_quote_inr || 0);
    const balanceDue = Math.max(0, quoteTotal - totalPaid);

    // 4. Operational Handover Summary (derived from real DB records)
    const latestDiscussion = discussions[0] || null;
    const handover = handovers[0] || null;
    const fulfilment = fulfilments[0] || null;
    const latestFollowup = followups.find((f: any) => f.status === 'pending') || null;

    const operationalSummary = generateOperationalSummary({
      rfq,
      latestDiscussion,
      handover,
      fulfilment,
      latestFollowup,
      balanceDue
    });

    return NextResponse.json({
      success: true,
      rfq,
      commercialSummary: {
        quoteNumber: rfq.quote_number,
        revisionNumber: rfq.revision_number || 1,
        proposedUnitPrice: Number(rfq.proposed_unit_price_inr || 0),
        freightCharges: Number(rfq.freight_charges_inr || 0),
        totalQuoteInr: quoteTotal,
        totalPaidInr: totalPaid,
        balanceDueInr: balanceDue,
        validUntil: rfq.valid_until,
        paymentStatus: rfq.payment_status || (totalPaid >= quoteTotal && quoteTotal > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid')
      },
      operationalState: {
        rfqStatus: rfq.status,
        paymentStatus: rfq.payment_status || 'unpaid',
        fulfilmentStatus: rfq.fulfilment_status || 'not_started',
        procurementStatus: fulfilment?.procurement_status || 'not_started',
        qualityStatus: fulfilment?.quality_status || 'pending',
        dispatchStatus: fulfilment?.dispatch_status || 'pending',
        deliveryStatus: fulfilment?.delivery_status || 'pending',
        handoverStatus: handover?.handover_status || 'not_initiated'
      },
      operationalSummary,
      activities,
      discussions,
      revisions,
      handover,
      fulfilment,
      payments,
      followups
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id] (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve quotation details', details: error.message },
      { status: 500 }
    );
  }
}
