import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { getCustomersWithMetrics } from '@/lib/crm-service';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    // Fetch customers with metrics
    const { customers } = await getCustomersWithMetrics({ limit: 200 });

    const dueForReorder = customers.filter((c: any) => c.reorder_status === 'due');
    const overdueForReorder = customers.filter((c: any) => c.reorder_status === 'overdue');
    const highValueInactive = customers.filter(
      (c: any) => c.reorder_status === 'inactive' && (c.total_sales_value >= 25000 || c.total_orders >= 2)
    );
    const repeatBuyers = customers.filter((c: any) => c.successful_orders >= 2);

    // Fetch repeat order rules
    const rules = await query('SELECT * FROM repeat_order_rules WHERE is_active = true ORDER BY product_sku NULLS LAST');

    // Fetch scheduled callbacks
    const scheduledCallbacks = await query(`
      SELECT cc.*, c.name as customer_name, c.phone as customer_phone, c.customer_code
      FROM customer_calls cc
      JOIN customers c ON c.id = cc.customer_id
      WHERE cc.next_action_due IS NOT NULL AND cc.next_action_due >= NOW() - INTERVAL '7 days'
      ORDER BY cc.next_action_due ASC
      LIMIT 20
    `);

    return NextResponse.json({
      success: true,
      summary: {
        total_customers: customers.length,
        due_count: dueForReorder.length,
        overdue_count: overdueForReorder.length,
        high_value_inactive_count: highValueInactive.length,
        repeat_buyers_count: repeatBuyers.length,
      },
      due_for_reorder: dueForReorder,
      overdue_for_reorder: overdueForReorder,
      high_value_inactive: highValueInactive,
      scheduled_callbacks: scheduledCallbacks,
      rules,
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/repeat-orders (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/repeat-orders', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve repeat order analytics', details: error.message },
      { status: 500 }
    );
  }
}
