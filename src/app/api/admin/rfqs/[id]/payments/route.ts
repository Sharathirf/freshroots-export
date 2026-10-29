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
      action = 'record_payment', // 'record_payment' or 'reconcile'
      payment_id,
      amount_paid_inr,
      payment_method = 'bank_neft_rtgs',
      transaction_reference,
      payment_date,
      payment_notes,
      recorded_by = 'Finance Lead',
      reconciled_by = 'Accounts Manager'
    } = body;

    const rfqRows = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const rfq = rfqRows[0];
    const totalQuote = Number(rfq.total_quote_inr || 0);

    if (action === 'record_payment') {
      const amount = Number(amount_paid_inr);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: 'Payment amount must be greater than zero' }, { status: 400 });
      }
      if (!transaction_reference || !transaction_reference.trim()) {
        return NextResponse.json({ success: false, error: 'Transaction reference (UTR / Bank Ref / UPI ID) is required' }, { status: 400 });
      }

      // Check for duplicate transaction reference
      const dupCheck = await query(
        `SELECT id FROM b2b_payments WHERE transaction_reference = $1`,
        [transaction_reference.trim()]
      );
      if (dupCheck.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Transaction reference "${transaction_reference}" has already been recorded in the system.`
        }, { status: 400 });
      }

      // Insert payment record
      const inserted = await query(
        `INSERT INTO b2b_payments (
          rfq_id, confirmed_order_value_inr, amount_paid_inr, payment_method,
          transaction_reference, payment_date, recorded_by, reconciliation_status,
          payment_notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_reconciliation', $8, NOW())
        RETURNING *`,
        [
          id,
          totalQuote,
          amount,
          payment_method,
          transaction_reference.trim(),
          payment_date || new Date().toISOString().slice(0, 10),
          recorded_by,
          payment_notes || null
        ]
      );

      // Re-sum total payments for this RFQ
      const sumResult = await query(
        `SELECT COALESCE(SUM(amount_paid_inr), 0)::numeric AS total_paid FROM b2b_payments WHERE rfq_id = $1`,
        [id]
      );
      const totalPaid = Number(sumResult[0].total_paid);
      const newPaymentStatus = totalPaid >= totalQuote && totalQuote > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';

      await query(
        `UPDATE wholesale_quotations SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
        [newPaymentStatus, id]
      );

      // Log to activity timeline
      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'payment_recorded',
        activityTitle: `B2B payment recorded: ₹${amount.toLocaleString('en-IN')} via ${payment_method.toUpperCase()}`,
        description: `UTR / Ref: ${transaction_reference}. Total Paid to date: ₹${totalPaid.toLocaleString('en-IN')} of ₹${totalQuote.toLocaleString('en-IN')}.`,
        comments: payment_notes || null,
        actingUser: recorded_by,
        actorRole: 'finance',
        visibility: 'internal_note'
      });

      return NextResponse.json({
        success: true,
        payment: inserted[0],
        total_paid: totalPaid,
        balance_due: Math.max(0, totalQuote - totalPaid),
        payment_status: newPaymentStatus
      });
    }

    if (action === 'reconcile') {
      if (!payment_id) {
        return NextResponse.json({ success: false, error: 'Payment ID is required for reconciliation' }, { status: 400 });
      }

      const updated = await query(
        `UPDATE b2b_payments
         SET reconciliation_status = 'reconciled',
             reconciled_by = $1,
             reconciled_at = NOW()
         WHERE id = $2 AND rfq_id = $3
         RETURNING *`,
        [reconciled_by, payment_id, id]
      );

      if (updated.length === 0) {
        return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
      }

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'payment_reconciled',
        activityTitle: `Payment of ₹${Number(updated[0].amount_paid_inr).toLocaleString('en-IN')} reconciled by ${reconciled_by}`,
        description: `Bank settlement verified for transaction ref: ${updated[0].transaction_reference}`,
        actingUser: reconciled_by,
        actorRole: 'finance',
        visibility: 'internal_note'
      });

      return NextResponse.json({ success: true, payment: updated[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid payment action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/payments (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment', details: error.message },
      { status: 500 }
    );
  }
}
