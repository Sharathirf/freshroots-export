import { after, NextResponse } from 'next/server';
import { fallbackRate, getDailyMandiPrice } from '@/lib/mandi-prices';
import { sendMandiPriceUpdate } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rate = await getDailyMandiPrice('copra');
    const { priceUpdated, ...publicRate } = rate;
    if (priceUpdated) {
      after(() => sendMandiPriceUpdate({
        commodity: 'copra',
        market: rate.market,
        pricePerQuintal: rate.pricePerQuintal,
        reportedAt: rate.reportedAt,
      }).catch((error) => console.error('Could not send copra mandi push alert:', error)));
    }
    return NextResponse.json(publicRate);
  } catch (error) {
    console.error('Failed to read the Tiptur copra mandi cache:', error);
    return NextResponse.json(fallbackRate('copra'));
  }
}
