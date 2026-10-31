import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseDeviceName(ua: string): string {
  if (!ua) return 'Unknown Device';
  if (/iPhone/i.test(ua)) {
    const iosMatch = ua.match(/OS (\d+[_\.]\d+)/i);
    const iosVer = iosMatch ? `iOS ${iosMatch[1].replace('_', '.')}` : 'iOS';
    return `Apple iPhone (${iosVer})`;
  }
  if (/iPad/i.test(ua)) {
    return 'Apple iPad';
  }
  if (/Android/i.test(ua)) {
    const modelMatch = ua.match(/;\s*([^;]+)\s+Build\//i);
    const model = modelMatch ? modelMatch[1].trim() : 'Android Device';
    const verMatch = ua.match(/Android\s+([\d\.]+)/i);
    const androidVer = verMatch ? `Android ${verMatch[1]}` : 'Android';
    return `${model} (${androidVer})`;
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return 'Apple Mac (macOS)';
  }
  if (/Windows/i.test(ua)) {
    return 'Windows PC';
  }
  if (/Linux/i.test(ua)) {
    return 'Linux Desktop';
  }
  return 'Web Browser Device';
}

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
    const deviceName = parseDeviceName(userAgent);

    const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity') || null;
    const region = req.headers.get('x-vercel-ip-country-region') || req.headers.get('cf-region') || null;
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || null;
    const rawIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const ipAddress = rawIp ? rawIp.slice(0, 64) : null;

    const visitorId = clientVisitorId || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await pool.query(
      `INSERT INTO site_visits (visitor_id, path, referrer, user_agent, device_type, device_name, city, region, country, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [visitorId, path, referrer, userAgent.slice(0, 512), deviceType, deviceName, city, region, country, ipAddress]
    );

    return NextResponse.json({ success: true, visitor_id: visitorId });
  } catch (error: any) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
