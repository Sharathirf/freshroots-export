import pool from '@/lib/db';

export class PaymentConfirmationError extends Error {
  constructor(message: string, readonly statusCode = 400) {
    super(message);
  }
}

export async function confirmRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  amountPaise: number;
  currency: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<{
      order_id: string;
      order_number: string;
      amount_paise: string | number;
      currency: string;
      attempt_status: string;
      razorpay_payment_id: string | null;
      order_status: string;
      total_amount_inr: string | number;
      order_data: Record<string, unknown>;
      payment_expires_at: string | Date | null;
    }>(
      `SELECT pa.order_id, pa.amount_paise, pa.currency, pa.status AS attempt_status,
              pa.razorpay_payment_id, o.order_number, o.status AS order_status,
              o.total_amount_inr, o.payment_expires_at, to_jsonb(o) AS order_data
       FROM payment_attempts pa
       JOIN orders o ON o.id = pa.order_id
       WHERE pa.razorpay_order_id = $1
       FOR UPDATE OF pa, o`,
      [input.orderId]
    );
    const payment = result.rows[0];
    if (!payment) throw new PaymentConfirmationError('Payment session was not found.', 404);

    const expectedPaise = Math.round(Number(payment.total_amount_inr) * 100);
    if (
      Number(payment.amount_paise) !== input.amountPaise ||
      expectedPaise !== input.amountPaise ||
      payment.currency !== input.currency ||
      input.currency !== 'INR'
    ) {
      throw new PaymentConfirmationError('Payment amount or currency does not match the order.', 400);
    }

    if (payment.attempt_status === 'captured' && payment.razorpay_payment_id === input.paymentId && payment.order_status === 'paid') {
      await client.query('COMMIT');
      return { success: true as const, alreadyConfirmed: true, orderNumber: payment.order_number, order: payment.order_data };
    }
    if (payment.order_status !== 'pending_payment') {
      throw new PaymentConfirmationError('Order is no longer awaiting payment.', 409);
    }
    if (payment.payment_expires_at && new Date(payment.payment_expires_at).getTime() <= Date.now()) {
      throw new PaymentConfirmationError('The payment window expired. Contact the farm desk if you were charged.', 409);
    }

    await client.query(
      `UPDATE payment_attempts
       SET status = 'captured', razorpay_payment_id = $1, updated_at = NOW()
       WHERE razorpay_order_id = $2`,
      [input.paymentId, input.orderId]
    );
    const orderResult = await client.query(
      `UPDATE orders
       SET status = 'paid', payment_reference = $1, payment_expires_at = NULL, updated_at = NOW()
       WHERE id = $2 AND status = 'pending_payment'
       RETURNING *`,
      [`RZP-${input.paymentId}`, payment.order_id]
    );
    if (!orderResult.rows[0]) throw new PaymentConfirmationError('Could not confirm payment for this order.', 409);

    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('RAZORPAY_PAYMENT_CAPTURED', 'orders', $1, $2)`,
      [payment.order_id, JSON.stringify({ order_number: payment.order_number, payment_id: input.paymentId })]
    );
    await client.query('COMMIT');
    return { success: true as const, alreadyConfirmed: false, order: orderResult.rows[0], orderNumber: payment.order_number };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
