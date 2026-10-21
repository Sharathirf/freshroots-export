import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required' }, { status: 400 });
    }

    // Public query: Strictly excludes wholesale_benchmark_price_inr
    const rows = await query(
      `SELECT 
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
      WHERE p.slug = $1 AND p.is_active = true
      GROUP BY p.id`,
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error: any) {
    console.error('API Error in /api/products/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product details', details: error.message },
      { status: 500 }
    );
  }
}
