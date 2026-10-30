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
  console.log('🪵 Seeding Coconut Shell Charcoal & syncing 15 catalog products in Neon DB...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert or update Coconut Shell Charcoal
    const charcoal = CATALOG_PRODUCTS.find((p) => p.sku === 'COI-CHR-BLK-01T');
    if (charcoal) {
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
        charcoal.sku,
        charcoal.title,
        charcoal.slug,
        charcoal.category,
        charcoal.grade,
        charcoal.origin,
        charcoal.unit_of_measure,
        charcoal.estimated_weight_kg,
        charcoal.moisture_percentage,
        charcoal.retail_price_inr,
        charcoal.bulk_min_quantity,
        charcoal.wholesale_benchmark_price_inr,
        charcoal.hsn_code,
        charcoal.tax_rate_percentage,
        charcoal.description,
        JSON.stringify(charcoal.specifications),
        charcoal.image_url,
        charcoal.is_active
      ]);

      const productId = res.rows[0].id;
      console.log(`✅ Coconut Shell Charcoal product synced with ID: ${productId}`);

      // Seed initial inventory batch for charcoal
      await client.query(`
        INSERT INTO inventory_batches (
          batch_number, product_id, origin_mandi, intake_date,
          initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
        ) VALUES (
          $1, $2, 'Tiptur Carbonization Kiln', CURRENT_DATE, 35, 35, 0, 0, 95000.00
        )
        ON CONFLICT DO NOTHING;
      `, [
        'BAT-CHR-202610-001',
        productId
      ]);
      console.log('✅ Inventory batch BAT-CHR-202610-001 seeded (35 Metric Tonnes available stock)');
    }

    // 2. Ensure all products in DB have exact matching image_url & active status
    for (const prod of CATALOG_PRODUCTS) {
      await client.query(
        `UPDATE products SET image_url = $1, is_active = true WHERE sku = $2`,
        [prod.image_url, prod.sku]
      );
    }

    await client.query('COMMIT');
    console.log('🎉 Coconut Shell Charcoal seeded successfully in Neon DB!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding coconut shell charcoal:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
