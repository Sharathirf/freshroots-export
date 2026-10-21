import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Explicitly select public-facing fields. Never leak confidential wholesale_benchmark_price_inr.
    let sql = `
      SELECT 
        p.id,
        p.sku,
        p.title,
        p.slug,
        p.category,
        p.grade,
        p.origin,
        p.unit_of_measure,
        p.estimated_weight_kg,
        p.moisture_percentage,
        p.oil_percentage,
        p.retail_price_inr,
        p.bulk_min_quantity,
        p.hsn_code,
        p.tax_rate_percentage,
        p.description,
        p.specifications,
        p.image_url,
        p.is_active,
        p.created_at,
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
