import { query } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runSeed() {
  console.log('🌱 Starting Sharath Inorahalli Database Migration and Seeding...');

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
    // Headquarters & Sourcing Belt (Mandya / Kikkeri / Tumakuru / Tiptur / Hassan)
    { pincode: '571423', district: 'Mandya (Kikkeri / K.R. Pete)', hub: 'Kikkeri Procurement Headquarters & Mandya Hub', lead: 1 },
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

  // 3. Clear existing catalog to keep ONLY user-requested 10 products
  console.log('Purging legacy products and resetting inventory batches...');
  await query(`DELETE FROM inventory_batches`);
  await query(`UPDATE wholesale_quotations SET product_id = NULL`);
  await query(`DELETE FROM products`);
  console.log('✅ Cleared legacy catalog.');

  // 4. Seed Verified User-Specified Products (10 SKUs)
  console.log('Seeding curated 10-product agricultural catalog...');
  const products = [
    // 1. Fresh Semi-Husked Mature Coconuts
    {
      sku: 'COC-SEMI-25P-15K',
      title: 'Fresh Semi-Husked Mature Coconuts (25-Piece Bag, ~15 kg)',
      slug: 'fresh-semi-husked-mature-coconuts-25-piece',
      category: 'mature_coconut',
      grade: 'Grade A Semi-Husked Mature (550g - 650g / nut)',
      origin: 'Kikkeri, K.R. Pete, Mandya & Tiptur, Karnataka',
      unit_of_measure: '25-Piece Bag (~15 kg)',
      estimated_weight_kg: 15.0,
      moisture_percentage: 12.0,
      oil_percentage: 65.0,
      retail_price_inr: 1350.00, // ₹90/kg, ₹1,350 per 25-piece bag
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 70.00, // ₹70/kg bulk
      hsn_code: '080112',
      tax_rate_percentage: 0.00, // Nil-rated fresh produce
      description: 'Handpicked fresh semi-husked mature coconuts directly from Mandya and Tiptur farms. Each 25-piece bag weighs approximately 15 kg (± 500g) priced at ₹90/kg (₹1,350 per unit). Features thick sweet kernel meat (>12mm), fresh coconut water, and clean semi-dehusking for easy cracking. Minimum order: 1 unit.',
      specifications: {
        pieces_per_unit: '25 Coconuts',
        net_weight: '15 kg (± 500g)',
        effective_rate: '₹90 / kg (₹1,350 / unit)',
        minimum_order: '1 Unit (25 Pieces)',
        maturity: '11 - 12 Months',
        packaging: 'High-density breathable HDPE mesh bag',
        intended_use: 'Household cooking, daily temple puja rituals, darshinis, retail'
      },
      image_url: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800&q=80'
    },

    // 2. Copra 15 kg, 25 kg, 30 kg boxes
    {
      sku: 'COP-BAL-BOX-15K',
      title: 'GI-Certified Tiptur Ball Copra (15 kg, 25 kg, 30 kg Boxes)',
      slug: 'tiptur-ball-copra-boxes-15kg',
      category: 'copra',
      grade: 'Special Grade Rajapur Whole Ball',
      origin: 'Tiptur APMC GI Corridor, Karnataka',
      unit_of_measure: '15 kg Box',
      estimated_weight_kg: 15.0,
      moisture_percentage: 5.2,
      oil_percentage: 69.5,
      retail_price_inr: 5250.00, // 15 kg Box at ₹350/kg
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 290.00, // ₹290/kg bulk
      hsn_code: '1203',
      tax_rate_percentage: 5.00,
      description: 'World-renowned Geographical Indication (GI) tagged Tiptur Ball Copra. Naturally dried inside the shell over 9-11 months in traditional wooden attics without sulphur treatment. Available in 15 kg, 25 kg, and 30 kg boxes at ₹350/kg (Base 15 kg box: ₹5,250). Minimum order: 1 quantity.',
      specifications: {
        available_box_sizes: '15 kg, 25 kg, 30 kg Master Cartons',
        rate_per_kg: '₹350 / kg',
        base_15kg_box_price: '₹5,250',
        moisture_max: '≤ 5.5% certified',
        drying_process: '100% Attic Cured, Zero Sulphur / Smoke',
        packaging: 'Food-grade 5-ply corrugated carton with moisture barrier liner'
      },
      image_url: '/products/tiptur-ball-copra.jpg'
    },

    // 3. Coconut Plants 1 Year Old 2 Feet
    {
      sku: 'NUR-COC-PLT-01Y',
      title: 'High-Yield Coconut Plants (1 Year Old, 2 Feet Height)',
      slug: 'high-yield-coconut-plants-1-year-2-feet',
      category: 'value_added',
      grade: '1-Year Hardy Seedling (Tiptur Tall / DWT Hybrid)',
      origin: 'Certified Farm Nursery, Kikkeri, Mandya, Karnataka',
      unit_of_measure: 'Plant / Sapling',
      estimated_weight_kg: 3.5,
      moisture_percentage: null,
      oil_percentage: null,
      retail_price_inr: 250.00, // ₹250 / piece
      bulk_min_quantity: 50, // Minimum 50 units per order
      wholesale_benchmark_price_inr: 210.00,
      hsn_code: '060290',
      tax_rate_percentage: 0.00,
      description: 'Hardy 1-year-old high-yield coconut saplings measuring approximately 2 feet in height. Raised with organic compost and vermiculture in UV-stabilized nursery bags. High disease tolerance, vigorous root development, and rapid field establishment. ₹250/piece. Minimum order: 50 units per order.',
      specifications: {
        age: '1 Year Old',
        height: 'Approx. 2 Feet',
        rate_per_piece: '₹250 / Piece',
        minimum_order_quantity: '50 Units per order',
        variety: 'Tiptur Tall / Selected High-Yield Cultivar',
        root_system: 'Established polybag root ball, ready for planting'
      },
      image_url: '/products/coconut-plants-saplings.jpg'
    },

    // 4. Wood-Pressed Groundnut Oil
    {
      sku: 'OIL-GND-WOD-01L',
      title: 'Pure Wood-Pressed Groundnut Oil (Marachekku Cold-Pressed)',
      slug: 'pure-wood-pressed-groundnut-oil-1l',
      category: 'oil_and_extracts',
      grade: '100% Cold-Pressed Unrefined Raw Virgin',
      origin: 'Kikkeri / Mandya Processing Unit, Karnataka',
      unit_of_measure: '1 Litre Bottle',
      estimated_weight_kg: 0.92,
      moisture_percentage: 0.1,
      oil_percentage: 99.9,
      retail_price_inr: 600.00, // ₹600 / litre
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 480.00,
      hsn_code: '1508',
      tax_rate_percentage: 5.00,
      description: 'Traditional wood-pressed (Marachekku) pure groundnut oil extracted at room temperature without chemical solvents, bleaching, or heating. Preserves genuine nutty aroma, natural vitamin E, and high mono-unsaturated fats (MUFA). ₹600/litre. Minimum order: 1 quantity.',
      specifications: {
        volume: '1 Litre Food-Grade Bottle',
        rate: '₹600 / Litre',
        extraction: 'Traditional Vaagai Wood Cold Ghani (Marachekku)',
        purity: '100% Pure Unrefined Single-Origin Groundnut Oil',
        free_fatty_acids: '< 0.5%'
      },
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
    },

    // 5. Ragi Millet 5kg, 10kg, 25kg
    {
      sku: 'MIL-RAG-ORG-05K',
      title: 'Pure Karnataka Ragi Millet (5 kg, 10 kg, 25 kg Packs)',
      slug: 'pure-karnataka-ragi-millet-5kg',
      category: 'spices',
      grade: 'Machine-Cleaned Whole Native Brown Ragi',
      origin: 'Mandya & Hassan Millet Belt, Karnataka',
      unit_of_measure: '5 kg Pack',
      estimated_weight_kg: 5.0,
      moisture_percentage: 10.0,
      oil_percentage: null,
      retail_price_inr: 600.00, // 5 kg at ₹120/kg = ₹600
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 95.00,
      hsn_code: '100829',
      tax_rate_percentage: 0.00,
      description: 'Nutritious whole brown finger millet (Ragi) sourced directly from dryland farms in Mandya and Hassan. Machine-cleaned and destoned, rich in bioavailable calcium (344mg/100g) and natural dietary fiber. ₹120/kg. Available in 5 kg (₹600), 10 kg (₹1,200), and 25 kg (₹3,000) bags. Minimum order: 1 quantity.',
      specifications: {
        available_pack_sizes: '5 kg, 10 kg, 25 kg Bags',
        rate_per_kg: '₹120 / kg',
        base_5kg_pack_price: '₹600',
        grain_type: '100% Whole Native Karnataka Finger Millet',
        cleaning: 'Destoned & Air-Cleaned'
      },
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
    },

    // 6. Farm-Fresh Pure Desi Cow Ghee (1 Litre)
    {
      sku: 'DAI-GHE-BIL-01L',
      title: 'Farm-Fresh Pure Desi Cow Ghee (Traditional Bilona, 1 Litre)',
      slug: 'farm-fresh-pure-desi-cow-ghee-1l',
      category: 'oil_and_extracts',
      grade: 'Traditional Cultured Curd Bilona Danedaar Ghee',
      origin: 'Rural Mandya Farm Dairy, Karnataka',
      unit_of_measure: '1 Litre Glass Jar',
      estimated_weight_kg: 0.91,
      moisture_percentage: 0.2,
      oil_percentage: 99.8,
      retail_price_inr: 900.00, // ₹900 / litre
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 760.00,
      hsn_code: '0405',
      tax_rate_percentage: 12.00,
      description: 'Traditional Desi cow ghee prepared by slow-simmering cultured whole milk curd churned with wooden bilonas. Authentic golden granular (danedaar) texture, rich nutty aroma, zero additives, and free from artificial flavorings or palm oil. ₹900/litre. Minimum order: 1 quantity.',
      specifications: {
        volume: '1 Litre Glass Jar',
        rate: '₹900 / Litre',
        texture: 'Golden Granular Danedaar Ghee',
        churning_process: 'Cultured Curd Wooden Bilona Method',
        shelf_life: '9 Months in cool ambient storage'
      },
      image_url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80'
    },

    // 7. Tender Coconut (Bulk Orders Only)
    {
      sku: 'COC-TND-BLK-LOT',
      title: 'Fresh Farm Tender Coconuts (Bulk Consignments Only)',
      slug: 'fresh-farm-tender-coconuts-bulk',
      category: 'mature_coconut',
      grade: 'Grade A Sweet Water Elaneeru (400ml+ Water)',
      origin: 'Mandya & Maddur Coconut Corridors, Karnataka',
      unit_of_measure: 'Piece (Bulk Truckload)',
      estimated_weight_kg: 2.2,
      moisture_percentage: 88.0,
      oil_percentage: null,
      retail_price_inr: 80.00, // Benchmark rate for quotes: ₹80 / piece
      bulk_min_quantity: 100, // Bulk only
      wholesale_benchmark_price_inr: 80.00,
      hsn_code: '080119',
      tax_rate_percentage: 0.00,
      description: 'Natural mineral-packed sweet tender coconuts (Elaneeru) harvested daily from canal-irrigated plantations in Mandya and Maddur. Yields 350-500ml sweet water with tender malai. Exclusively available for bulk consignments and institutional truckloads at benchmark ₹80/piece.',
      specifications: {
        procurement_mode: 'Bulk Wholesale Orders Only',
        benchmark_rate: '₹80 / Piece',
        water_content: '350 ml to 500 ml sweet coconut water per nut',
        dispatch_format: 'Direct farm-gate loading in mini truckloads or full lorries'
      },
      image_url: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80'
    },

    // 8. Fresh Ginger 50 kg (Bulk Orders Only)
    {
      sku: 'SPI-GIN-BLK-50K',
      title: 'Fresh Farm Ginger (50 kg Gunny Bag - Bulk Orders Only)',
      slug: 'fresh-farm-ginger-50kg-bulk',
      category: 'spices',
      grade: 'Grade A Bold Pungent Rhizomes',
      origin: 'Karnataka Agricultural Belts',
      unit_of_measure: '50 kg Bag',
      estimated_weight_kg: 50.0,
      moisture_percentage: 80.0,
      oil_percentage: null,
      retail_price_inr: 10000.00, // ₹10,000 / 50 kg unit
      bulk_min_quantity: 1, // 1 unit of 50 kg
      wholesale_benchmark_price_inr: 10000.00, // ₹10,000 / unit (₹200/kg)
      hsn_code: '091011',
      tax_rate_percentage: 0.00,
      description: 'Farm-fresh bold pungent ginger rhizomes direct from harvest. Clean, thick fibrous fingers with high juice and gingerol essential oil content. Sourced in standardized 50 kg gunny bags at ₹10,000/unit (₹200/kg). Exclusively for wholesale traders, food processing, and bulk commercial buyers.',
      specifications: {
        procurement_mode: 'Bulk Wholesale Orders Only',
        unit_packaging: '50 kg Jute Gunny Sack',
        unit_rate: '₹10,000 / 50 kg Unit (₹200 / kg)',
        rhizome_type: 'Bold, juicy, low fiber, intense pungency'
      },
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
    },

    // 9. Coconut Shell (Bulk Orders Only)
    {
      sku: 'COI-SHL-BLK-01T',
      title: 'Raw Coconut Shells (Industrial Grade - Bulk Orders Only)',
      slug: 'raw-coconut-shells-industrial-bulk-ton',
      category: 'coir_commodities',
      grade: 'Clean Dry Broken Shells (Moisture < 12%)',
      origin: 'Tiptur & Mandya Dehusking Corridors, Karnataka',
      unit_of_measure: 'Tonne (1,000 kg / MT)',
      estimated_weight_kg: 1000.0,
      moisture_percentage: 11.0,
      oil_percentage: null,
      retail_price_inr: 35000.00, // ₹35,000 / ton
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: 35000.00, // ₹35,000 / ton
      hsn_code: '140490',
      tax_rate_percentage: 5.00,
      description: 'Clean, dense mature coconut shells from Tiptur copra and dehusking clusters. High calorific value (>4,500 kcal/kg) and low ash content (<1.5%). Available in bulk metric tonnes at ₹35,000/ton. Ideal for activated carbon production, premium hookah briquettes, and industrial furnace fuel.',
      specifications: {
        procurement_mode: 'Bulk Industrial Consignments Only',
        rate_per_ton: '₹35,000 / Metric Tonne (MT)',
        calorific_value: '> 4,500 kcal/kg',
        moisture_max: '≤ 12.0% certified'
      },
      image_url: '/products/coconut-shells-pile.jpg'
    },

    // 10. Arecanut Plants (1 - 1.5 Feet)
    {
      sku: 'NUR-ARE-PLT-01Y',
      title: 'High-Yield Arecanut Plants (1 - 1.5 Feet Height)',
      slug: 'high-yield-arecanut-plants-1-foot',
      category: 'value_added',
      grade: '1 to 1.5 Feet Sturdy Seedling (South Indian Select)',
      origin: 'Certified Farm Nursery, Mandya & Malnad, Karnataka',
      unit_of_measure: 'Plant / Sapling',
      estimated_weight_kg: 1.2,
      moisture_percentage: null,
      oil_percentage: null,
      retail_price_inr: 60.00, // ₹60 / plant
      bulk_min_quantity: 200, // Minimum 200 units per order
      wholesale_benchmark_price_inr: 50.00,
      hsn_code: '060290',
      tax_rate_percentage: 0.00,
      description: 'Certified 1 to 1.5 feet high-yield arecanut seedlings raised from heavy-bearing mother palms. Robust stem caliper, disease resistance, and well-developed root structure. Ideal for orchard establishment and intercropping. Rate: ₹60 per plant. Minimum order: 200 units.',
      specifications: {
        height: '1 to 1.5 Feet',
        rate_per_plant: '₹60 / Plant',
        minimum_order_quantity: '200 Units per order',
        variety: 'High-Yield South Indian Select Areca',
        root_container: 'Polybag container with nutrient potting mix'
      },
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
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
      RETURNING id, sku`,
      [
        prod.sku, prod.title, prod.slug, prod.category, prod.grade, prod.origin, prod.unit_of_measure,
        prod.estimated_weight_kg, prod.moisture_percentage, prod.oil_percentage, prod.retail_price_inr,
        prod.bulk_min_quantity, prod.wholesale_benchmark_price_inr, prod.hsn_code, prod.tax_rate_percentage,
        prod.description, JSON.stringify(prod.specifications), prod.image_url
      ]
    );

    const productId = res[0].id;

    // 5. Seed Inventory Batches for each product
    await query(
      `INSERT INTO inventory_batches (
        batch_number, product_id, origin_mandi, intake_date, initial_quantity,
        available_quantity, reserved_quantity, damaged_quantity, cost_per_unit_inr
      ) VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '1 day', $4, $5, $6, $7, $8)`,
      [
        `BATCH-${prod.sku}-2026A`,
        productId,
        'Mandya & Tiptur APMC Corridors',
        500, // initial
        450, // available
        45,  // reserved
        5,   // damaged / sample
        Number(prod.retail_price_inr) * 0.65
      ]
    );
  }

  console.log(`✅ Seeded ${products.length} agricultural SKUs and corresponding inventory batches.`);

  // 6. Seed sample wholesale quotation for demonstration
  await query(
    `INSERT INTO wholesale_quotations (
      quote_number, company_name, contact_person, contact_phone, contact_email,
      product_title, requested_quantity, unit, destination_city, destination_pincode,
      proposed_unit_price_inr, freight_charges_inr, total_quote_inr, status, valid_until, notes
    ) VALUES (
      'RFQ-2026-001', 'Kaveri Agro Industries', 'Senthil Kumar', '+919443218765', 'senthil@kaveriagro.com',
      'Fresh Semi-Husked Mature Coconuts (25-Piece Bag, ~15 kg)', 200, '25-Piece Bag (~15 kg)', 'Bengaluru', '560001',
      1200.00, 3500.00, 243500.00, 'quote_issued', NOW() + INTERVAL '48 hours',
      'Commercial buyer. Scheduled truck dispatch from Kikkeri Mandya hub.'
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
