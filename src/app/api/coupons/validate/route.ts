import { NextRequest, NextResponse } from 'next/server';
import { AVAILABLE_COUPONS, validateCoupon } from '@/lib/coupons';
import { query } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    success: true,
    coupons: AVAILABLE_COUPONS
  });
}

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, phone } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required.' },
        { status: 400 }
      );
    }

    let isFirstOrder = true;
    if (phone) {
      const clean = String(phone).replace(/\D/g, '').slice(-10);
      if (clean.length === 10) {
        const past = await query(
          `SELECT id FROM orders WHERE customer_phone LIKE $1 AND status != 'cancelled' LIMIT 1`,
          [`%${clean}%`]
        );
        isFirstOrder = past.length === 0;
      }
    }

    const result = validateCoupon(code, Number(subtotal || 0), isFirstOrder);

    return NextResponse.json({
      success: result.valid,
      message: result.message,
      discountAmount: result.discountAmount,
      coupon: result.coupon
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid coupon validation request.' },
      { status: 500 }
    );
  }
}
