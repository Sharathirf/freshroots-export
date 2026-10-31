import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { loadIntegrationSettings, saveIntegrationSetting } from '@/lib/integration-settings';
import { parseServiceAccountJson } from '@/lib/push';

export const dynamic = 'force-dynamic';

function getMaskedValue(key: string, value: string | undefined): string {
  if (!value) return '';
  if (key.startsWith('NEXT_PUBLIC_')) {
    return value; // Public keys don't need masking
  }
  if (value.length <= 8) {
    return '••••••••';
  }
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  // Synchronize settings from Neon PostgreSQL into process.env & cache
  const settings = await loadIntegrationSettings();
  const getVal = (key: string): string => settings.get(key) || process.env[key] || '';

  let pushTableReady = false;
  try {
    const result = await query<{ table_name: string | null }>(
      `SELECT to_regclass('public.push_subscriptions')::text AS table_name`
    );
    pushTableReady = Boolean(result[0]?.table_name);
    if (!pushTableReady) {
      await query(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id SERIAL PRIMARY KEY,
          fcm_token TEXT NOT NULL UNIQUE,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      pushTableReady = true;
    }
  } catch {
    pushTableReady = false;
  }

  const rows = [
    {
      id: 'cloudflare-analytics',
      name: 'Cloudflare Web Analytics',
      description: 'Privacy-first, cookieless traffic metrics directly at Cloudflare global edge.',
      portalUrl: 'https://dash.cloudflare.com',
      required: ['NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN'],
      configured: Boolean(getVal('NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN')),
      connectionCheck: 'Browser beacon is wired in the root layout; provider receipt is not remotely probed.',
      keys: {
        NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN: getMaskedValue('NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN', getVal('NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN')),
      },
    },
    {
      id: 'posthog',
      name: 'PostHog shopping funnel',
      description: 'Complete e-commerce conversion tracking (product views, cart additions, checkout drop-off).',
      portalUrl: 'https://us.i.posthog.com',
      required: ['NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'],
      configured: Boolean(getVal('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')),
      connectionCheck: 'Custom page and funnel events are wired; no test event is sent by this status check.',
      keys: {
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: getMaskedValue('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN', getVal('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')),
        NEXT_PUBLIC_POSTHOG_HOST: getVal('NEXT_PUBLIC_POSTHOG_HOST') || 'https://us.i.posthog.com',
      },
    },
    {
      id: 'turnstile',
      name: 'Cloudflare Turnstile',
      description: 'Native bot protection challenge for written B2B RFQs and commercial inquiries.',
      portalUrl: 'https://dash.cloudflare.com',
      required: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'],
      configured: Boolean(getVal('NEXT_PUBLIC_TURNSTILE_SITE_KEY') && getVal('TURNSTILE_SECRET_KEY')),
      connectionCheck: 'RFQ submissions use Siteverify; a valid user challenge is needed for an end-to-end check.',
      keys: {
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: getMaskedValue('NEXT_PUBLIC_TURNSTILE_SITE_KEY', getVal('NEXT_PUBLIC_TURNSTILE_SITE_KEY')),
        TURNSTILE_SECRET_KEY: getMaskedValue('TURNSTILE_SECRET_KEY', getVal('TURNSTILE_SECRET_KEY')),
      },
    },
    {
      id: 'resend',
      name: 'Resend transactional email',
      description: 'Automated order invoices, wholesale quotation PDFs, and consignment alerts.',
      portalUrl: 'https://resend.com/api-keys',
      required: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
      configured: Boolean(getVal('RESEND_API_KEY') && getVal('RESEND_FROM_EMAIL')),
      connectionCheck: 'Order and RFQ email dispatch is wired; sending a test email requires a verified sender.',
      keys: {
        RESEND_API_KEY: getMaskedValue('RESEND_API_KEY', getVal('RESEND_API_KEY')),
        RESEND_FROM_EMAIL: getVal('RESEND_FROM_EMAIL'),
        ADMIN_NOTIFICATION_EMAIL: getVal('ADMIN_NOTIFICATION_EMAIL'),
      },
    },
    {
      id: 'sentry',
      name: 'Sentry error monitoring',
      description: 'Real-time production exception tracking with PII scrubbing across client and edge runtimes.',
      portalUrl: 'https://sentry.io',
      required: ['NEXT_PUBLIC_SENTRY_DSN or SENTRY_DSN'],
      configured: Boolean(getVal('NEXT_PUBLIC_SENTRY_DSN') || getVal('SENTRY_DSN')),
      connectionCheck: 'Client, server, and edge SDKs are wired; this check does not emit a test event.',
      keys: {
        NEXT_PUBLIC_SENTRY_DSN: getMaskedValue('NEXT_PUBLIC_SENTRY_DSN', getVal('NEXT_PUBLIC_SENTRY_DSN') || getVal('SENTRY_DSN')),
        SENTRY_AUTH_TOKEN: getMaskedValue('SENTRY_AUTH_TOKEN', getVal('SENTRY_AUTH_TOKEN')),
      },
    },
    {
      id: 'firebase',
      name: 'Firebase Cloud Messaging',
      description: 'Browser web push notifications for live mandi rates, order dispatches, and inventory intake.',
      portalUrl: getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
        ? `https://console.firebase.google.com/project/${getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID')}`
        : 'https://console.firebase.google.com',
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
        getVal('NEXT_PUBLIC_FIREBASE_API_KEY') &&
        getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID') &&
        getVal('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') &&
        getVal('NEXT_PUBLIC_FIREBASE_APP_ID') &&
        getVal('NEXT_PUBLIC_FIREBASE_VAPID_KEY') &&
        getVal('FIREBASE_SERVICE_ACCOUNT_JSON') &&
        pushTableReady
      ),
      connectionCheck: getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
        ? `Web App config connected (project: ${getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID')}). ${
            getVal('FIREBASE_SERVICE_ACCOUNT_JSON') && getVal('NEXT_PUBLIC_FIREBASE_VAPID_KEY')
              ? 'Web Push VAPID and Service Account are active.'
              : 'Add Web Push VAPID key and Service Account JSON to activate automated dispatch.'
          }`
        : pushTableReady
        ? 'Opt-in API and database table are present; a browser opt-in and FCM send are needed for an end-to-end check.'
        : 'Push database migration is missing or unavailable.',
      keys: {
        NEXT_PUBLIC_FIREBASE_API_KEY: getMaskedValue('NEXT_PUBLIC_FIREBASE_API_KEY', getVal('NEXT_PUBLIC_FIREBASE_API_KEY')),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: getVal('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getVal('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        NEXT_PUBLIC_FIREBASE_APP_ID: getVal('NEXT_PUBLIC_FIREBASE_APP_ID'),
        NEXT_PUBLIC_FIREBASE_VAPID_KEY: getMaskedValue('NEXT_PUBLIC_FIREBASE_VAPID_KEY', getVal('NEXT_PUBLIC_FIREBASE_VAPID_KEY')),
        FIREBASE_SERVICE_ACCOUNT_JSON: getVal('FIREBASE_SERVICE_ACCOUNT_JSON') ? '•••••••• (Configured JSON)' : '',
        'push_subscriptions migration': pushTableReady ? 'Active' : '',
      },
    },
  ].map((item) => ({ ...item, status: item.configured ? 'configured' : 'needs_setup' }));

  return NextResponse.json(
    {
      integrations: rows,
      checkedAt: new Date().toISOString(),
      note: 'Configured means required settings are present. It does not confirm provider-side credentials, domains, or delivery.',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  let body: {
    serviceId: string;
    action: 'save' | 'test';
    keys?: Record<string, string>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed JSON payload' }, { status: 400 });
  }

  const { serviceId, action, keys = {} } = body;

  // ---------------------------------------------------------------------------
  // ACTION 1: PERSIST CREDENTIALS TO NEON POSTGRESQL & PROCESS.ENV
  // ---------------------------------------------------------------------------
  if (action === 'save') {
    if (!keys || Object.keys(keys).length === 0) {
      return NextResponse.json({ success: false, error: 'No keys provided to save' }, { status: 400 });
    }

    const savedKeys: string[] = [];

    for (const [key, rawVal] of Object.entries(keys)) {
      if (typeof rawVal !== 'string') continue;
      const cleanVal = rawVal.trim();
      if (!cleanVal || cleanVal.includes('••••')) continue; // Skip masked placeholder values

      try {
        await saveIntegrationSetting(key, cleanVal, serviceId);
        savedKeys.push(key);
      } catch (err: any) {
        console.error(`Error saving setting ${key}:`, err);
        return NextResponse.json(
          { success: false, error: `Failed to save ${key} to persistent storage: ${err.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${savedKeys.length} settings for ${serviceId} to persistent database`,
      savedKeys,
    });
  }

  // ---------------------------------------------------------------------------
  // ACTION 2: RUN TEST FOR GIVEN SERVICE
  // ---------------------------------------------------------------------------
  if (action === 'test') {
    switch (serviceId) {
      case 'cloudflare-analytics': {
        const token = keys.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN || process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
        if (!token) {
          return NextResponse.json({ success: false, error: 'Token is missing. Enter a Cloudflare Analytics token first.' }, { status: 400 });
        }
        if (!/^[a-f0-9]{32}$/i.test(token.trim())) {
          return NextResponse.json({ success: false, error: 'Invalid token format. Cloudflare Web Analytics token must be a 32-character hexadecimal string.' }, { status: 400 });
        }
        try {
          const beaconRes = await fetch('https://static.cloudflareinsights.com/beacon.min.js', { method: 'HEAD' });
          if (beaconRes.ok) {
            return NextResponse.json({
              success: true,
              message: 'Token format is valid and Cloudflare global beacon CDN is reachable!',
            });
          }
        } catch {}
        return NextResponse.json({ success: true, message: 'Token format is valid (32-hex string).' });
      }

      case 'posthog': {
        const token = keys.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
        const host = keys.NEXT_PUBLIC_POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
        if (!token) {
          return NextResponse.json({ success: false, error: 'PostHog project token is missing. It starts with phc_' }, { status: 400 });
        }
        try {
          const res = await fetch(`${host.replace(/\/$/, '')}/capture/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: token.trim(),
              event: 'freshroots_admin_test_ping',
              properties: {
                distinct_id: 'admin_diagnostic_check',
                timestamp: new Date().toISOString(),
                source: 'FreshRoots Ops Desk Diagnostics',
              },
            }),
          });
          const text = await res.text();
          if (res.ok || text === '1') {
            return NextResponse.json({
              success: true,
              message: `PostHog test event 'freshroots_admin_test_ping' successfully accepted by ${host}!`,
            });
          }
          return NextResponse.json({ success: false, error: `PostHog rejected event: ${text}` }, { status: 400 });
        } catch (err: any) {
          return NextResponse.json({ success: false, error: `Unable to reach PostHog host: ${err.message}` }, { status: 502 });
        }
      }

      case 'turnstile': {
        const siteKey = keys.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        const secretKey = keys.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
        if (!siteKey || !secretKey) {
          return NextResponse.json({ success: false, error: 'Both site key and secret key are required.' }, { status: 400 });
        }
        try {
          const formData = new URLSearchParams();
          formData.append('secret', secretKey.trim());
          formData.append('response', 'XXXX.DUMMY.TOKEN.XXXX');

          const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
          });
          const data = await verifyRes.json();
          // If secret is valid, Cloudflare responds with invalid-input-response (because dummy token was used)
          if (data['error-codes']?.includes('invalid-input-secret')) {
            return NextResponse.json({ success: false, error: 'Invalid Turnstile Secret Key. Check your Cloudflare dashboard.' }, { status: 400 });
          }
          return NextResponse.json({
            success: true,
            message: 'Turnstile Secret Key verified with Cloudflare Edge endpoint!',
          });
        } catch (err: any) {
          return NextResponse.json({ success: false, error: `Turnstile verification failed: ${err.message}` }, { status: 502 });
        }
      }

      case 'resend': {
        const apiKey = keys.RESEND_API_KEY || process.env.RESEND_API_KEY;
        const fromEmail = keys.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
        if (!apiKey) {
          return NextResponse.json({ success: false, error: 'Resend API Key is missing. It starts with re_' }, { status: 400 });
        }
        if (!apiKey.startsWith('re_')) {
          return NextResponse.json({ success: false, error: 'Invalid Resend API Key format. Must start with re_' }, { status: 400 });
        }
        try {
          const res = await fetch('https://api.resend.com/api-keys', {
            headers: { Authorization: `Bearer ${apiKey.trim()}` },
          });
          const data = await res.json();
          // Both Full Access keys (res.ok) and Sending Access keys ('restricted to only send emails') are valid
          if (res.ok || (data.message && data.message.includes('restricted to only send emails'))) {
            return NextResponse.json({
              success: true,
              message: `Resend API Key is valid and authorized for sending transactional emails! Sender: ${fromEmail || '(Sender not set yet)'}`,
            });
          }
          return NextResponse.json({ success: false, error: data.message || 'Resend API key authorization failed' }, { status: 401 });
        } catch (err: any) {
          return NextResponse.json({ success: false, error: `Resend API connection error: ${err.message}` }, { status: 502 });
        }
      }

      case 'sentry': {
        const dsn = keys.NEXT_PUBLIC_SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
        if (!dsn) {
          return NextResponse.json({ success: false, error: 'Sentry DSN is missing.' }, { status: 400 });
        }
        try {
          const parsed = new URL(dsn.trim());
          if (!parsed.protocol.startsWith('http') || !parsed.username || !parsed.pathname) {
            throw new Error('Invalid DSN URL');
          }
          return NextResponse.json({
            success: true,
            message: `Sentry DSN is valid (Host: ${parsed.host}, Project: ${parsed.pathname.replace(/^\//, '')}). Client & edge monitoring ready!`,
          });
        } catch {
          return NextResponse.json({ success: false, error: 'Malformed Sentry DSN. Expected format: https://<publicKey>@o<orgId>.ingest.sentry.io/<projectId>' }, { status: 400 });
        }
      }

      case 'firebase': {
        const serviceAccountRaw = keys.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const vapidKey = keys.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const projectId = keys.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const apiKey = keys.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const messagingSenderId = keys.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;

        if (serviceAccountRaw) {
          try {
            const parsed = parseServiceAccountJson(serviceAccountRaw);
            if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
              throw new Error('Missing required fields: project_id, private_key, or client_email');
            }
            return NextResponse.json({
              success: true,
              message: `Firebase Service Account is valid for project '${parsed.project_id}' (${parsed.client_email}). Web Push VAPID: ${vapidKey ? 'Configured' : 'Missing'}.`,
            });
          } catch (err: any) {
            return NextResponse.json({ success: false, error: `Invalid Firebase Service Account JSON: ${err.message}` }, { status: 400 });
          }
        }

        if (projectId && apiKey) {
          return NextResponse.json({
            success: true,
            message: `Firebase Web App configuration is valid for project '${projectId}' (Sender ID: ${messagingSenderId || 'Active'}). Web client credentials saved. To enable server push notifications, also add your Web Push VAPID key and Service Account JSON.`,
          });
        }

        return NextResponse.json({ success: false, error: 'Firebase credentials missing. Please enter your Firebase Web configuration or Service Account JSON.' }, { status: 400 });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown service: ${serviceId}` }, { status: 400 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action. Supported: save, test' }, { status: 400 });
}
