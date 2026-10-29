import type { PoolClient } from 'pg';
import pool from './db';

export type MandiCommodity = 'copra' | 'arecanut';

type MandiPriceRow = {
  commodity: MandiCommodity;
  market_name: string;
  maximum_price_per_quintal: string | number;
  reported_at: string;
  source_url: string;
  checked_on: string | Date;
  refresh_status: 'seeded' | 'ok' | 'error' | 'older_report';
};

type ParsedMandiReport = {
  maximumPricePerQuintal: number;
  reportedAt: string;
};

type MandiPriceConfig = {
  marketName: string;
  sourceUrl: string;
  fallbackMaximumPricePerQuintal: number;
  fallbackReportedAt: string;
};

const CONFIG: Record<MandiCommodity, MandiPriceConfig> = {
  copra: {
    marketName: 'Tiptur Mandi',
    sourceUrl: 'https://acrop.app/mandi/karnataka/tumakuru/tiptur/copra',
    fallbackMaximumPricePerQuintal: 33_100,
    fallbackReportedAt: '29 Oct 2026',
  },
  arecanut: {
    marketName: 'Shimoga Mandi',
    sourceUrl: 'https://acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut',
    fallbackMaximumPricePerQuintal: 70_809,
    fallbackReportedAt: '29 Oct 2026',
  },
};

function indiaCalendarDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateString(value: string | Date) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(value);
  }
  return value.slice(0, 10);
}

function parseMandiReport(html: string): ParsedMandiReport | null {
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&rupee;/gi, ' ')
    .replace(/&#x([\da-f]+);/gi, (_entity, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_entity, decimal: string) => String.fromCharCode(Number(decimal)))
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

  const maximumMatch = text.match(/Maximum Price\s*:?\s*[\s₹]*([\d,]+(?:\.\d+)?)/i);
  const reportedAtMatch =
    text.match(/Reported on\s+(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i) ||
    text.match(/Latest available price:\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i);

  if (!maximumMatch || !reportedAtMatch) return null;
  const maximumPricePerQuintal = Number(maximumMatch[1].replace(/,/g, ''));
  if (!Number.isFinite(maximumPricePerQuintal) || maximumPricePerQuintal <= 0) return null;

  return { maximumPricePerQuintal, reportedAt: reportedAtMatch[1] };
}

async function readPrice(client: PoolClient, commodity: MandiCommodity) {
  const result = await client.query<MandiPriceRow>(
    `SELECT commodity, market_name, maximum_price_per_quintal, reported_at,
            source_url, checked_on, refresh_status
     FROM mandi_prices
     WHERE commodity = $1`,
    [commodity]
  );
  return result.rows[0];
}

function toApiRate(row: MandiPriceRow) {
  const pricePerQuintal = Number(row.maximum_price_per_quintal);
  return {
    commodity: row.commodity,
    market: row.market_name,
    pricePerQuintal,
    pricePerKg: Math.round((pricePerQuintal / 100) * 100) / 100,
    reportedAt: row.reported_at,
    checkedOn: dateString(row.checked_on),
    isFallback: row.refresh_status === 'seeded' || row.refresh_status === 'error' || row.refresh_status === 'older_report',
    source: row.source_url,
  };
}

function fallbackRate(commodity: MandiCommodity) {
  const config = CONFIG[commodity];
  return {
    commodity,
    market: config.marketName,
    pricePerQuintal: config.fallbackMaximumPricePerQuintal,
    pricePerKg: config.fallbackMaximumPricePerQuintal / 100,
    reportedAt: config.fallbackReportedAt,
    checkedOn: null,
    isFallback: true,
    source: config.sourceUrl,
  };
}

export async function getDailyMandiPrice(commodity: MandiCommodity) {
  const config = CONFIG[commodity];
  const lockKey = `mandi-price:${commodity}`;
  const client = await pool.connect();
  let lockAcquired = false;
  let priceUpdated = false;

  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', [lockKey]);
    lockAcquired = true;

    let row = await readPrice(client, commodity);
    if (!row) throw new Error(`Missing ${commodity} row in mandi_prices`);

    const today = indiaCalendarDate();
    if (dateString(row.checked_on) !== today) {
      try {
        const response = await fetch(config.sourceUrl, {
          headers: {
            accept: 'text/html,application/xhtml+xml',
            'user-agent': 'FreshRootsExportMandiTicker/1.0',
          },
          signal: AbortSignal.timeout(8_000),
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(`ACROP returned ${response.status}`);

        const report = parseMandiReport(await response.text());
        if (!report) throw new Error(`Could not parse the ${commodity} maximum from ACROP`);

        const existingReportDate = Date.parse(row.reported_at);
        const latestReportDate = Date.parse(report.reportedAt);
        if (
          Number.isFinite(existingReportDate) &&
          Number.isFinite(latestReportDate) &&
          latestReportDate < existingReportDate
        ) {
          await client.query(
            `UPDATE mandi_prices
             SET checked_on = $2, refresh_status = 'older_report', updated_at = NOW()
             WHERE commodity = $1`,
            [commodity, today]
          );
        } else {
          priceUpdated =
            Number(row.maximum_price_per_quintal) !== report.maximumPricePerQuintal ||
            Date.parse(String(row.reported_at)) !== Date.parse(report.reportedAt);
          await client.query(
            `UPDATE mandi_prices
             SET maximum_price_per_quintal = $2,
                 reported_at = $3,
                 checked_on = $4,
                 refresh_status = 'ok',
                 updated_at = NOW()
             WHERE commodity = $1`,
            [commodity, report.maximumPricePerQuintal, report.reportedAt, today]
          );
        }
      } catch (error) {
        console.warn(`Daily ${commodity} ACROP refresh failed; serving the last stored report.`, error);
        await client.query(
          `UPDATE mandi_prices
           SET checked_on = $2, refresh_status = 'error', updated_at = NOW()
           WHERE commodity = $1`,
          [commodity, today]
        );
      }

      row = await readPrice(client, commodity);
      if (!row) throw new Error(`Missing ${commodity} row after refresh`);
    }

    return { ...toApiRate(row), priceUpdated };
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock(hashtext($1))', [lockKey]);
    }
    client.release();
  }
}

export { fallbackRate };
