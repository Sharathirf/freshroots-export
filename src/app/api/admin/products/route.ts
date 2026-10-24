import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const products = await query(`
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
        p.retail_price_inr,
        p.wholesale_benchmark_price_inr,
        p.bulk_min_quantity,
        p.hsn_code,
        p.tax_rate_percentage,
        p.is_active,
        p.image_url,
        COALESCE(SUM(ib.available_quantity), 0)::int AS available_stock
      FROM products p
      LEFT JOIN inventory_batches ib ON p.id = ib.product_id
      GROUP BY p.id
      ORDER BY p.title ASC
    `);

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('API Error in /api/admin/products (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, retail_price_inr, wholesale_benchmark_price_inr, available_stock, is_active, bulk_min_quantity } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is mandatory' },
        { status: 400 }
      );
    }

    if (retail_price_inr !== undefined && Number(retail_price_inr) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Retail price must be greater than zero' },
        { status: 400 }
      );
    }

    if (bulk_min_quantity !== undefined && (isNaN(Number(bulk_min_quantity)) || Number(bulk_min_quantity) < 1)) {
      return NextResponse.json(
        { success: false, error: 'Minimum order quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (available_stock !== undefined && Number(available_stock) < 0) {
      return NextResponse.json(
        { success: false, error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    // 1. Update Product Pricing, Status & Minimum Quantity
    const updateClauses: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (retail_price_inr !== undefined && !isNaN(Number(retail_price_inr))) {
      updateClauses.push(`retail_price_inr = $${pIdx++}`);
      params.push(Number(retail_price_inr));
    }

    if (wholesale_benchmark_price_inr !== undefined && !isNaN(Number(wholesale_benchmark_price_inr))) {
      updateClauses.push(`wholesale_benchmark_price_inr = $${pIdx++}`);
      params.push(Number(wholesale_benchmark_price_inr));
    }

    if (bulk_min_quantity !== undefined && !isNaN(Number(bulk_min_quantity))) {
      updateClauses.push(`bulk_min_quantity = $${pIdx++}`);
      params.push(Math.max(1, parseInt(bulk_min_quantity, 10)));
    }

    if (is_active !== undefined) {
      updateClauses.push(`is_active = $${pIdx++}`);
      params.push(Boolean(is_active));
    }

    let updatedProduct: any = null;
    if (updateClauses.length > 0) {
      params.push(id);
      const res = await query(
        `UPDATE products
         SET ${updateClauses.join(', ')}
         WHERE id = $${pIdx}
         RETURNING *`,
        params
      );
      if (res.length > 0) {
        updatedProduct = res[0];
      }
    }

    // 2. Update Available Stock Quantity via Inventory Batch
    if (available_stock !== undefined && !isNaN(Number(available_stock))) {
      const newStock = Math.max(0, parseInt(available_stock, 10));

      // Find latest inventory batch for this product
      const batches = await query(
        `SELECT id FROM inventory_batches WHERE product_id = $1 ORDER BY intake_date DESC, created_at DESC LIMIT 1`,
        [id]
      );

      if (batches.length > 0) {
        await query(
          `UPDATE inventory_batches SET available_quantity = $1 WHERE id = $2`,
          [newStock, batches[0].id]
        );
      } else {
        // Create an inventory batch if none exists
        const batchNum = `BATCH-STOCK-${Date.now().toString().slice(-6)}`;
        await query(
          `INSERT INTO inventory_batches (
            batch_number, product_id, origin_mandi, intake_date,
            initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
          ) VALUES ($1, $2, 'Kikkeri & Mandya Central Yard', CURRENT_DATE, $3, $3, 0, 0, 100.00)`,
          [batchNum, id, newStock]
        );
      }
    }

    // 3. Log Audit Record
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('PRODUCT_PRICE_STOCK_UPDATED', 'products', $1, $2)`,
      [id, JSON.stringify({ retail_price_inr, wholesale_benchmark_price_inr, available_stock, is_active })]
    );

    return NextResponse.json({
      success: true,
      message: 'Product pricing and available stock updated successfully.',
      product: updatedProduct
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/products (PATCH):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product pricing or stock', details: error.message },
      { status: 500 }
    );
  }
}
