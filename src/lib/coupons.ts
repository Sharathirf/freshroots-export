export interface FarmCoupon {
  code: string;
  title: string;
  description: string;
  type: 'flat' | 'percentage';
  value: number; // ₹ value or % value
  minOrderAmount: number;
  badge: string;
}

export const AVAILABLE_COUPONS: FarmCoupon[] = [
  {
    code: 'FARM50',
    title: '₹50 Flat OFF',
    description: 'Save ₹50 on any farm order above ₹400',
    type: 'flat',
    value: 50,
    minOrderAmount: 400,
    badge: 'Popular'
  },
  {
    code: 'MANDYA5',
    title: '5% Farm Direct',
    description: 'Get 5% instant discount on orders above ₹1,000',
    type: 'percentage',
    value: 5,
    minOrderAmount: 1000,
    badge: '5% OFF'
  },
  {
    code: 'BULK100',
    title: '₹100 Bulk Saver',
    description: 'Save ₹100 on large farm orders above ₹2,500',
    type: 'flat',
    value: 100,
    minOrderAmount: 2500,
    badge: 'Wholesale'
  }
];

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  coupon?: FarmCoupon;
  discountAmount: number;
}

export function validateCoupon(code: string, subtotal: number): CouponValidationResult {
  const normalized = (code || '').trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      valid: false,
      message: `Coupon code "${normalized}" is invalid or expired.`,
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
    message: `🎉 Coupon ${coupon.code} applied! You saved ₹${discount}.`,
    coupon,
    discountAmount: discount
  };
}
