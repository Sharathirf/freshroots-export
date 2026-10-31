import { after, NextResponse } from 'next/server';
import { fallbackRate, getDailyMandiPrice } from '@/lib/mandi-prices';
import { sendMandiPriceUpdate } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rate = await getDailyMandiPrice('arecanut');
    const { priceUpdated, ...publicRate } = rate;
    if (priceUpdated) {
      after(() => sendMandiPriceUpdate({
        commodity: 'arecanut',
        market: rate.market,
        pricePerQuintal: rate.pricePerQuintal,
        reportedAt: rate.reportedAt,
      }).catch((error) => console.error('Could not send arecanut mandi push alert:', error)));
    }
    return NextResponse.json(publicRate, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to read the Shimoga arecanut mandi cache:', error);
    return NextResponse.json(fallbackRate('arecanut'), {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  }
}
