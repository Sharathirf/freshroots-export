import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let sql = `
      SELECT 
        p.*,
        COALESCE(SUM(ib.available_quantity), 0)::int AS available_stock
      FROM products p
      LEFT JOIN inventory_batches ib ON p.id = ib.product_id
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ` AND p.category = $1`;
      params.push(category);
    }

    sql += ` GROUP BY p.id ORDER BY p.retail_price_inr ASC`;

    const products = await query(sql, params);
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('API Error in /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}
