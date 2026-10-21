import { query } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runSeed() {
  console.log('🌱 Starting Tiptur Direct Database Migration and Seeding...');

  // 1. Read schema.sql
  const schemaPath = path.join(__dirname, '../lib/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing database schema creation...');
  await query(schemaSql);
  console.log('✅ Schema tables and indexes created successfully.');

  // 2. Seed Serviceable Pincodes
  console.log('Seeding serviceable pin codes...');
  const pincodes = [
    // Bengaluru Urban Core & Hubs
    { pincode: '560001', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Yeshwanthpur)', lead: 1 },
    { pincode: '560002', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Yeshwanthpur)', lead: 1 },
    { pincode: '560004', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Yeshwanthpur)', lead: 1 },
    { pincode: '560011', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Yeshwanthpur)', lead: 1 },
    { pincode: '560025', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Yeshwanthpur)', lead: 1 },
    { pincode: '560034', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Koramangala)', lead: 1 },
    { pincode: '560037', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Marathahalli)', lead: 1 },
    { pincode: '560066', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Whitefield)', lead: 1 },
    { pincode: '560076', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Bannerghatta)', lead: 1 },
    { pincode: '560085', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Banashankari)', lead: 1 },
    { pincode: '560100', district: 'Bengaluru Urban', hub: 'Bengaluru Forward Hub (Electronic City)', lead: 1 },
    // Sourcing Belt (Tumakuru / Tiptur / Hassan)
    { pincode: '572201', district: 'Tumakuru', hub: 'Tiptur Sourcing & Grading Hub', lead: 1 },
    { pincode: '572202', district: 'Tumakuru', hub: 'Tiptur Sourcing & Grading Hub', lead: 1 },
    { pincode: '572101', district: 'Tumakuru', hub: 'Tumakuru Sourcing Hub', lead: 1 },
    { pincode: '573201', district: 'Hassan', hub: 'Hassan Regional Hub', lead: 2 },
    { pincode: '570001', district: 'Mysuru', hub: 'Mysuru Distribution Hub', lead: 1 },
  ];

  for (const p of pincodes) {
    await query(
      `INSERT INTO serviceable_pincodes (pincode, district, hub_location, delivery_lead_days)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pincode) DO UPDATE SET hub_location = EXCLUDED.hub_location, delivery_lead_days = EXCLUDED.delivery_lead_days`,
      [p.pincode, p.district, p.hub, p.lead]
    );
  }
  console.log(`✅ Seeded ${pincodes.length} regional pin codes.`);

  // 3. Seed Verified Agricultural Products
  console.log('Seeding initial agricultural products...');
  const products = [
    {
      sku: 'COC-MTR-GRA-50',
      title: 'Grade A Mature Dehusked Coconuts (550g - 650g)',
      slug: 'grade-a-mature-coconuts-50-bag',
      category: 'mature_coconut',
      grade: 'Grade A Premium Jumbo',
      origin: 'Tiptur & Turuvekere, Karnataka',
      unit_of_measure: 'Bag of 50 Nuts',
      estimated_weight_kg: 28.5,
      moisture_percentage: 12.0,
      oil_percentage: 65.0,
      retail_price_inr: 1650.00, // ₹33 per nut
      bulk_min_quantity: 10,
      wholesale_benchmark_price_inr: 22.00, // ₹22 per nut in bulk lots
      hsn_code: '080112',
      tax_rate_percentage: 0.00, // Nil-rated fresh agriculture
      description: 'Hand-graded mature coconuts harvested at 11-12 months from the renowned Tiptur belt. Features thick sweet kernel meat (>12mm), loud water slosh, and clean dehusking. Ideal for household cooking, religious puja rituals, and premium food service.',
      specifications: {
        maturity_months: '11-12 Months',
        kernel_thickness_mm: '12-14 mm',
        packaging: 'High-density breathable HDPE mesh bag',
        shelf_life_days: 45,
        breakage_warranty: '100% replacement for cracked nuts upon delivery'
      },
      image_url: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'COC-MTR-GRB-50',
      title: 'Grade B Commercial Dehusked Coconuts (400g - 500g)',
      slug: 'grade-b-commercial-coconuts-50-bag',
      category: 'mature_coconut',
      grade: 'Grade B Commercial Medium',
      origin: 'Tumakuru & Mandya Corridor, Karnataka',
      unit_of_measure: 'Bag of 50 Nuts',
      estimated_weight_kg: 22.0,
      moisture_percentage: 12.5,
      oil_percentage: 64.0,
      retail_price_inr: 1350.00, // ₹27 per nut
      bulk_min_quantity: 10,
      wholesale_benchmark_price_inr: 18.00, // ₹18 per nut in bulk lots
      hsn_code: '080112',
      tax_rate_percentage: 0.00,
      description: 'Standard medium-sized mature coconuts optimized for restaurants, darshinis, industrial caterers, and food processing plants. Uniform grading with high kernel recovery per rupee spent.',
      specifications: {
        maturity_months: '10-11 Months',
        kernel_thickness_mm: '10-12 mm',
        packaging: 'Standard polypropylene woven gunny bag',
        shelf_life_days: 40,
        intended_use: 'HoReCa, chutney preparation, catering'
      },
      image_url: 'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'COP-BAL-TIP-25K',
      title: 'GI-Certified Tiptur Ball Copra (Edible Grade Rajapur)',
      slug: 'tiptur-ball-copra-edible-25kg',
      category: 'copra',
      grade: 'Special Grade Rajapur Whole Ball',
      origin: 'Tiptur APMC GI Corridor, Karnataka',
      unit_of_measure: '25 kg Corrugated Box',
      estimated_weight_kg: 25.0,
      moisture_percentage: 5.2,
      oil_percentage: 69.5,
      retail_price_inr: 4750.00, // ₹190/kg retail box
      bulk_min_quantity: 4, // 100 kg
      wholesale_benchmark_price_inr: 165.00, // ₹165/kg bulk
      hsn_code: '1203',
      tax_rate_percentage: 5.00, // 5% GST on copra
      description: 'World-renowned Geographical Indication (GI) tagged Tiptur Ball Copra. Naturally dried inside the shell over 9-11 months in traditional wooden drying attics. 100% sulphur-free, golden brown spherical kernel, rich in natural sweetness.',
      specifications: {
        curing_period: '9 to 11 Months in attic',
        drying_method: '100% natural, zero sulphur/smoke treatment',
        moisture_max: '5.5% certified',
        oil_yield_recovery: '68% to 70%',
        packaging: 'Food-grade 5-ply corrugated master carton with moisture liner'
      },
      image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'COP-MIL-SPL-50K',
      title: 'Industrial Milling Copra (Sun-Dried Split Cups)',
      slug: 'industrial-milling-copra-50kg',
      category: 'copra',
      grade: 'Fair Average Quality (FAQ) Milling',
      origin: 'Tiptur & Arsikere Mandis, Karnataka',
      unit_of_measure: '50 kg Gunny Bag',
      estimated_weight_kg: 50.0,
      moisture_percentage: 5.8,
      oil_percentage: 68.2,
      retail_price_inr: 7250.00, // ₹145/kg
      bulk_min_quantity: 10, // 500 kg
      wholesale_benchmark_price_inr: 125.00, // ₹125/kg bulk
      hsn_code: '1203',
      tax_rate_percentage: 5.00,
      description: 'High-yield sun-dried and hot-air kiln dried milling copra cups for cold-pressed oil mills and industrial expellers. Free from fungal mold, low free fatty acid (FFA < 1.0%), maximizing edible oil output.',
      specifications: {
        free_fatty_acids_ffa: '< 1.0%',
        foreign_matter_max: '< 0.8%',
        oil_content_recovery: '68% minimum',
        packaging: '50 kg breathable jute gunny sack',
        ideal_buyers: 'Oil expeller mills, Ayurvedic formulations'
      },
      image_url: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const prod of products) {
    const res = await query(
      `INSERT INTO products (
        sku, title, slug, category, grade, origin, unit_of_measure, estimated_weight_kg,
        moisture_percentage, oil_percentage, retail_price_inr, bulk_min_quantity,
        wholesale_benchmark_price_inr, hsn_code, tax_rate_percentage, description,
        specifications, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (sku) DO UPDATE SET
        retail_price_inr = EXCLUDED.retail_price_inr,
        wholesale_benchmark_price_inr = EXCLUDED.wholesale_benchmark_price_inr,
        title = EXCLUDED.title,
        description = EXCLUDED.description
      RETURNING id, sku`,
      [
        prod.sku, prod.title, prod.slug, prod.category, prod.grade, prod.origin, prod.unit_of_measure,
        prod.estimated_weight_kg, prod.moisture_percentage, prod.oil_percentage, prod.retail_price_inr,
        prod.bulk_min_quantity, prod.wholesale_benchmark_price_inr, prod.hsn_code, prod.tax_rate_percentage,
        prod.description, JSON.stringify(prod.specifications), prod.image_url
      ]
    );

    const productId = res[0].id;

    // 4. Seed Inventory Batches for each product
    await query(
      `INSERT INTO inventory_batches (
        batch_number, product_id, origin_mandi, intake_date, initial_quantity,
        available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
      ) VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '2 days', $4, $5, $6, $7, $8)
      ON CONFLICT (batch_number) DO NOTHING`,
      [
        `BATCH-${prod.sku}-202610A`,
        productId,
        'Tiptur APMC Yard',
        250, // initial bags
        220, // available
        25,  // reserved
        5,   // damaged / inspection rejected
        prod.retail_price_inr * 0.65 // 65% procurement base
      ]
    );
  }

  console.log(`✅ Seeded ${products.length} agricultural SKUs and corresponding inventory batches.`);

  // 5. Seed sample wholesale quotation for demonstration
  await query(
    `INSERT INTO wholesale_quotations (
      quote_number, company_name, contact_person, contact_phone, contact_email,
      product_title, requested_quantity, unit, destination_city, destination_pincode,
      proposed_unit_price_inr, freight_charges_inr, total_quote_inr, status, valid_until, notes
    ) VALUES (
      'RFQ-2026-001', 'Kaveri Oil Industries', 'Senthil Kumar', '+919443218765', 'senthil@kaverioil.com',
      'Industrial Milling Copra (Sun-Dried Split Cups)', 50, '50 kg Gunny Bag', 'Salem', '636001',
      6200.00, 4500.00, 314500.00, 'quote_issued', NOW() + INTERVAL '48 hours',
      'Verified expeller mill buyer. Agreed 30% advance on PO, 70% against weighbridge slip.'
    ) ON CONFLICT (quote_number) DO NOTHING`
  );

  console.log('✅ Seeded sample wholesale quotation.');
  console.log('🎉 Database seeding completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Database seeding failed:', err);
  process.exit(1);
});
