import { Pool } from 'pg';
import dns from 'node:dns';

// DNS resolver fallback for local development if ISP router blocks or refuses *.neon.tech IPv6
if (typeof window === 'undefined') {
  const origLookup = dns.lookup;
  let customResolver: dns.promises.Resolver | null = null;

  (dns as any).lookup = function (hostname: string, options: any, callback: any) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (hostname && typeof hostname === 'string' && hostname.includes('neon.tech')) {
      if (!customResolver) {
        customResolver = new dns.promises.Resolver();
        customResolver.setServers(['8.8.8.8', '1.1.1.1']);
      }
      customResolver
        .resolve4(hostname)
        .then((ips) => {
          if (options && options.all) {
            callback(null, ips.map((ip) => ({ address: ip, family: 4 })));
          } else {
            callback(null, ips[0], 4);
          }
        })
        .catch(() => {
          origLookup(hostname, options, callback);
        });
    } else {
      origLookup(hostname, options, callback);
    }
  };
}

declare global {
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://apple@localhost:5432/tiptur_direct';
const isNeon = connectionString.includes('neon.tech');

// Create a singleton connection pool for PostgreSQL
const pool =
  globalThis.__pgPool ||
  new Pool({
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgPool = pool;
}

export default pool;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
