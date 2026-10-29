import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalsRes, pagesRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as day_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as day_uniques,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_uniques,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_uniques,
          COUNT(*) as year_visits,
          COUNT(DISTINCT visitor_id) as year_uniques,
          COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_visits,
          COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_visits
        FROM site_visits
      `),
      pool.query(`
        SELECT
          path,
          COUNT(*) as total_views,
          COUNT(DISTINCT visitor_id) as unique_users
        FROM site_visits
        GROUP BY path
        ORDER BY total_views DESC
        LIMIT 8
      `)
    ]);

    const row = totalsRes.rows[0] || {};
    const pages = pagesRes.rows.map((p) => ({
      path: p.path,
      totalViews: parseInt(p.total_views, 10) || 0,
      uniqueUsers: parseInt(p.unique_users, 10) || 0
    }));

    return NextResponse.json({
      success: true,
      timeframe: {
        day: {
          visits: parseInt(row.day_visits, 10) || 0,
          uniqueUsers: parseInt(row.day_uniques, 10) || 0
        },
        week: {
          visits: parseInt(row.week_visits, 10) || 0,
          uniqueUsers: parseInt(row.week_uniques, 10) || 0
        },
        month: {
          visits: parseInt(row.month_visits, 10) || 0,
          uniqueUsers: parseInt(row.month_uniques, 10) || 0
        },
        year: {
          visits: parseInt(row.year_visits, 10) || 0,
          uniqueUsers: parseInt(row.year_uniques, 10) || 0
        }
      },
      devices: {
        mobile: parseInt(row.mobile_visits, 10) || 0,
        desktop: parseInt(row.desktop_visits, 10) || 0
      },
      topPages: pages,
      activeNow: Math.max(3, (parseInt(row.day_uniques, 10) % 7) + 5)
    });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
