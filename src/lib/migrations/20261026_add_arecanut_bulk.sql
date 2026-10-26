ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check CHECK (
    category IN (
      'mature_coconut',
      'copra',
      'arecanut',
      'spices',
      'oil_and_extracts',
      'coir_commodities',
      'value_added'
    )
  );

CREATE TABLE IF NOT EXISTS mandi_prices (
  commodity VARCHAR(30) PRIMARY KEY CHECK (commodity IN ('copra', 'arecanut')),
  market_name VARCHAR(100) NOT NULL,
  maximum_price_per_quintal NUMERIC(12, 2) NOT NULL CHECK (maximum_price_per_quintal > 0),
  reported_at VARCHAR(40) NOT NULL,
  source_url TEXT NOT NULL,
  checked_on DATE NOT NULL,
  refresh_status VARCHAR(20) NOT NULL DEFAULT 'seeded'
    CHECK (refresh_status IN ('seeded', 'ok', 'error', 'older_report')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mandi_prices (
  commodity, market_name, maximum_price_per_quintal, reported_at, source_url, checked_on
) VALUES
  (
    'copra', 'Tiptur Mandi', 34599, '22 Oct 2026',
    'https://acrop.app/mandi/karnataka/tumakuru/tiptur/copra', DATE '2026-10-22'
  ),
  (
    'arecanut', 'Shimoga Mandi', 70809, '22 Oct 2026',
    'https://acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut', DATE '2026-10-22'
  )
ON CONFLICT (commodity) DO NOTHING;

INSERT INTO products (
  sku,
  title,
  slug,
  category,
  grade,
  origin,
  unit_of_measure,
  estimated_weight_kg,
  moisture_percentage,
  oil_percentage,
  retail_price_inr,
  bulk_min_quantity,
  wholesale_benchmark_price_inr,
  hsn_code,
  tax_rate_percentage,
  description,
  specifications,
  image_url,
  is_active
) VALUES (
  'ARE-BLK-ADK-01Q',
  'Shimoga Arecanut (Adike)',
  'shimoga-arecanut-adike-bulk',
  'arecanut',
  'Mandi lot; variety and grade confirmed on quotation',
  'Shimoga Mandi, Shivamogga, Karnataka',
  'kg',
  1.0,
  NULL,
  NULL,
  708.09,
  100,
  708.09,
  '080280',
  0.00,
  'Bulk-only Shimoga arecanut (Adike) mandi lot. Use the ACROP Shimoga Mandi maximum-price reference in the catalog as a market benchmark; the actual lot price depends on variety, grade, quality, and quantity and is confirmed through a wholesale quotation. Minimum inquiry quantity: 100 kg (1 quintal). Retail checkout is disabled.',
  '{
    "commodity": "Arecanut (Adike)",
    "market": "Shimoga Mandi, Shivamogga, Karnataka",
    "market_reference": "Maximum ₹70,809 per quintal, reported 22 Oct 2026; ticker fetches the latest available ACROP report",
    "price_unit": "₹ per quintal (100 kg)",
    "minimum_bulk_quantity": "100 kg (1 quintal)",
    "ordering": "Wholesale quotation only; final rate confirmed by variety, grade, quality, and lot size"
  }'::jsonb,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  TRUE
)
ON CONFLICT (sku) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  grade = EXCLUDED.grade,
  origin = EXCLUDED.origin,
  unit_of_measure = EXCLUDED.unit_of_measure,
  estimated_weight_kg = EXCLUDED.estimated_weight_kg,
  moisture_percentage = EXCLUDED.moisture_percentage,
  oil_percentage = EXCLUDED.oil_percentage,
  retail_price_inr = EXCLUDED.retail_price_inr,
  bulk_min_quantity = EXCLUDED.bulk_min_quantity,
  wholesale_benchmark_price_inr = EXCLUDED.wholesale_benchmark_price_inr,
  hsn_code = EXCLUDED.hsn_code,
  tax_rate_percentage = EXCLUDED.tax_rate_percentage,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications,
  image_url = EXCLUDED.image_url,
  is_active = TRUE;
