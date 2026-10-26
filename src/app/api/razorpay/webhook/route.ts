import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { query } from '@/lib/db';
import { confirmRazorpayPayment } from '@/lib/razorpay-payments';

export const dynamic = 'force-dynamic';

function validWebhookSignature(body: string, signature: string, secret: string) {
  if (!/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  const provided = Buffer.from(signature, 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ success: false, error: 'Webhook is not configured.' }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';
  if (!validWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const payment = event?.payload?.payment?.entity;
    if (event?.event === 'payment.captured' && payment?.order_id && payment?.id) {
      await confirmRazorpayPayment({
        orderId: String(payment.order_id),
        paymentId: String(payment.id),
        amountPaise: Number(payment.amount),
        currency: String(payment.currency || ''),
      });
    } else if (event?.event === 'payment.failed' && payment?.order_id && payment?.id) {
      await query(
        `UPDATE payment_attempts
         SET status = 'failed', razorpay_payment_id = $1, updated_at = NOW()
         WHERE razorpay_order_id = $2 AND status <> 'captured'`,
        [String(payment.id), String(payment.order_id)]
      );
    }
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed:', error);
    Sentry.captureException(error, { tags: { route: '/api/razorpay/webhook' } });
    return NextResponse.json({ success: false, error: 'Webhook processing failed.' }, { status: 500 });
  }
}
