import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const channel = searchParams.get('channel') || undefined;

    let sql = `
      SELECT cn.*,
             c.name as customer_name,
             c.customer_code,
             o.order_number
      FROM customer_notifications cn
      LEFT JOIN customers c ON c.id = cn.customer_id
      LEFT JOIN orders o ON o.id = cn.order_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (channel && channel !== 'all') {
      sql += ` AND cn.channel = $${pIdx}`;
      params.push(channel);
      pIdx++;
    }

    sql += ` ORDER BY cn.created_at DESC LIMIT $${pIdx}`;
    params.push(limit);

    const notifications = await query(sql, params);

    return NextResponse.json({ success: true, count: notifications.length, notifications });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/notifications (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/notifications', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve notifications', details: error.message },
      { status: 500 }
    );
  }
}
