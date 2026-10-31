import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { loadIntegrationSettings } from '@/lib/integration-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  await loadIntegrationSettings();
  const available = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
  return NextResponse.json({
    available,
    config: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
    },
  });
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Request origin is not allowed.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (token.length < 20 || token.length > 4096) {
      return NextResponse.json({ success: false, error: 'Invalid push subscription.' }, { status: 400 });
    }

    await query(
      `INSERT INTO push_subscriptions (fcm_token, user_agent, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (fcm_token) DO UPDATE
       SET user_agent = EXCLUDED.user_agent, updated_at = NOW()`,
      [token, String(request.headers.get('user-agent') || '').slice(0, 500) || null]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json({ success: false, error: 'Could not enable alerts right now.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Request origin is not allowed.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (token.length < 20 || token.length > 4096) {
      return NextResponse.json({ success: false, error: 'Invalid push subscription.' }, { status: 400 });
    }

    await query('DELETE FROM push_subscriptions WHERE fcm_token = $1', [token]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return NextResponse.json({ success: false, error: 'Could not turn off alerts right now.' }, { status: 500 });
  }
}
