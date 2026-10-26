import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { query } from '@/lib/db';
import { getRazorpayInstance, getRazorpayKeyId } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumber = typeof body.order_number === 'string' ? body.order_number.trim() : '';
    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'A server-created order number is required.' }, { status: 400 });
    }

    const rows = await query<{
      id: string;
      order_number: string;
      total_amount_inr: string | number;
      status: string;
      payment_method: string;
      payment_expires_at: string | Date | null;
    }>(
      `SELECT id, order_number, total_amount_inr, status, payment_method, payment_expires_at
       FROM orders WHERE order_number = $1 LIMIT 1`,
      [orderNumber]
    );
    const order = rows[0];
    if (!order) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    if (order.status !== 'pending_payment' || order.payment_method !== 'razorpay') {
      return NextResponse.json({ success: false, error: 'This order is not awaiting Razorpay payment.' }, { status: 409 });
    }
    if (order.payment_expires_at && new Date(order.payment_expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'This payment session expired. Please place the order again.' }, { status: 409 });
    }

    const amountPaise = Math.round(Number(order.total_amount_inr) * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      return NextResponse.json({ success: false, error: 'Order total is not payable.' }, { status: 400 });
    }

    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpayInstance().orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: order.order_number.slice(-40),
        notes: { order_number: order.order_number },
      });
      await query(
        `INSERT INTO payment_attempts (razorpay_order_id, order_id, amount_paise, currency, status)
         VALUES ($1, $2, $3, 'INR', 'created')`,
        [razorpayOrder.id, order.id, amountPaise]
      );
    } catch (providerError) {
      console.error('Razorpay order creation failed:', providerError);
      Sentry.captureException(providerError, { tags: { route: '/api/razorpay/create-order', area: 'provider' } });
      return NextResponse.json({ success: false, error: 'Payment provider could not create the payment session.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: getRazorpayKeyId(),
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error('API Error in /api/razorpay/create-order:', error);
    Sentry.captureException(error, { tags: { route: '/api/razorpay/create-order', method: 'POST' } });
    return NextResponse.json({ success: false, error: 'Failed to create Razorpay payment session.' }, { status: 503 });
  }
}
