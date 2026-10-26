import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getRazorpayInstance, verifyRazorpaySignature } from '@/lib/razorpay';
import { confirmRazorpayPayment, PaymentConfirmationError } from '@/lib/razorpay-payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = typeof body.razorpayOrderId === 'string' ? body.razorpayOrderId : '';
    const paymentId = typeof body.razorpayPaymentId === 'string' ? body.razorpayPaymentId : '';
    const signature = typeof body.razorpaySignature === 'string' ? body.razorpaySignature : '';

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ success: false, verified: false, error: 'Payment signature and identifiers are required.' }, { status: 400 });
    }
    if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
      return NextResponse.json({ success: false, verified: false, error: 'Invalid Razorpay payment signature.' }, { status: 400 });
    }

    const providerPayment = await getRazorpayInstance().payments.fetch(paymentId);
    if (
      providerPayment.order_id !== orderId ||
      providerPayment.status !== 'captured'
    ) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'Razorpay has not captured this payment for the expected order yet.',
      }, { status: 409 });
    }

    const confirmation = await confirmRazorpayPayment({
      orderId,
      paymentId,
      amountPaise: Number(providerPayment.amount),
      currency: providerPayment.currency,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId,
      order: 'order' in confirmation ? confirmation.order : undefined,
      orderNumber: confirmation.orderNumber,
    });
  } catch (error) {
    if (error instanceof PaymentConfirmationError) {
      return NextResponse.json({ success: false, verified: false, error: error.message }, { status: error.statusCode });
    }
    console.error('API Error in /api/razorpay/verify:', error);
    Sentry.captureException(error, { tags: { route: '/api/razorpay/verify', method: 'POST' } });
    return NextResponse.json({ success: false, verified: false, error: 'Payment verification is temporarily unavailable.' }, { status: 503 });
  }
}
