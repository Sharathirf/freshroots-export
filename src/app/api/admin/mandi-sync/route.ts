import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getDailyMandiPrice } from '@/lib/mandi-prices';
import { sendMandiPriceUpdate } from '@/lib/push';
import { isAdminSessionValid } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  // Allow authorized admin sessions
  if (isAdminSessionValid(request)) return true;

  // Allow Vercel Cron or external scheduler with CRON_SECRET or ADMIN_API_KEY
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.ADMIN_PASSWORD;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  if (adminSecret && authHeader === `Bearer ${adminSecret}`) return true;

  // Also check query param secret for easy manual trigger or webhook
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (cronSecret && querySecret === cronSecret) return true;
  if (adminSecret && querySecret === adminSecret) return true;

  return false;
}

async function handleSync(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin session or valid authorization token required' },
      { status: 401 }
    );
  }

  try {
    // 1. Fetch live daily APMC / ACROP mandi rates
    const [copraRate, arecanutRate] = await Promise.all([
      getDailyMandiPrice('copra'),
      getDailyMandiPrice('arecanut')
    ]);

    // 2. Trigger push notification broadcasts if price updated or force param present
    const forceBroadcast = request.nextUrl.searchParams.get('broadcast') === 'true';
    let broadcastCount = 0;

    if (copraRate.priceUpdated || forceBroadcast) {
      await sendMandiPriceUpdate({
        commodity: 'copra',
        market: copraRate.market,
        pricePerQuintal: copraRate.pricePerQuintal,
        reportedAt: copraRate.reportedAt
      }).catch(err => console.error('Failed to send Copra push notification:', err));
      broadcastCount++;
    }

    if (arecanutRate.priceUpdated || forceBroadcast) {
      await sendMandiPriceUpdate({
        commodity: 'arecanut',
        market: arecanutRate.market,
        pricePerQuintal: arecanutRate.pricePerQuintal,
        reportedAt: arecanutRate.reportedAt
      }).catch(err => console.error('Failed to send Arecanut push notification:', err));
      broadcastCount++;
    }

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      rates: {
        copra: copraRate,
        arecanut: arecanutRate
      },
      broadcastsSent: broadcastCount,
      message: 'ACROP Mandi rates successfully synchronized and broadcast triggers evaluated.'
    });
  } catch (error: any) {
    console.error('Error in /api/admin/mandi-sync:', error);
    Sentry.captureException(error, { tags: { route: '/api/admin/mandi-sync' } });
    return NextResponse.json(
      { success: false, error: 'Failed to synchronize Mandi rates', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}
