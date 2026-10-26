export interface FarmCoupon {
  code: string;
  title: string;
  description: string;
  type: 'flat' | 'percentage';
  value: number; // ₹ value or % value
  minOrderAmount: number;
  badge: string;
  firstOrderOnly?: boolean;
}

export const AVAILABLE_COUPONS: FarmCoupon[] = [
  {
    code: 'FIRST100',
    title: '₹100 Flat OFF',
    description: 'Get ₹100 instant discount on your first farm order',
    type: 'flat',
    value: 100,
    minOrderAmount: 400,
    badge: '1st Order Only',
    firstOrderOnly: true
  }
];

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  coupon?: FarmCoupon;
  discountAmount: number;
}

export function validateCoupon(
  code: string,
  subtotal: number,
  isFirstOrder: boolean = true
): CouponValidationResult {
  let normalized = (code || '').trim().toUpperCase();
  if (normalized === 'WELCOME100' || normalized === 'FARM100' || normalized === 'FARM50') {
    normalized = 'FIRST100';
  }

  const coupon = AVAILABLE_COUPONS.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      valid: false,
      message: `Coupon code "${normalized}" is invalid or expired.`,
      discountAmount: 0
    };
  }

  if (coupon.firstOrderOnly && !isFirstOrder) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} is valid exclusively on your 1st farm order. You have previous orders on record.`,
      discountAmount: 0
    };
  }

  if (subtotal < coupon.minOrderAmount) {
    const deficit = coupon.minOrderAmount - subtotal;
    return {
      valid: false,
      message: `Minimum order for ${coupon.code} is ₹${coupon.minOrderAmount}. Add ₹${deficit} more to apply.`,
      discountAmount: 0
    };
  }

  let discount = 0;
  if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100);
  }

  return {
    valid: true,
    message: `🎉 Coupon ${coupon.code} applied! You saved ₹${discount} on your 1st order.`,
    coupon,
    discountAmount: discount
  };
}
