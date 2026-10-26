import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'node:crypto';

export function getRazorpayKeyId() {
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const serverKey = process.env.RAZORPAY_KEY_ID;
  if (!process.env.RAZORPAY_KEY_SECRET || (!publicKey && !serverKey)) {
    throw new Error('Razorpay credentials are not configured.');
  }
  if (publicKey && serverKey && publicKey !== serverKey) {
    throw new Error('Razorpay public and server key IDs do not match.');
  }
  return publicKey || serverKey!;
}

export function getRazorpayInstance() {
  const keyId = getRazorpayKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Verifies HMAC SHA256 over Razorpay's `order_id|payment_id` payload. */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || !/^[a-f\d]{64}$/i.test(signature)) return false;

  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
  const provided = Buffer.from(signature, 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
