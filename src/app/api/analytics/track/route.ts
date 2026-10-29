import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPath = body.path || '/';
    const path = typeof rawPath === 'string' ? rawPath.slice(0, 255) : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 512) : null;
    const clientVisitorId = typeof body.visitor_id === 'string' && body.visitor_id.trim()
      ? body.visitor_id.trim().slice(0, 64)
      : null;

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent);
    const deviceType = body.device_type || (isMobile ? 'mobile' : 'desktop');

    const visitorId = clientVisitorId || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await pool.query(
      `INSERT INTO site_visits (visitor_id, path, referrer, user_agent, device_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [visitorId, path, referrer, userAgent.slice(0, 512), deviceType]
    );

    return NextResponse.json({ success: true, visitor_id: visitorId });
  } catch (error: any) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
