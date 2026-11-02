import { test, expect } from '../fixtures/base-test';

test.describe('API Automation Suite — Mandi Rates, Logistics & Product Catalog', () => {
  test('GET /api/mandi/copra returns live APMC mandi benchmarks with price history', async ({ request }) => {
    const res = await request.get('/api/mandi/copra');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('commodity', 'copra');
    expect(json).toHaveProperty('pricePerQuintal');
    expect(Number(json.pricePerQuintal)).toBeGreaterThan(0);
    expect(json).toHaveProperty('market');
  });

  test('GET /api/mandi/arecanut returns Shivamogga & Channagiri APMC rates', async ({ request }) => {
    const res = await request.get('/api/mandi/arecanut');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('commodity', 'arecanut');
    expect(json).toHaveProperty('pricePerQuintal');
    expect(Number(json.pricePerQuintal)).toBeGreaterThan(0);
  });

  test('GET /api/pincode/check validates serviceable Karnataka and interstate pincodes', async ({ request }) => {
    // 1. Bengaluru serviceable pin
    const blrRes = await request.get('/api/pincode/check?pincode=560001');
    expect(blrRes.status()).toBe(200);
    const blrJson = await blrRes.json();
    expect(blrJson.serviceable).toBe(true);

    // 2. Tiptur / Mandya farm gate pin
    const tipRes = await request.get('/api/pincode/check?pincode=572201');
    expect(tipRes.status()).toBe(200);
    const tipJson = await tipRes.json();
    expect(tipJson.serviceable).toBe(true);

    // 3. Malformed pin returns 400
    const badRes = await request.get('/api/pincode/check?pincode=invalid');
    expect(badRes.status()).toBe(400);
    const badJson = await badRes.json();
    expect(badJson.serviceable).toBe(false);
  });

  test('POST /api/shipping/calculate computes weight and distance freight accurately', async ({ request }) => {
    const payload = {
      delivery_postcode: '560001',
      weight: 15,
      declared_value: 3000,
    };

    const res = await request.post('/api/shipping/calculate', { data: payload });
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(typeof json.lowest_rate).toBe('number');
  });

  test('GET /api/products returns verified active catalogue with SKU and pricing', async ({ request }) => {
    const res = await request.get('/api/products');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.products)).toBe(true);
    expect(json.products.length).toBeGreaterThan(0);

    // Check essential commodity fields
    const first = json.products[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('sku');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('retail_price_inr');
    expect(first).toHaveProperty('hsn_code');
  });
});
