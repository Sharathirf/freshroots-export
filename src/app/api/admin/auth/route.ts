import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import {
  adminCredentialsReady,
  adminSessionCookieOptions,
  clearAdminSessionCookie,
  createAdminSession,
  isAdminSessionValid,
  requestHasSameOrigin,
  verifyAdminPassword,
  verifyAdminTotp,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function requesterHash(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('Admin session secret is not configured');
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').map((value) => value.trim()).filter(Boolean);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || forwarded?.at(-1) || 'unknown';
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminSessionValid(request) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  if (!adminCredentialsReady()) {
    return NextResponse.json(
      { success: false, error: 'Admin access is not configured. Set ADMIN_PASSWORD and a 32-byte ADMIN_SESSION_SECRET.' },
      { status: 503 }
    );
  }

  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Invalid request origin' }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    const ipHash = requesterHash(request);
    const rate = await client.query<{ attempts: number }>(
      `INSERT INTO admin_login_attempts (ip_hash, window_started_at, attempts)
       VALUES ($1, NOW(), 1)
       ON CONFLICT (ip_hash) DO UPDATE
       SET attempts = CASE
             WHEN admin_login_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
             ELSE admin_login_attempts.attempts + 1
           END,
           window_started_at = CASE
             WHEN admin_login_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
             ELSE admin_login_attempts.window_started_at
           END
       RETURNING attempts`,
      [ipHash]
    );

    if (rate.rows[0]?.attempts > 8) {
      return NextResponse.json({ success: false, error: 'Too many sign-in attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    let body: { password?: unknown; totp?: unknown };
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    const totp = typeof body.totp === 'string' ? body.totp.trim() : '';

    const isValid =
      (totp && verifyAdminTotp(totp)) ||
      (password && verifyAdminPassword(password));

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid administrator password or Google Authenticator code' }, { status: 401 });
    }

    await client.query(`DELETE FROM admin_login_attempts WHERE ip_hash = $1`, [ipHash]);
    const session = createAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set('freshroots_admin_session', session.value, adminSessionCookieOptions(session.maxAge));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Admin authentication failed:', error);
    return NextResponse.json({ success: false, error: 'Administrator sign-in is temporarily unavailable' }, { status: 503 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Invalid request origin' }, { status: 403 });
  }
  return clearAdminSessionCookie(NextResponse.json({ success: true }));
}
