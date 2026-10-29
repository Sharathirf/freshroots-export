import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import { createShipmentForOrder } from '@/lib/crm-service';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const partner = searchParams.get('partner') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT s.*,
             o.order_number,
             o.customer_name,
             o.customer_phone,
             c.customer_code
      FROM shipments s
      JOIN orders o ON o.id = s.order_id
      LEFT JOIN customers c ON c.id = s.customer_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (search && search.trim()) {
      sql += ` AND (s.shipment_number ILIKE $${pIdx} OR s.tracking_number ILIKE $${pIdx} OR o.order_number ILIKE $${pIdx} OR o.customer_name ILIKE $${pIdx} OR s.vehicle_number ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (status && status !== 'all') {
      sql += ` AND s.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (partner && partner !== 'all') {
      sql += ` AND s.delivery_partner = $${pIdx}`;
      params.push(partner);
      pIdx++;
    }

    sql += ` ORDER BY s.created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
    params.push(limit, offset);

    const shipments = await query(sql, params);

    // Fetch tracking events for these shipments
    const shipmentIds = shipments.map((s: any) => s.id);
    let eventsMap: Record<string, any[]> = {};
    if (shipmentIds.length > 0) {
      const events = await query(
        `SELECT * FROM shipment_tracking_events WHERE shipment_id = ANY($1) ORDER BY event_timestamp DESC`,
        [shipmentIds]
      );
      eventsMap = events.reduce((acc: any, e: any) => {
        if (!acc[e.shipment_id]) acc[e.shipment_id] = [];
        acc[e.shipment_id].push(e);
        return acc;
      }, {});
    }

    const populated = shipments.map((s: any) => ({
      ...s,
      events: eventsMap[s.id] || [],
    }));

    return NextResponse.json({ success: true, count: populated.length, shipments: populated });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/shipments (GET):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/shipments', method: 'GET' } });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve shipments', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const body = await request.json();
    const {
      order_id,
      delivery_partner,
      shipment_type = 'courier',
      tracking_number,
      tracking_url,
      origin,
      destination,
      package_count = 1,
      dispatched_quantity_kg,
      vehicle_number,
      driver_name,
      driver_phone,
      consignment_note_number,
      lr_number,
      estimated_delivery_date,
      created_by_name = 'Logistics Officer',
    } = body;

    if (!order_id || !delivery_partner || !tracking_number) {
      return NextResponse.json(
        { success: false, error: 'order_id, delivery_partner, and tracking_number are required' },
        { status: 400 }
      );
    }

    const shipment = await createShipmentForOrder({
      order_id,
      delivery_partner,
      shipment_type,
      tracking_number,
      tracking_url,
      origin,
      destination,
      package_count,
      dispatched_quantity_kg,
      vehicle_number,
      driver_name,
      driver_phone,
      consignment_note_number,
      lr_number,
      estimated_delivery_date,
      created_by_name,
    });

    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    console.error('API Error in /api/admin/crm/shipments (POST):', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/crm/shipments', method: 'POST' } });
    return NextResponse.json(
      { success: false, error: 'Failed to create shipment', details: error.message },
      { status: 500 }
    );
  }
}
