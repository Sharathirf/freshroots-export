import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getProductImageUrl } from '@/lib/product-images';

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
        review_summary.average_rating::numeric(2, 1) AS average_rating,
        review_summary.review_count::int AS review_count,
        p.is_active,
        p.created_at,
        COALESCE(SUM(ib.available_quantity), 0)::int AS available_stock
      FROM products p
      LEFT JOIN inventory_batches ib ON p.id = ib.product_id
      LEFT JOIN LATERAL (
        SELECT AVG(pr.rating) AS average_rating, COUNT(*) AS review_count
        FROM product_reviews pr
        WHERE pr.product_id = p.id AND pr.is_approved = true
      ) review_summary ON true
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ` AND p.category = $1`;
      params.push(category);
    }

    sql += ` GROUP BY p.id, review_summary.average_rating, review_summary.review_count ORDER BY p.retail_price_inr ASC`;

    const rows = await query(sql, params);
    const products = rows.map((product) => ({
      ...product,
      image_url: getProductImageUrl(product.sku, product.image_url)
    }));
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('API Error in /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}
