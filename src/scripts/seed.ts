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
      moisture_percentage: 5.5,
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
    },
    {
      sku: 'SPI-BYD-CHL-10K',
      title: 'GI-Tagged Byadgi Chilli (Stemless Wrinkled Premium)',
      slug: 'byadgi-chilli-stemless-10kg',
      category: 'spices',
      grade: 'Premium Stemless Wrinkled Grade A',
      origin: 'Haveri & Byadgi APMC Yard, Karnataka',
      unit_of_measure: '10 kg Corrugated Carton',
      estimated_weight_kg: 10.0,
      moisture_percentage: 9.5,
      oil_percentage: 16.0,
      retail_price_inr: 4200.00, // ₹420/kg
      bulk_min_quantity: 10, // 100 kg
      wholesale_benchmark_price_inr: 340.00, // ₹340/kg bulk
      hsn_code: '0904',
      tax_rate_percentage: 5.00,
      description: 'World-famous GI-certified Byadgi Chillies known for intense deep red oleoresin color (ASTA 150-180) and gentle mild pungency. 100% stemless, carefully sun-dried on clean farm beds. Essential for premium masala blenders, food processors, and gourmet culinary use.',
      specifications: {
        color_asta: '150 to 180 ASTA Units',
        heat_shu: '15,000 to 25,000 SHU (Mild)',
        stem_condition: '100% Destemmed / Clean',
        moisture_max: '10.0% certified',
        packaging: '5-ply corrugated carton with inner food liner'
      },
      image_url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'SPI-MLN-PEP-05K',
      title: 'Malnad Garbled Extra Bold Black Pepper (Tellicherry TGSEB)',
      slug: 'malnad-bold-black-pepper-5kg',
      category: 'spices',
      grade: 'Tellicherry Garbled Special Extra Bold (4.75mm+)',
      origin: 'Western Ghats / Malnad Corridor, Karnataka',
      unit_of_measure: '5 kg Food-Grade Pouch',
      estimated_weight_kg: 5.0,
      moisture_percentage: 10.5,
      oil_percentage: 3.5,
      retail_price_inr: 3600.00, // ₹720/kg
      bulk_min_quantity: 10, // 50 kg
      wholesale_benchmark_price_inr: 580.00, // ₹580/kg bulk
      hsn_code: '0904',
      tax_rate_percentage: 5.00,
      description: 'High-altitude Malnad black pepper harvested at peak ripeness from shaded biodiversity farms in Karnataka. Garbled over 4.75mm screens for uniform jumbo density. Intense aroma, high piperine content (>5.5%), and deep pungency.',
      specifications: {
        berry_size: '4.75 mm+ (Extra Bold)',
        piperine_content: '> 5.5%',
        bulk_density: '570 g/L minimum',
        packaging: 'Multi-layer hermetic aroma-barrier pouch'
      },
      image_url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'ARE-TUM-SUP-25K',
      title: 'Tumakuru Red Whole Areca Nut (Rashi Supari)',
      slug: 'tumakuru-red-areca-nut-25kg',
      category: 'spices',
      grade: 'Top Grade Rashi Whole Boiled',
      origin: 'Tumakuru & Gubbi Belt, Karnataka',
      unit_of_measure: '25 kg Gunny Sack',
      estimated_weight_kg: 25.0,
      moisture_percentage: 8.0,
      oil_percentage: null,
      retail_price_inr: 12500.00, // ₹500/kg
      bulk_min_quantity: 4, // 100 kg
      wholesale_benchmark_price_inr: 410.00, // ₹410/kg bulk
      hsn_code: '080280',
      tax_rate_percentage: 5.00,
      description: 'Traditional boiled and sun-cured whole red areca nuts (Rashi) procured directly from farmers in the Tumakuru-Gubbi agro-climatic corridor. Uniform grading, deep crimson color, free from fungal spots or insect damage.',
      specifications: {
        grading_type: 'Rashi Supari Whole',
        curing_process: 'Traditional Copper Vessel Boiled & Sun-Cured',
        moisture_max: '8.5%',
        packaging: 'Food-grade breathable jute sack'
      },
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'VCO-KRD-COL-05L',
      title: 'Raw Wood-Pressed Virgin Coconut Oil (Marachekku)',
      slug: 'wood-pressed-virgin-coconut-oil-5l',
      category: 'oil_and_extracts',
      grade: '100% Cold-Pressed Unrefined Raw',
      origin: 'Tiptur Coconut Processing Cluster, Karnataka',
      unit_of_measure: '5 Litre Food-Grade Tin',
      estimated_weight_kg: 4.6,
      moisture_percentage: 0.2,
      oil_percentage: 99.8,
      retail_price_inr: 1850.00, // ₹370/L
      bulk_min_quantity: 10, // 50 Litres
      wholesale_benchmark_price_inr: 290.00, // ₹290/L bulk
      hsn_code: '1513',
      tax_rate_percentage: 5.00,
      description: 'Extracted using traditional Vaagai wood cold expellers from fresh Tiptur copra at temperatures below 45°C. Preserves natural lauric acid (>50%), antioxidant vitamins, and fresh coconut aroma. Zero mineral oil, zero chemical bleaching.',
      specifications: {
        extraction_method: 'Traditional Wooden Ghani (Marachekku)',
        lauric_acid_content: '49% - 53%',
        free_fatty_acids_ffa: '< 0.2%',
        packaging: 'Sealed food-grade tin container'
      },
      image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'COI-PTH-BLK-05K',
      title: 'Washed Low-EC Horticultural Coir Pith (5 kg Blocks)',
      slug: 'washed-low-ec-coir-pith-5kg-blocks',
      category: 'coir_commodities',
      grade: 'Horticultural Export Grade (Washed)',
      origin: 'Tiptur & Hassan Coir Corridors, Karnataka',
      unit_of_measure: 'Pack of 5 Blocks (25 kg)',
      estimated_weight_kg: 25.0,
      moisture_percentage: 14.0,
      oil_percentage: null,
      retail_price_inr: 1250.00, // ₹50/kg
      bulk_min_quantity: 40, // 1 Tonne / Pallet
      wholesale_benchmark_price_inr: 32.00, // ₹32/kg bulk pallet
      hsn_code: '530500',
      tax_rate_percentage: 0.00, // 0% GST on coir pith
      description: 'Natural organic growing medium manufactured from aged coconut husks. Thoroughly washed in freshwater to achieve low electrical conductivity (EC < 0.5 mS/cm) and balanced pH (5.8-6.8). Expands to 75 litres per 5kg block upon hydration. Widely exported for greenhouses and hydroponics.',
      specifications: {
        electrical_conductivity_ec: '< 0.5 mS/cm (Washed)',
        ph_range: '5.8 - 6.8',
        expansion_volume: '70 to 75 Litres per 5kg block',
        compression_ratio: '5:1',
        packaging: 'Individually heat-wrapped 5kg blocks'
      },
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
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
