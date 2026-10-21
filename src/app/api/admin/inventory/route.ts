import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const batches = await query(`
      SELECT 
        ib.*,
        p.title AS product_title,
        p.sku AS product_sku,
        p.unit_of_measure,
        p.category
      FROM inventory_batches ib
      JOIN products p ON ib.product_id = p.id
      ORDER BY ib.intake_date DESC
    `);
    return NextResponse.json({ success: true, count: batches.length, batches });
  } catch (error: any) {
    console.error('API Error in /api/admin/inventory (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve inventory batches', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, batch_id, product_id, origin_mandi, quantity, cost_per_unit, damaged_count, reason } = body;

    // Action 1: Add new harvest intake batch from Mandi
    if (action === 'NEW_BATCH') {
      if (!product_id || !origin_mandi || !quantity || !cost_per_unit) {
        return NextResponse.json({ success: false, error: 'Missing mandatory batch details' }, { status: 400 });
      }

      const batchNum = `BATCH-MAN-${Date.now().toString().slice(-6)}`;
      const inserted = await query(
        `INSERT INTO inventory_batches (
          batch_number, product_id, origin_mandi, intake_date,
          initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
        ) VALUES ($1, $2, $3, CURRENT_DATE, $4, $4, 0, 0, $5)
        RETURNING *`,
        [batchNum, product_id, origin_mandi, parseInt(quantity, 10), parseFloat(cost_per_unit)]
      );

      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('INVENTORY_BATCH_INTAKE', 'inventory_batches', $1, $2)`,
        [inserted[0].id, JSON.stringify({ batch: batchNum, qty: quantity, mandi: origin_mandi })]
      );

      return NextResponse.json({ success: true, message: 'New inventory batch logged successfully', batch: inserted[0] });
    }

    // Action 2: Write-off damaged or post-harvest shrinkage stock
    if (action === 'WRITE_OFF_DAMAGED') {
      if (!batch_id || !damaged_count) {
        return NextResponse.json({ success: false, error: 'Batch ID and damaged count are required' }, { status: 400 });
      }

      const count = parseInt(damaged_count, 10);
      const updated = await query(
        `UPDATE inventory_batches
         SET available_quantity = GREATEST(0, available_quantity - $1),
             damaged_quantity = damaged_quantity + $1
         WHERE id = $2 AND available_quantity >= $1
         RETURNING *`,
        [count, batch_id]
      );

      if (updated.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Insufficient available quantity in this batch to write off' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('INVENTORY_WRITE_OFF_DAMAGED', 'inventory_batches', $1, $2)`,
        [batch_id, JSON.stringify({ count, reason: reason || 'Cracked / Rotten in sorting inspection' })]
      );

      return NextResponse.json({ success: true, message: 'Damaged stock written off', batch: updated[0] });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/admin/inventory (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inventory update', details: error.message },
      { status: 500 }
    );
  }
}
