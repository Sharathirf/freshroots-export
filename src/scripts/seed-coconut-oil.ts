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

async function seed() {
  console.log('🥥 Seeding Wood-Pressed Coconut Oil & syncing 14 catalog products in Neon DB...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert or update Wood-Pressed Coconut Oil
    const coconutOil = CATALOG_PRODUCTS.find((p) => p.sku === 'OIL-COC-WOD-01L');
    if (coconutOil) {
      const res = await client.query(`
        INSERT INTO products (
          sku, title, slug, category, grade, origin, unit_of_measure,
          estimated_weight_kg, moisture_percentage, retail_price_inr,
          bulk_min_quantity, wholesale_benchmark_price_inr, hsn_code,
          tax_rate_percentage, description, specifications, image_url, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (sku) DO UPDATE SET
          retail_price_inr = EXCLUDED.retail_price_inr,
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          category = EXCLUDED.category,
          grade = EXCLUDED.grade,
          origin = EXCLUDED.origin,
          unit_of_measure = EXCLUDED.unit_of_measure,
          estimated_weight_kg = EXCLUDED.estimated_weight_kg,
          moisture_percentage = EXCLUDED.moisture_percentage,
          bulk_min_quantity = EXCLUDED.bulk_min_quantity,
          wholesale_benchmark_price_inr = EXCLUDED.wholesale_benchmark_price_inr,
          hsn_code = EXCLUDED.hsn_code,
          tax_rate_percentage = EXCLUDED.tax_rate_percentage,
          description = EXCLUDED.description,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          is_active = EXCLUDED.is_active
        RETURNING id, sku;
      `, [
        coconutOil.sku,
        coconutOil.title,
        coconutOil.slug,
        coconutOil.category,
        coconutOil.grade,
        coconutOil.origin,
        coconutOil.unit_of_measure,
        coconutOil.estimated_weight_kg,
        coconutOil.moisture_percentage,
        coconutOil.retail_price_inr,
        coconutOil.bulk_min_quantity,
        coconutOil.wholesale_benchmark_price_inr,
        coconutOil.hsn_code,
        coconutOil.tax_rate_percentage,
        coconutOil.description,
        JSON.stringify(coconutOil.specifications),
        coconutOil.image_url,
        true
      ]);
      console.log('✅ Seeded Coconut Oil into products:', res.rows[0]);

      // Seed initial inventory batch
      await client.query(`
        INSERT INTO inventory_batches (
          batch_number, product_id, origin_mandi, intake_date,
          initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
        ) VALUES ($1, $2, 'Tiptur APMC & Kikkeri Hub', CURRENT_DATE, 260, 260, 0, 0, 420.00)
        ON CONFLICT DO NOTHING;
      `, [
        'BAT-COC-OIL-202610-01',
        res.rows[0].id
      ]);
    }

    // 2. Ensure all other products have exact matching image_urls
    for (const prod of CATALOG_PRODUCTS) {
      await client.query(
        `UPDATE products SET image_url = $1 WHERE sku = $2`,
        [prod.image_url, prod.sku]
      );
    }

    await client.query('COMMIT');
    console.log('🎉 Successfully synchronized all 14 catalog products in Neon DB.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding coconut oil:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
