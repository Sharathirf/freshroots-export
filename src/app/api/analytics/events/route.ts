import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isExcludedVisitor } from '@/lib/analytics-exclusions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventName = typeof body.event === 'string' ? body.event.trim().slice(0, 64) : null;
    if (!eventName) {
      return NextResponse.json({ success: false, error: 'Missing event name' }, { status: 400 });
    }

    const rawPath = body.path || '/';
    const path = typeof rawPath === 'string' ? rawPath.slice(0, 255) : '/';
    const visitorId = typeof body.visitor_id === 'string' && body.visitor_id.trim()
      ? body.visitor_id.trim().slice(0, 64)
      : null;

    if (!visitorId || isExcludedVisitor(visitorId)) {
      return NextResponse.json({ success: true, ignored: true, reason: 'excluded_visitor' });
    }

    // Never track admin or API routes
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true, reason: 'admin_path' });
    }

    // Ignore if request comes from an authenticated admin device
    const cookieHeader = req.headers.get('cookie') || '';
    if (
      cookieHeader.includes('freshroots_admin_device=true') ||
      cookieHeader.includes('freshroots_admin_token') ||
      cookieHeader.includes('freshroots_admin_session') ||
      cookieHeader.includes('admin_session')
    ) {
      return NextResponse.json({ success: true, ignored: true, reason: 'admin_cookie' });
    }

    const properties = body.properties && typeof body.properties === 'object' ? body.properties : {};

    // Auto-create table if not exists (self-healing for all DB environments)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_events (
        id BIGSERIAL PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        event_name VARCHAR(64) NOT NULL,
        properties JSONB DEFAULT '{}',
        path VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_site_events_created_at ON site_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_site_events_event_name ON site_events(event_name);
      CREATE INDEX IF NOT EXISTS idx_site_events_visitor ON site_events(visitor_id);
    `);

    await pool.query(
      `INSERT INTO site_events (visitor_id, event_name, properties, path, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [visitorId, eventName, JSON.stringify(properties), path]
    );

    return NextResponse.json({ success: true, event: eventName });
  } catch (error: any) {
    console.error('Analytics event track error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
