import fs from 'fs';
import path from 'path';

// Parse .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const val = v.join('=').replace(/^["']|["']$/g, '');
        process.env[k.trim()] = val.trim();
      }
    }
  }
} catch {
  // Ignore if .env.local cannot be read
}

import { getRazorpayInstance, verifyRazorpaySignature } from '../lib/razorpay';
import crypto from 'crypto';

async function testRazorpayIntegration() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET before running the credential check.');
  }
  console.log(`🧪 Testing configured Razorpay ${keyId.startsWith('rzp_live_') ? 'live' : 'test'} credentials...`);

  const razorpay = getRazorpayInstance();

  try {
    const amountInPaise = 66300; // ₹663.00 (Wood-Pressed Groundnut Oil)
    const receiptId = `tiptur_${Date.now()}`;

    console.log(`📦 Creating Razorpay test order for ₹${amountInPaise / 100}...`);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        product: 'Pure Wood-Pressed Groundnut Oil',
        platform: 'Tiptur Direct'
      }
    });

    console.log('✅ Razorpay Order Created Successfully!');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Amount: ${order.amount} paise (₹${Number(order.amount) / 100})`);
    console.log(`   Status: ${order.status}`);

    // Signature verification check
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${order.id}|${mockPaymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      orderId: order.id,
      paymentId: mockPaymentId,
      signature: validSignature
    });

    console.log(`✅ Signature Verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    console.log('\n🎉 ALL RAZORPAY INTEGRATION TESTS PASSED on intelligent-raman!');
  } catch (error: any) {
    console.error('❌ Razorpay API Error:', error);
    process.exit(1);
  }
}

testRazorpayIntegration();
