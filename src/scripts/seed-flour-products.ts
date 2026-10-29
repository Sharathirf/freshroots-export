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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('🌾 Seeding Ragi Flour & Rice Flour into Neon Database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ragi Flour
    const ragiRes = await client.query(`
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
        description = EXCLUDED.description,
        specifications = EXCLUDED.specifications,
        image_url = EXCLUDED.image_url
      RETURNING id, sku;
    `, [
      'FLR-RAG-STN-05K',
      'Stone-Ground Ragi Flour',
      'mandya-stone-ground-ragi-flour-5kg',
      'spices',
      'Grade A Fine Stone-Milled Unadulterated Flour',
      'Mandya Agricultural Belt, Karnataka',
      '5 kg Bag',
      5.0,
      10.5,
      385.00,
      1,
      275.00,
      '110290',
      0.00,
      '100% pure stone-ground native Karnataka Ragi Flour (Finger Millet Flour / Ragi Hittu), freshly milled from destoned, canal-irrigated whole brown ragi grains grown in Mandya. Traditional slow stone-milling retains natural germ nutrition, dietary fiber, and rich calcium (344mg/100g) without heat buildup. Zero preservatives, maida blending, or synthetic bleaching. Ideal for authentic soft ragi mudde, crisp dosas, rotis, and nutritional baby malt porridge.',
      JSON.stringify({
        milling_type: 'Traditional slow cold-stone chakki milling',
        grain_source: '100% native unpolished Mandya finger millet',
        fiber_content: 'High dietary fiber (>11g/100g)',
        calcium: '344 mg per 100g naturally retained',
        packaging: 'Food-grade moisture-barrier poly-woven 5 kg bag (min 5 kg)',
        shelf_life: '90 days in airtight storage'
      }),
      '/products/ragi-flour-4k.jpg',
      true
    ]);
    const ragiId = ragiRes.rows[0].id;

    // Add inventory batch for Ragi Flour
    await client.query(`
      INSERT INTO inventory_batches (
        batch_number, product_id, origin_mandi, intake_date,
        initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
      ) VALUES ($1, $2, 'Mandya Milling Hub', CURRENT_DATE, 420, 420, 0, 0, 260.00)
      ON CONFLICT DO NOTHING;
    `, ['BAT-RAG-202610-01', ragiId]);
    console.log(`✅ Ragi Flour inserted/updated (ID: ${ragiId}) with 420 units stock`);

    // 2. Rice Flour
    const riceRes = await client.query(`
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
        description = EXCLUDED.description,
        specifications = EXCLUDED.specifications,
        image_url = EXCLUDED.image_url
      RETURNING id, sku;
    `, [
      'FLR-RIC-STN-05K',
      'Pure Rice Flour (Akki Hittu)',
      'pure-stone-ground-rice-flour-5kg',
      'spices',
      'Grade A Fine-Sifted Cold-Milled Pure White Rice Flour',
      'Mandya & Cauvery Basin, Karnataka',
      '5 kg Bag',
      5.0,
      11.0,
      365.00,
      1,
      250.00,
      '110290',
      0.00,
      'Fine stone-ground pure Rice Flour (Akki Hittu) crafted from selected high-grade raw Sona Masoori paddy grown in the Cauvery river basin. Machine-cleaned and finely stone-milled into silky, lump-free flour without chemical starches, talc, or additives. Naturally gluten-free with high binding capacity, making it the perfect staple for traditional Karnataka Akki Rotti, soft Idiyappam (shavige), crisp Murukku, Neer Dosa, and South Indian snacks.',
      JSON.stringify({
        milling_type: 'Fine stone-milled & multi-sifted for silk texture',
        paddy_source: 'Premium single-origin Cauvery Basin raw rice',
        gluten: 'Naturally 100% Gluten-Free',
        mesh_fineness: 'Fine mesh (>100 mesh for lump-free kneading)',
        packaging: 'Food-grade sealed 5 kg airtight moisture-guard bag (min 5 kg)',
        shelf_life: '90 days in cool dry place'
      }),
      '/products/rice-flour-4k.jpg',
      true
    ]);
    const riceId = riceRes.rows[0].id;

    // Add inventory batch for Rice Flour
    await client.query(`
      INSERT INTO inventory_batches (
        batch_number, product_id, origin_mandi, intake_date,
        initial_quantity, available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
      ) VALUES ($1, $2, 'Cauvery Basin Milling Cluster', CURRENT_DATE, 380, 380, 0, 0, 240.00)
      ON CONFLICT DO NOTHING;
    `, ['BAT-RIC-202610-01', riceId]);
    console.log(`✅ Rice Flour inserted/updated (ID: ${riceId}) with 380 units stock`);

    await client.query('COMMIT');
    console.log('🎉 Successfully seeded both flours into Neon PostgreSQL!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
