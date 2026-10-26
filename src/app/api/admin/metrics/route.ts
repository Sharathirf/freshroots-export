import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    // 1. Order KPIs
    const orderStats = await query(`
      SELECT 
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(total_amount_inr), 0)::numeric(12,2) AS total_retail_sales,
        COALESCE(AVG(total_amount_inr), 0)::numeric(10,2) AS average_order_value,
        COUNT(CASE WHEN status = 'paid' THEN 1 END)::int AS pending_allocation,
        COUNT(CASE WHEN status = 'dispatched' THEN 1 END)::int AS in_transit,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::int AS delivered
      FROM orders
    `);

    // 2. Wholesale RFQ KPIs
    const rfqStats = await query(`
      SELECT 
        COUNT(*)::int AS total_rfqs,
        COALESCE(SUM(total_quote_inr), 0)::numeric(12,2) AS total_pipeline_value,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END)::int AS pending_review,
        COUNT(CASE WHEN status = 'quote_issued' THEN 1 END)::int AS quotes_active,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int AS quotes_accepted
      FROM wholesale_quotations
    `);

    // 3. Inventory Stock KPIs
    const invStats = await query(`
      SELECT 
        COALESCE(SUM(available_quantity), 0)::int AS total_available_units,
        COALESCE(SUM(reserved_quantity), 0)::int AS total_reserved_units,
        COALESCE(SUM(damaged_quantity), 0)::int AS total_damaged_units,
        COALESCE(SUM(available_quantity * cost_per_unit_inr), 0)::numeric(12,2) AS total_inventory_valuation
      FROM inventory_batches
    `);

    const inv = invStats[0];
    const totalHandled = (inv.total_available_units + inv.total_reserved_units + inv.total_damaged_units) || 1;
    const spoilageRate = ((inv.total_damaged_units / totalHandled) * 100).toFixed(2);

    return NextResponse.json({
      success: true,
      metrics: {
        retail: orderStats[0],
        wholesale: rfqStats[0],
        inventory: {
          ...inv,
          spoilage_rate_percentage: parseFloat(spoilageRate)
        }
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/metrics (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve metrics', details: error.message },
      { status: 500 }
    );
  }
}
