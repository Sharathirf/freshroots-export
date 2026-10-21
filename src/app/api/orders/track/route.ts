import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('query')?.trim();

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, error: 'Please enter an Order ID or 10-digit phone number' },
        { status: 400 }
      );
    }

    const cleanDigits = rawQuery.replace(/\D/g, '');
    const phonePattern = cleanDigits.length >= 7 ? `%${cleanDigits.slice(-10)}%` : `%${rawQuery}%`;

    const sql = `
      SELECT * FROM orders
      WHERE order_number ILIKE $1
         OR tracking_reference ILIKE $1
         OR customer_phone LIKE $2
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const params = [`%${rawQuery}%`, phonePattern];

    const orders = await query(sql, params);

    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        orders: [],
        message: `No orders found matching "${rawQuery}". Please check your order ID or mobile number.`
      });
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error: any) {
    console.error('API Error in /api/orders/track:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tracking status', details: error.message },
      { status: 500 }
    );
  }
}
