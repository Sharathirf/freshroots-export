import { NextRequest, NextResponse } from 'next/server';
import { AVAILABLE_COUPONS, validateCoupon } from '@/lib/coupons';

export async function GET() {
  return NextResponse.json({
    success: true,
    coupons: AVAILABLE_COUPONS
  });
}

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required.' },
        { status: 400 }
      );
    }

    const result = validateCoupon(code, Number(subtotal || 0));

    return NextResponse.json({
      success: result.valid,
      message: result.message,
      discountAmount: result.discountAmount,
      coupon: result.coupon
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid coupon validation request.' },
      { status: 500 }
    );
  }
}
