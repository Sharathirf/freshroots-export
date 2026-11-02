import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { EXCLUDED_VISITOR_SQL } from '@/lib/analytics-exclusions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Proactively clean up any legacy admin routes or excluded device visits from the database
    try {
      await pool.query(
        `DELETE FROM site_visits 
         WHERE path LIKE '/admin%' 
            OR path LIKE '/api%' 
            OR visitor_id IN (${EXCLUDED_VISITOR_SQL})`
      );
      await pool.query(
        `DELETE FROM site_events 
         WHERE path LIKE '/admin%' 
            OR path LIKE '/api%' 
            OR visitor_id IN (${EXCLUDED_VISITOR_SQL})`
      );
    } catch (cleanupErr) {
      console.warn('Analytics cleanup non-critical note:', cleanupErr);
    }

    const [totalsRes, pagesRes, recentRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as day_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as day_uniques,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes') as active_now,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_uniques,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_visits,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_uniques,
          COUNT(*) as year_visits,
          COUNT(DISTINCT visitor_id) as year_uniques,
          COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_visits,
          COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_visits
        FROM site_visits
        WHERE visitor_id NOT IN (${EXCLUDED_VISITOR_SQL})
          AND path NOT LIKE '/admin%'
          AND path NOT LIKE '/api%'
          AND visitor_id NOT IN (
            SELECT DISTINCT visitor_id FROM site_visits WHERE path LIKE '/admin%'
          )
      `),
      pool.query(`
        SELECT
          path,
          COUNT(*) as total_views,
          COUNT(DISTINCT visitor_id) as unique_users
        FROM site_visits
        WHERE visitor_id NOT IN (${EXCLUDED_VISITOR_SQL})
          AND path NOT LIKE '/admin%'
          AND path NOT LIKE '/api%'
          AND visitor_id NOT IN (
            SELECT DISTINCT visitor_id FROM site_visits WHERE path LIKE '/admin%'
          )
        GROUP BY path
        ORDER BY total_views DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          visitor_id,
          device_type,
          COALESCE(device_name, CASE WHEN device_type = 'mobile' THEN 'Mobile Device' ELSE 'Desktop Browser' END) as device_name,
          COALESCE(city, 'Karnataka Region') as city,
          COALESCE(region, 'KA') as region,
          COALESCE(country, 'IN') as country,
          path,
          created_at
        FROM site_visits
        WHERE visitor_id NOT IN (${EXCLUDED_VISITOR_SQL})
          AND path NOT LIKE '/admin%'
          AND path NOT LIKE '/api%'
          AND visitor_id NOT IN (
            SELECT DISTINCT visitor_id FROM site_visits WHERE path LIKE '/admin%'
          )
        ORDER BY created_at DESC
        LIMIT 25
      `)
    ]);

    const row = totalsRes.rows[0] || {};
    const pages = pagesRes.rows.map((p) => ({
      path: p.path,
      totalViews: parseInt(p.total_views, 10) || 0,
      uniqueUsers: parseInt(p.unique_users, 10) || 0
    }));

    // Funnel & Action Intelligence Query
    let funnelData = {
      productViews: 0,
      addToCart: 0,
      cartViews: 0,
      beginCheckout: 0,
      purchases: 0,
      rfqSubmitted: 0,
      cartRate: 0,
      checkoutRate: 0,
      purchaseRate: 0,
    };

    const latestEventsByVisitor: Record<string, { event: string; label: string; time: string }> = {};

    try {
      const [funnelRes, eventsRes] = await Promise.all([
        pool.query(`
          SELECT
            COUNT(*) FILTER (WHERE event_name IN ('product_card_viewed', 'product_detail_viewed')) as product_views,
            COUNT(*) FILTER (WHERE event_name = 'add_to_cart') as add_to_cart,
            COUNT(*) FILTER (WHERE event_name = 'cart_viewed') as cart_views,
            COUNT(*) FILTER (WHERE event_name = 'begin_checkout') as begin_checkout,
            COUNT(*) FILTER (WHERE event_name IN ('purchase', 'order_submitted')) as purchases,
            COUNT(*) FILTER (WHERE event_name = 'rfq_submitted') as rfq_submitted
          FROM site_events
          WHERE visitor_id NOT IN (${EXCLUDED_VISITOR_SQL})
            AND visitor_id NOT IN (
              SELECT DISTINCT visitor_id FROM site_visits WHERE path LIKE '/admin%'
            )
        `),
        pool.query(`
          SELECT DISTINCT ON (visitor_id)
            visitor_id,
            event_name,
            properties,
            created_at
          FROM site_events
          WHERE visitor_id NOT IN (${EXCLUDED_VISITOR_SQL})
          ORDER BY visitor_id, created_at DESC
        `)
      ]);

      const fRow = funnelRes.rows[0] || {};
      const pViews = parseInt(fRow.product_views, 10) || 0;
      const aCart = parseInt(fRow.add_to_cart, 10) || 0;
      const cViews = parseInt(fRow.cart_views, 10) || 0;
      const bCheckout = parseInt(fRow.begin_checkout, 10) || 0;
      const purch = parseInt(fRow.purchases, 10) || 0;
      const rfqSub = parseInt(fRow.rfq_submitted, 10) || 0;

      funnelData = {
        productViews: pViews,
        addToCart: aCart,
        cartViews: cViews,
        beginCheckout: bCheckout,
        purchases: purch,
        rfqSubmitted: rfqSub,
        cartRate: pViews > 0 ? Math.round((aCart / pViews) * 100) : (aCart > 0 ? 100 : 0),
        checkoutRate: aCart > 0 ? Math.round((bCheckout / aCart) * 100) : (bCheckout > 0 ? 100 : 0),
        purchaseRate: bCheckout > 0 ? Math.round((purch / bCheckout) * 100) : (purch > 0 ? 100 : 0),
      };

      for (const ev of eventsRes.rows) {
        let label = ev.event_name;
        const props = typeof ev.properties === 'object' && ev.properties ? ev.properties : {};
        if (ev.event_name === 'add_to_cart') {
          label = `🛒 Added ${props.title || props.name || 'item'} to Cart${props.price ? ` (₹${props.price})` : ''}`;
        } else if (ev.event_name === 'begin_checkout') {
          label = `💳 Proceeded to Checkout${props.value ? ` (₹${props.value})` : ''}`;
        } else if (ev.event_name === 'purchase' || ev.event_name === 'order_submitted') {
          label = `🎉 Order Placed${props.order_id ? ` (#${props.order_id})` : ''}`;
        } else if (ev.event_name === 'rfq_submitted') {
          label = `📋 Submitted Wholesale RFQ${props.product ? ` (${props.product})` : ''}`;
        } else if (ev.event_name === 'cart_viewed') {
          label = `👀 Viewed Cart Drawer (${props.item_count || 1} items)`;
        } else if (ev.event_name === 'coupon_applied') {
          label = `🏷️ Applied Coupon (${props.code})`;
        }
        latestEventsByVisitor[ev.visitor_id] = {
          event: ev.event_name,
          label,
          time: ev.created_at
        };
      }
    } catch (e) {
      console.warn('Funnel query note (table will initialize on first event):', e);
    }

    const recentVisitors = recentRes.rows.map((r) => ({
      visitorId: r.visitor_id,
      deviceType: r.device_type,
      deviceName: r.device_name,
      location: `${r.city}, ${r.region} (${r.country})`,
      path: r.path,
      createdAt: r.created_at,
      latestAction: latestEventsByVisitor[r.visitor_id]?.label || null,
      latestActionTime: latestEventsByVisitor[r.visitor_id]?.time || null,
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
      recentVisitors,
      funnel: funnelData,
      activeNow: parseInt(row.active_now, 10) || 0
    });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
