import dns from 'node:dns';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup DNS fallback for Neon connection
const resolver = new dns.promises.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);
const origLookup = dns.lookup;
(dns as any).lookup = function (hostname: string, options: any, callback: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname && typeof hostname === 'string' && hostname.includes('neon.tech')) {
    resolver.resolve4(hostname).then((ips) => {
      if (options && options.all) {
        callback(null, ips.map((ip) => ({ address: ip, family: 4 })));
      } else {
        callback(null, ips[0], 4);
      }
    }).catch(() => {
      origLookup(hostname, options, callback);
    });
  } else {
    origLookup(hostname, options, callback);
  }
};

import { Pool } from 'pg';
import { CATALOG_PRODUCTS } from '../lib/catalog';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncImages() {
  console.log('🔄 Syncing product image URLs in database with local 4K catalog...');
  const client = await pool.connect();
  try {
    for (const prod of CATALOG_PRODUCTS) {
      const res = await client.query(
        `UPDATE products SET image_url = $1 WHERE sku = $2 RETURNING sku, image_url`,
        [prod.image_url, prod.sku]
      );
      if (res.rowCount && res.rowCount > 0) {
        console.log(`✅ Updated ${prod.sku} -> ${prod.image_url}`);
      } else {
        console.log(`⚠️ SKU not in DB or skipped: ${prod.sku}`);
      }
    }
    console.log('🎉 Product image URLs synchronized successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

syncImages().catch(console.error);
