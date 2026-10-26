import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  let pushTableReady = false;
  try {
    const result = await query<{ table_name: string | null }>(
      `SELECT to_regclass('public.push_subscriptions')::text AS table_name`
    );
    pushTableReady = Boolean(result[0]?.table_name);
  } catch {
    pushTableReady = false;
  }

  const rows = [
    {
      id: 'cloudflare-analytics',
      name: 'Cloudflare Web Analytics',
      required: ['NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN'],
      configured: Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN),
      connectionCheck: 'Browser beacon is wired in the root layout; provider receipt is not remotely probed.',
    },
    {
      id: 'posthog',
      name: 'PostHog shopping funnel',
      required: ['NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'],
      configured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN),
      connectionCheck: 'Custom page and funnel events are wired; no test event is sent by this status check.',
    },
    {
      id: 'turnstile',
      name: 'Cloudflare Turnstile',
      required: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'],
      configured: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
      connectionCheck: 'RFQ submissions use Siteverify; a valid user challenge is needed for an end-to-end check.',
    },
    {
      id: 'resend',
      name: 'Resend transactional email',
      required: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
      configured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
      connectionCheck: 'Order and RFQ email dispatch is wired; sending a test email requires a verified sender.',
    },
    {
      id: 'sentry',
      name: 'Sentry error monitoring',
      required: ['NEXT_PUBLIC_SENTRY_DSN or SENTRY_DSN'],
      configured: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
      connectionCheck: 'Client, server, and edge SDKs are wired; this check does not emit a test event.',
    },
    {
      id: 'firebase',
      name: 'Firebase Cloud Messaging',
      required: [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
        'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
        'FIREBASE_SERVICE_ACCOUNT_JSON',
        'push_subscriptions migration',
      ],
      configured: Boolean(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY &&
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON &&
        pushTableReady
      ),
      connectionCheck: pushTableReady ? 'Opt-in API and database table are present; a browser opt-in and FCM send are needed for an end-to-end check.' : 'Push database migration is missing or unavailable.',
    },
  ].map((item) => ({ ...item, status: item.configured ? 'configured' : 'needs_setup' }));

  return NextResponse.json({
    integrations: rows,
    checkedAt: new Date().toISOString(),
    note: 'Configured means required settings are present. It does not confirm provider-side credentials, domains, or delivery.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
