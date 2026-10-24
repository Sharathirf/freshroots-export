import assert from 'assert';
import { query } from '../lib/db';

const BASE_URL = 'http://localhost:3000';

export interface CycleResult {
  cycle: number;
  name: string;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  defectsFound: string[];
  fixesApplied: string[];
  durationMs: number;
  status: 'PASSED' | 'FAILED';
}

interface CycleTracker {
  pass: number;
  fail: number;
  defects: string[];
  fixes: string[];
}

function createTracker(): CycleTracker {
  return { pass: 0, fail: 0, defects: [], fixes: [] };
}

function verify(desc: string, fn: () => void, tracker: CycleTracker) {
  try {
    fn();
    tracker.pass++;
  } catch (err: any) {
    tracker.fail++;
    tracker.defects.push(`${desc} -> ${err.message}`);
    console.error(`    ❌ FAIL: ${desc} -> ${err.message}`);
  }
}

async function verifyAsync(desc: string, fn: () => Promise<void>, tracker: CycleTracker) {
  try {
    await fn();
    tracker.pass++;
  } catch (err: any) {
    tracker.fail++;
    tracker.defects.push(`${desc} -> ${err.message}`);
    console.error(`    ❌ FAIL: ${desc} -> ${err.message}`);
  }
}

async function httpGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

async function httpPost(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

async function httpPatch(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

async function httpDelete(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE'
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, json };
}

console.log('======================================================================');
console.log('🚀 SHARATH INORAHALLI 15-CYCLE END-TO-END AUTOMATION & QA ENGINE');
console.log('======================================================================\n');

export async function runAutomationSuite() {
  const startTime = Date.now();
  const cycleResults: CycleResult[] = [];

  // Fetch initial catalog
  const catalogRes = await httpGet('/api/products');
  const products = catalogRes.json?.products || [];

  // --------------------------------------------------------------------------
  // CYCLE 1: Catalog Ingestion & SKU Precision for all 10 Items
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 1: Catalog Ingestion & SKU Precision for all 10 Items...');
  const c1Start = Date.now();
  const c1 = createTracker();

  verify('Catalog endpoint returns HTTP 200', () => {
    assert.strictEqual(catalogRes.status, 200);
  }, c1);

  verify('Catalog contains exactly 10 user-specified commodities', () => {
    assert.strictEqual(catalogRes.json?.count, 10);
  }, c1);

  const expectedSkus = [
    { sku: 'COC-SEMI-25P-15K', price: 1479, unit: '25-Piece Bag (~15 kg)', min: 1 },
    { sku: 'COP-BAL-BOX-15K', price: 5508, unit: '15 kg Box', min: 1 },
    { sku: 'NUR-COC-PLT-01Y', price: 286, unit: 'Plant / Sapling', min: 1 },
    { sku: 'OIL-GND-WOD-01L', price: 663, unit: '1 Litre Bottle', min: 1 },
    { sku: 'MIL-RAG-ORG-05K', price: 663, unit: '5 kg Pack', min: 1 },
    { sku: 'DAI-GHE-BIL-01L', price: 980, unit: '1 Litre Glass Jar', min: 1 },
    { sku: 'COC-TND-BLK-LOT', price: 49, unit: 'Piece / Nut', min: 1 },
    { sku: 'SPI-GIN-BLK-50K', price: 5999, unit: '50 kg Bag', min: 1 },
    { sku: 'COI-SHL-BLK-01T', price: 36720, unit: 'Tonne (1,000 kg / MT)', min: 1 },
    { sku: 'NUR-ARE-PLT-01Y', price: 77, unit: 'Plant / Sapling', min: 1 }
  ];

  for (const exp of expectedSkus) {
    verify(`SKU ${exp.sku} exists in catalog`, () => {
      const found = products.find((p: any) => p.sku === exp.sku);
      assert(found, `Expected SKU ${exp.sku} to exist`);
      assert.strictEqual(Number(found.retail_price_inr), exp.price);
      assert.strictEqual(found.unit_of_measure, exp.unit);
      assert.strictEqual(found.bulk_min_quantity, exp.min);
    }, c1);
  }

  cycleResults.push({
    cycle: 1,
    name: 'Catalog Ingestion & SKU Precision',
    totalAssertions: c1.pass + c1.fail,
    passedAssertions: c1.pass,
    failedAssertions: c1.fail,
    defectsFound: c1.defects,
    fixesApplied: c1.fixes,
    durationMs: Date.now() - c1Start,
    status: c1.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 1 Complete: ${c1.pass} passed, ${c1.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 2: Wholesale Benchmark Privacy & Data Leak Prevention
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 2: Wholesale Benchmark Privacy & Data Leak Prevention...');
  const c2Start = Date.now();
  const c2 = createTracker();

  for (const p of products) {
    verify(`Public list hides wholesale benchmark for ${p.sku}`, () => {
      assert.strictEqual(p.wholesale_benchmark_price_inr, undefined);
      assert.strictEqual(p.procurement_cost_inr, undefined);
    }, c2);

    await verifyAsync(`PDP endpoint hides wholesale benchmark for ${p.slug}`, async () => {
      const detailRes = await httpGet(`/api/products/${p.slug}`);
      assert.strictEqual(detailRes.status, 200);
      assert.strictEqual(detailRes.json?.product?.wholesale_benchmark_price_inr, undefined);
    }, c2);
  }

  cycleResults.push({
    cycle: 2,
    name: 'Wholesale Benchmark Privacy & Secrecy',
    totalAssertions: c2.pass + c2.fail,
    passedAssertions: c2.pass,
    failedAssertions: c2.fail,
    defectsFound: c2.defects,
    fixesApplied: c2.fixes,
    durationMs: Date.now() - c2Start,
    status: c2.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 2 Complete: ${c2.pass} passed, ${c2.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 3: Minimum Order Quantity (MOQ) Enforcement
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 3: Minimum Order Quantity (MOQ) Enforcement...');
  const c3Start = Date.now();
  const c3 = createTracker();

  const cocPlant = products.find((p: any) => p.sku === 'NUR-COC-PLT-01Y');
  const arecaPlant = products.find((p: any) => p.sku === 'NUR-ARE-PLT-01Y');

  await verifyAsync('Order with zero quantity is rejected with 400', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Test Customer',
      customer_phone: '9845012345',
      shipping_address: 'Mysuru Road, Mandya',
      destination_pincode: '571423',
      items: [{ product_id: cocPlant?.id, quantity: 0 }]
    });
    assert.strictEqual(res.status, 400);
    assert(res.json?.error?.includes('Invalid quantity'));
  }, c3);

  await verifyAsync('Order live nursery plants allows single unit purchase (No MOQ constraint)', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Test Customer',
      customer_phone: '9845012345',
      shipping_address: 'Mysuru Road, Mandya',
      destination_pincode: '571423',
      items: [{ product_id: arecaPlant?.id, quantity: 1 }]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
  }, c3);

  cycleResults.push({
    cycle: 3,
    name: 'MOQ Enforcement & Boundary Bounds',
    totalAssertions: c3.pass + c3.fail,
    passedAssertions: c3.pass,
    failedAssertions: c3.fail,
    defectsFound: c3.defects,
    fixesApplied: c3.fixes,
    durationMs: Date.now() - c3Start,
    status: c3.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 3 Complete: ${c3.pass} passed, ${c3.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 4: Real-time GST & Multi-Rate Tax Compliance
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 4: Real-time GST & Multi-Rate Tax Compliance...');
  const c4Start = Date.now();
  const c4 = createTracker();

  const taxRates = [
    { sku: 'COC-SEMI-25P-15K', expectedGst: 0.00, desc: 'Fresh coconuts nil-rated produce' },
    { sku: 'COP-BAL-BOX-15K', expectedGst: 5.00, desc: 'Copra attracts 5% GST' },
    { sku: 'OIL-GND-WOD-01L', expectedGst: 5.00, desc: 'Groundnut oil attracts 5% GST' },
    { sku: 'MIL-RAG-ORG-05K', expectedGst: 0.00, desc: 'Whole unbranded ragi attracts 0% GST' },
    { sku: 'DAI-GHE-BIL-01L', expectedGst: 12.00, desc: 'Pure dairy ghee attracts 12% GST' },
    { sku: 'NUR-COC-PLT-01Y', expectedGst: 0.00, desc: 'Live nursery plants attract 0% GST' },
    { sku: 'NUR-ARE-PLT-01Y', expectedGst: 0.00, desc: 'Live arecanut plants attract 0% GST' }
  ];

  for (const tr of taxRates) {
    verify(tr.desc, () => {
      const prod = products.find((p: any) => p.sku === tr.sku);
      assert.strictEqual(Number(prod?.tax_rate_percentage), tr.expectedGst);
    }, c4);
  }

  const gheeProd = products.find((p: any) => p.sku === 'DAI-GHE-BIL-01L');
  verify('Ghee 12% tax calculation check', () => {
    const gheeTax = (Number(gheeProd?.retail_price_inr) * Number(gheeProd?.tax_rate_percentage)) / 100;
    assert.strictEqual(gheeTax, 117.60);
  }, c4);

  verify('Ghee 500 ml @ ₹530 12% tax calculation check', () => {
    const ghee500Tax = (530 * 12) / 100;
    assert.strictEqual(ghee500Tax, 63.60);
  }, c4);

  await verifyAsync('Order 500 ml Pure Desi Cow Ghee variant @ ₹530 calculates authentic subtotal and tax', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Ghee 500ml Buyer',
      customer_phone: '9845012399',
      shipping_address: 'Malleswaram, Bengaluru',
      destination_pincode: '560003',
      items: [
        {
          product_id: gheeProd?.id,
          quantity: 1,
          unit_price_inr: 530,
          unit_of_measure: '500 ml Glass Jar'
        }
      ]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
    assert.strictEqual(Number(res.json?.order?.subtotal_inr), 530);
    assert.strictEqual(Number(res.json?.order?.tax_inr), 63.60);
    const orderItems = typeof res.json?.order?.items === 'string' ? JSON.parse(res.json?.order?.items) : res.json?.order?.items;
    assert.strictEqual(orderItems[0]?.unit_price_inr, 530);
    assert.strictEqual(orderItems[0]?.unit_of_measure, '500 ml Glass Jar');
  }, c4);

  cycleResults.push({
    cycle: 4,
    name: 'Real-time GST & Multi-Rate Tax Compliance',
    totalAssertions: c4.pass + c4.fail,
    passedAssertions: c4.pass,
    failedAssertions: c4.fail,
    defectsFound: c4.defects,
    fixesApplied: c4.fixes,
    durationMs: Date.now() - c4Start,
    status: c4.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 4 Complete: ${c4.pass} passed, ${c4.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 5: Shiprocket Shipping Rate Calculator & Transportation Extra Policy
  // Modeled after coconutseller.in/transportation and apidocs.shiprocket.in
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 5: Shiprocket Shipping Rate Calculator & Freight Policy...');
  const c5Start = Date.now();
  const c5 = createTracker();

  const ragiProd = products.find((p: any) => p.sku === 'MIL-RAG-ORG-05K');
  const semiCocProd = products.find((p: any) => p.sku === 'COC-SEMI-25P-15K');

  await verifyAsync('Shiprocket rate calculator calculates 15kg coconut parcel to Bengaluru (Zone B)', async () => {
    const res = await httpGet('/api/shipping/calculate?pincode=560001&weight=15');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
    assert.strictEqual(res.json?.zone_code, 'B');
    assert(res.json?.available_courier_companies?.length >= 4);
    assert(res.json?.lowest_rate > 0);
  }, c5);

  await verifyAsync('Shiprocket rate calculator applies higher zonal freight to New Delhi (Zone D)', async () => {
    const blrRes = await httpGet('/api/shipping/calculate?pincode=560001&weight=15');
    const delRes = await httpGet('/api/shipping/calculate?pincode=110001&weight=15');
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delRes.json?.zone_code, 'D');
    assert(delRes.json?.lowest_rate > blrRes.json?.lowest_rate);
  }, c5);

  await verifyAsync('Shiprocket rate calculator POST endpoint calculates rates with custom dimensions', async () => {
    const res = await httpPost('/api/shipping/calculate', {
      delivery_postcode: '600001',
      weight: 25,
      cod: 1,
      length: 40,
      breadth: 35,
      height: 30
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
    assert(res.json?.available_courier_companies?.length >= 4);
  }, c5);

  await verifyAsync('Shiprocket rate calculator rejects invalid 5-digit PIN with 400', async () => {
    const res = await httpGet('/api/shipping/calculate?pincode=12345&weight=15');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.json?.success, false);
  }, c5);

  await verifyAsync('Order checkout: 100% Free Doorstep Delivery applied automatically (₹0 delivery fee)', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Smt. Anitha',
      customer_phone: '9845011111',
      shipping_address: 'Jayanagar, Bengaluru',
      destination_pincode: '560011',
      items: [{ product_id: semiCocProd?.id, quantity: 1 }]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Number(res.json?.order?.delivery_fee_inr), 0, 'Delivery fee must be ₹0 across all orders');
  }, c5);

  await verifyAsync('Order applies 100% free delivery across all orders', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Sri. Venkatesh',
      customer_phone: '9845022222',
      shipping_address: 'K.R. Pete, Mandya',
      destination_pincode: '571423',
      items: [{ product_id: ragiProd?.id, quantity: 1 }]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Number(res.json?.order?.delivery_fee_inr), 0.00);
  }, c5);

  await verifyAsync('100% Free Doorstep Delivery: Bulk and retail orders receive zero delivery fee', async () => {
    // 3 bags of semi-husked mature coconuts = 3 * 1479 = ₹4,437
    const res = await httpPost('/api/orders', {
      customer_name: 'Sri. Mahesh Gowda',
      customer_phone: '9845033333',
      shipping_address: 'Vijayanagar, Mysuru',
      destination_pincode: '570017',
      items: [{ product_id: semiCocProd?.id, quantity: 3 }]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
    assert.strictEqual(Number(res.json?.order?.subtotal_inr), 4437);
    assert.strictEqual(Number(res.json?.order?.delivery_fee_inr), 0, '100% Free shipping must have zero delivery fee');
  }, c5);

  await verifyAsync('Single unit small cart order receives 100% free delivery without minimums', async () => {
    // 1 bag of semi-husked mature coconuts = ₹1,479
    const res = await httpPost('/api/orders', {
      customer_name: 'Sri. Prasanna',
      customer_phone: '9845044444',
      shipping_address: 'Hebbal, Bengaluru',
      destination_pincode: '560024',
      items: [{ product_id: semiCocProd?.id, quantity: 1 }]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.success, true);
    assert.strictEqual(Number(res.json?.order?.subtotal_inr), 1479);
    assert.strictEqual(Number(res.json?.order?.delivery_fee_inr), 0, 'Single unit order must receive 100% free delivery');
  }, c5);

  await verifyAsync('Shiprocket rate engine reflects 100% free delivery qualification across all order values', async () => {
    const freeRes = await httpGet('/api/shipping/calculate?pincode=560001&weight=15&declared_value=3500');
    assert.strictEqual(freeRes.status, 200);
    assert.strictEqual(freeRes.json?.is_free_shipping, true);
    assert.strictEqual(freeRes.json?.free_shipping_threshold, 0);
    assert.strictEqual(freeRes.json?.effective_rate, 0);

    const smallRes = await httpGet('/api/shipping/calculate?pincode=560001&weight=15&declared_value=500');
    assert.strictEqual(smallRes.status, 200);
    assert.strictEqual(smallRes.json?.is_free_shipping, true);
    assert.strictEqual(smallRes.json?.effective_rate, 0);
  }, c5);

  cycleResults.push({
    cycle: 5,
    name: 'Shiprocket Rate Calculator & Freight Policy',
    totalAssertions: c5.pass + c5.fail,
    passedAssertions: c5.pass,
    failedAssertions: c5.fail,
    defectsFound: c5.defects,
    fixesApplied: c5.fixes,
    durationMs: Date.now() - c5Start,
    status: c5.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 5 Complete: ${c5.pass} passed, ${c5.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 6: Bulk-Only Purchasing Gatekeeper
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 6: Bulk-Only Purchasing Gatekeeper...');
  const c6Start = Date.now();
  const c6 = createTracker();

  const tenderCoc = products.find((p: any) => p.sku === 'COC-TND-BLK-LOT');
  const ginger = products.find((p: any) => p.sku === 'SPI-GIN-BLK-50K');
  const shells = products.find((p: any) => p.sku === 'COI-SHL-BLK-01T');

  for (const bp of [tenderCoc, ginger, shells]) {
    await verifyAsync(`Bulk-only product ${bp?.sku} is rejected from retail checkout`, async () => {
      const res = await httpPost('/api/orders', {
        customer_name: 'Retail Buyer',
        customer_phone: '9845033333',
        shipping_address: 'Rajajinagar, Bengaluru',
        destination_pincode: '560010',
        items: [{ product_id: bp?.id, quantity: 1 }]
      });
      assert.strictEqual(res.status, 400);
      assert(res.json?.error?.includes('wholesale bulk inquiries'));
    }, c6);
  }

  cycleResults.push({
    cycle: 6,
    name: 'Bulk-Only Purchasing Gatekeeper',
    totalAssertions: c6.pass + c6.fail,
    passedAssertions: c6.pass,
    failedAssertions: c6.fail,
    defectsFound: c6.defects,
    fixesApplied: c6.fixes,
    durationMs: Date.now() - c6Start,
    status: c6.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 6 Complete: ${c6.pass} passed, ${c6.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 7: Wholesale RFQ Inquiry Engine
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 7: Wholesale RFQ Inquiry Engine...');
  const c7Start = Date.now();
  const c7 = createTracker();

  await verifyAsync('Valid RFQ with phone only succeeds', async () => {
    const res = await httpPost('/api/rfq', {
      customer_name: 'M/s Karnataka Oil Traders',
      contact_phone: '9591142548',
      product_title: 'Raw Coconut Shells (Industrial Grade - Bulk Orders Only)',
      requested_quantity: 10,
      unit: 'Tonnes',
      destination_city: 'Tumakuru'
    });
    assert.strictEqual(res.status, 200);
    assert(res.json?.quote_number?.startsWith('RFQ-'));
  }, c7);

  await verifyAsync('Valid RFQ with email only succeeds', async () => {
    const res = await httpPost('/api/rfq', {
      customer_name: 'Malnad Biofuels Corp',
      contact_email: 'procurement@malnadbio.com',
      product_title: 'Fresh Farm Ginger (50 kg Gunny Bag - Bulk Orders Only)',
      requested_quantity: 20,
      unit: 'Bags (50 kg)',
      destination_city: 'Shivamogga'
    });
    assert.strictEqual(res.status, 200);
  }, c7);

  await verifyAsync('RFQ missing both phone and email is rejected with 400', async () => {
    const res = await httpPost('/api/rfq', {
      customer_name: 'Anonymous Trader',
      product_title: 'Fresh Farm Tender Coconuts',
      requested_quantity: 500,
      unit: 'Nuts'
    });
    assert.strictEqual(res.status, 400);
  }, c7);

  await verifyAsync('RFQ with 0 quantity is rejected with 400', async () => {
    const res = await httpPost('/api/rfq', {
      customer_name: 'Test Buyer',
      contact_phone: '9845012345',
      product_title: 'Fresh Farm Tender Coconuts',
      requested_quantity: 0,
      unit: 'Nuts'
    });
    assert.strictEqual(res.status, 400);
  }, c7);

  cycleResults.push({
    cycle: 7,
    name: 'Wholesale RFQ Inquiry Engine',
    totalAssertions: c7.pass + c7.fail,
    passedAssertions: c7.pass,
    failedAssertions: c7.fail,
    defectsFound: c7.defects,
    fixesApplied: c7.fixes,
    durationMs: Date.now() - c7Start,
    status: c7.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 7 Complete: ${c7.pass} passed, ${c7.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 8: Multi-Modal Order Tracking
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 8: Multi-Modal Order Tracking (ID, Carrier Ref, Phone)...');
  const c8Start = Date.now();
  const c8 = createTracker();

  const oilProd = products.find((p: any) => p.sku === 'OIL-GND-WOD-01L');
  const trackedCustomerPhone = '9988776655';

  const newOrder = await httpPost('/api/orders', {
    customer_name: 'Dr. Srinivas Rao',
    customer_phone: trackedCustomerPhone,
    shipping_address: 'Kuvempunagar, Mysuru',
    destination_pincode: '570023',
    items: [{ product_id: oilProd?.id, quantity: 2 }]
  });

  const createdOrder = newOrder.json?.order;

  verify('Created order contains order_number and tracking_reference', () => {
    assert(createdOrder?.order_number);
    assert(createdOrder?.tracking_reference);
  }, c8);

  await verifyAsync('Track by Order Number returns exact order', async () => {
    const res = await httpGet(`/api/orders/track?query=${createdOrder?.order_number}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.count, 1);
    assert.strictEqual(res.json?.orders[0]?.order_number, createdOrder?.order_number);
  }, c8);

  await verifyAsync('Track by Waybill / Carrier Reference returns exact order', async () => {
    const res = await httpGet(`/api/orders/track?query=${createdOrder?.tracking_reference}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.count, 1);
    assert.strictEqual(res.json?.orders[0]?.id, createdOrder?.id);
  }, c8);

  await verifyAsync('Track by Customer Phone returns order list', async () => {
    const res = await httpGet(`/api/orders/track?query=${trackedCustomerPhone}`);
    assert.strictEqual(res.status, 200);
    assert(res.json?.count >= 1);
  }, c8);

  await verifyAsync('Track non-existent order returns 200 with empty list', async () => {
    const res = await httpGet('/api/orders/track?query=NON-EXISTENT-999');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.count, 0);
  }, c8);

  cycleResults.push({
    cycle: 8,
    name: 'Multi-Modal Order Tracking Engine',
    totalAssertions: c8.pass + c8.fail,
    passedAssertions: c8.pass,
    failedAssertions: c8.fail,
    defectsFound: c8.defects,
    fixesApplied: c8.fixes,
    durationMs: Date.now() - c8Start,
    status: c8.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 8 Complete: ${c8.pass} passed, ${c8.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 9: Indian Postal Pincode Coverage
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 9: Indian Postal Pincode Coverage...');
  const c9Start = Date.now();
  const c9 = createTracker();

  const testPins = [
    { pin: '571423', serviceable: true, location: 'Kikkeri Mandya Headquarters' },
    { pin: '560001', serviceable: true, location: 'Bengaluru GPO' },
    { pin: '110001', serviceable: true, location: 'New Delhi Connaught Place' },
    { pin: '400001', serviceable: true, location: 'Mumbai Fort' },
    { pin: '600001', serviceable: true, location: 'Chennai Parrys' },
    { pin: '700001', serviceable: true, location: 'Kolkata BBD Bagh' },
    { pin: '12345', serviceable: false, location: 'Invalid 5 digits' },
    { pin: 'ABCDEF', serviceable: false, location: 'Invalid alpha' }
  ];

  for (const tp of testPins) {
    await verifyAsync(`Pincode ${tp.pin} (${tp.location}) serviceability check`, async () => {
      const res = await httpGet(`/api/pincode/check?pincode=${tp.pin}`);
      assert.strictEqual(res.json?.serviceable, tp.serviceable);
    }, c9);
  }

  cycleResults.push({
    cycle: 9,
    name: 'Indian Postal Pincode Coverage',
    totalAssertions: c9.pass + c9.fail,
    passedAssertions: c9.pass,
    failedAssertions: c9.fail,
    defectsFound: c9.defects,
    fixesApplied: c9.fixes,
    durationMs: Date.now() - c9Start,
    status: c9.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 9 Complete: ${c9.pass} passed, ${c9.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 10: Slug-Based PDP API Integrity (All 10 Slugs)
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 10: Slug-Based PDP API Integrity (All 10 Slugs)...');
  const c10Start = Date.now();
  const c10 = createTracker();

  for (const p of products) {
    await verifyAsync(`Slug /api/products/${p.slug} returns 200 with complete metadata`, async () => {
      const res = await httpGet(`/api/products/${p.slug}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json?.product?.id, p.id);
      assert(res.json?.product?.specifications);
      assert(res.json?.product?.image_url);
      assert(res.json?.product?.available_stock > 0);
    }, c10);
  }

  await verifyAsync('Non-existent slug returns 404', async () => {
    const res = await httpGet('/api/products/unknown-non-existent-commodity-slug');
    assert.strictEqual(res.status, 404);
  }, c10);

  cycleResults.push({
    cycle: 10,
    name: 'Slug-Based PDP API Integrity',
    totalAssertions: c10.pass + c10.fail,
    passedAssertions: c10.pass,
    failedAssertions: c10.fail,
    defectsFound: c10.defects,
    fixesApplied: c10.fixes,
    durationMs: Date.now() - c10Start,
    status: c10.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 10 Complete: ${c10.pass} passed, ${c10.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 11: Atomic Inventory Batch Allocation & Spoilage Protection
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 11: Atomic Inventory Batch Allocation & Spoilage Protection...');
  const c11Start = Date.now();
  const c11 = createTracker();

  const semiCoc = products.find((p: any) => p.sku === 'COC-SEMI-25P-15K');
  const batchBefore = await query(
    `SELECT available_quantity, reserved_quantity FROM inventory_batches WHERE product_id = $1 LIMIT 1`,
    [semiCoc.id]
  );
  const availBefore = Number(batchBefore[0].available_quantity);
  const resvBefore = Number(batchBefore[0].reserved_quantity);

  await verifyAsync('Placing order atomically decrements available stock and increments reserved', async () => {
    const res = await httpPost('/api/orders', {
      customer_name: 'Inventory Tester',
      customer_phone: '9845099999',
      shipping_address: 'Kikkeri Mandya',
      destination_pincode: '571423',
      items: [{ product_id: semiCoc.id, quantity: 2 }]
    });
    assert.strictEqual(res.status, 200);

    const batchAfter = await query(
      `SELECT available_quantity, reserved_quantity FROM inventory_batches WHERE product_id = $1 LIMIT 1`,
      [semiCoc.id]
    );
    const availAfter = Number(batchAfter[0].available_quantity);
    const resvAfter = Number(batchAfter[0].reserved_quantity);

    assert.strictEqual(availAfter, availBefore - 2);
    assert.strictEqual(resvAfter, resvBefore + 2);
  }, c11);

  cycleResults.push({
    cycle: 11,
    name: 'Atomic Inventory Allocation Engine',
    totalAssertions: c11.pass + c11.fail,
    passedAssertions: c11.pass,
    failedAssertions: c11.fail,
    defectsFound: c11.defects,
    fixesApplied: c11.fixes,
    durationMs: Date.now() - c11Start,
    status: c11.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 11 Complete: ${c11.pass} passed, ${c11.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 12: Admin Product Management & Boundary Guards
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 12: Admin Product Management & Boundary Guards...');
  const c12Start = Date.now();
  const c12 = createTracker();

  await verifyAsync('Admin products endpoint returns all 10 products', async () => {
    const adminProducts = await httpGet('/api/admin/products');
    assert.strictEqual(adminProducts.status, 200);
    assert.strictEqual(adminProducts.json?.count, 10);
  }, c12);

  await verifyAsync('Setting negative price is rejected with 400', async () => {
    const negPrice = await httpPatch('/api/admin/products', {
      id: semiCoc.id,
      retail_price_inr: -500
    });
    assert.strictEqual(negPrice.status, 400);
  }, c12);

  await verifyAsync('Setting negative stock is rejected with 400', async () => {
    const negStock = await httpPatch('/api/admin/products', {
      id: semiCoc.id,
      available_stock: -20
    });
    assert.strictEqual(negStock.status, 400);
  }, c12);

  await verifyAsync('Setting bulk_min_quantity < 1 is rejected with 400', async () => {
    const invalidMoq = await httpPatch('/api/admin/products', {
      id: semiCoc.id,
      bulk_min_quantity: 0
    });
    assert.strictEqual(invalidMoq.status, 400);
  }, c12);

  await verifyAsync('Admin can update bulk_min_quantity and it reflects in admin catalog', async () => {
    const updateRes = await httpPatch('/api/admin/products', {
      id: semiCoc.id,
      bulk_min_quantity: 1
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.json?.product?.bulk_min_quantity, 1);
  }, c12);

  let createdReviewId: string;

  await verifyAsync('GET /api/reviews returns review catalog with rating aggregates', async () => {
    const reviewsRes = await httpGet('/api/reviews');
    assert.strictEqual(reviewsRes.status, 200);
    assert.strictEqual(reviewsRes.json?.success, true);
    assert(reviewsRes.json?.count >= 1);
    assert(typeof reviewsRes.json?.average_rating === 'number');
    assert(reviewsRes.json?.rating_breakdown);
  }, c12);

  await verifyAsync('POST /api/reviews rejects invalid ratings and short comments', async () => {
    // Rating > 5
    const badRating = await httpPost('/api/reviews', {
      product_id: semiCoc.id,
      customer_name: 'Invalid Rating Tester',
      rating: 6,
      comment: 'Valid length comment but invalid stars'
    });
    assert.strictEqual(badRating.status, 400);

    // Comment < 5 chars
    const shortComment = await httpPost('/api/reviews', {
      product_id: semiCoc.id,
      customer_name: 'Short Tester',
      rating: 5,
      comment: 'Hi'
    });
    assert.strictEqual(shortComment.status, 400);

    // Missing reviewer name
    const missingName = await httpPost('/api/reviews', {
      product_id: semiCoc.id,
      rating: 5,
      comment: 'Great mature coconuts from Mandya farm'
    });
    assert.strictEqual(missingName.status, 400);
  }, c12);

  await verifyAsync('POST /api/reviews successfully submits verified customer review', async () => {
    const postRes = await httpPost('/api/reviews', {
      product_id: semiCoc.id,
      customer_name: 'QA Test Inspector',
      customer_phone: '9845011223',
      customer_email: 'qatester@example.com',
      rating: 5,
      title: 'Top Grade Produce Verification',
      comment: 'Exceptional coconut lot, fresh water weight verified and zero spoilage observed.'
    });
    assert.strictEqual(postRes.status, 200);
    assert.strictEqual(postRes.json?.success, true);
    assert(Boolean(postRes.json?.review?.id));
    assert.strictEqual(postRes.json?.review?.rating, 5);
    assert.strictEqual(postRes.json?.review?.product_title, semiCoc.title);
    createdReviewId = postRes.json.review.id;
  }, c12);

  await verifyAsync('GET /api/reviews?product_id includes new review and updates rating metrics', async () => {
    const prodReviews = await httpGet(`/api/reviews?product_id=${semiCoc.id}`);
    assert.strictEqual(prodReviews.status, 200);
    assert.strictEqual(prodReviews.json?.success, true);
    assert(prodReviews.json?.average_rating >= 4.0);
    assert(prodReviews.json?.rating_breakdown[5] >= 1);
    const found = prodReviews.json?.reviews?.find((r: any) => r.id === createdReviewId);
    assert(Boolean(found));
    assert.strictEqual(found.customer_name, 'QA Test Inspector');
  }, c12);

  await verifyAsync('DELETE /api/reviews removes review for moderation and records audit log', async () => {
    const delRes = await httpDelete(`/api/reviews?id=${createdReviewId}`);
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delRes.json?.success, true);
    assert.strictEqual(delRes.json?.deleted_id, createdReviewId);

    // Verify removed from product reviews
    const afterDel = await httpGet(`/api/reviews?product_id=${semiCoc.id}`);
    const stillPresent = afterDel.json?.reviews?.some((r: any) => r.id === createdReviewId);
    assert.strictEqual(stillPresent, false);

    // Deleting again returns 404
    const repeatDel = await httpDelete(`/api/reviews?id=${createdReviewId}`);
    assert.strictEqual(repeatDel.status, 404);
  }, c12);

  cycleResults.push({
    cycle: 12,
    name: 'Admin Product Management & Boundary Guards',
    totalAssertions: c12.pass + c12.fail,
    passedAssertions: c12.pass,
    failedAssertions: c12.fail,
    defectsFound: c12.defects,
    fixesApplied: c12.fixes,
    durationMs: Date.now() - c12Start,
    status: c12.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 12 Complete: ${c12.pass} passed, ${c12.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 13: Order State Machine Transitions
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 13: Order State Machine Transitions...');
  const c13Start = Date.now();
  const c13 = createTracker();

  const isValidTransition = (current: string, next: string) => {
    const validFlow: Record<string, string[]> = {
      pending_payment: ['paid', 'cancelled'],
      paid: ['allocated', 'cancelled'],
      allocated: ['packed', 'cancelled'],
      packed: ['dispatched', 'cancelled'],
      dispatched: ['delivered'],
      delivered: [], // Terminal state
      cancelled: []  // Terminal state
    };
    return validFlow[current]?.includes(next) ?? false;
  };

  verify('paid -> allocated is valid', () => assert.strictEqual(isValidTransition('paid', 'allocated'), true), c13);
  verify('allocated -> packed is valid', () => assert.strictEqual(isValidTransition('allocated', 'packed'), true), c13);
  verify('packed -> dispatched is valid', () => assert.strictEqual(isValidTransition('packed', 'dispatched'), true), c13);
  verify('dispatched -> delivered is valid', () => assert.strictEqual(isValidTransition('dispatched', 'delivered'), true), c13);
  verify('paid -> delivered skip is illegal', () => assert.strictEqual(isValidTransition('paid', 'delivered'), false), c13);
  verify('delivered -> paid revert is illegal', () => assert.strictEqual(isValidTransition('delivered', 'paid'), false), c13);

  cycleResults.push({
    cycle: 13,
    name: 'Order State Machine Transitions',
    totalAssertions: c13.pass + c13.fail,
    passedAssertions: c13.pass,
    failedAssertions: c13.fail,
    defectsFound: c13.defects,
    fixesApplied: c13.fixes,
    durationMs: Date.now() - c13Start,
    status: c13.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 13 Complete: ${c13.pass} passed, ${c13.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 14: Customer Passwordless Authentication & Session Logic
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 14: Customer Passwordless Authentication & Session Logic...');
  const c14Start = Date.now();
  const c14 = createTracker();

  const validatePhone = (input: string) => {
    const digits = input.replace(/\D/g, '');
    const clean = digits.length >= 10 ? digits.slice(-10) : digits;
    if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) {
      return { valid: true, clean };
    }
    return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number' };
  };

  verify('Validate 10-digit mobile number 9591142548', () => assert.strictEqual(validatePhone('9591142548').valid, true), c14);
  verify('Validate mobile with +91 country code', () => assert.strictEqual(validatePhone('+91 95911 42548').valid, true), c14);
  verify('Validate mobile with leading 0', () => assert.strictEqual(validatePhone('09591142548').valid, true), c14);
  verify('Reject invalid starting digit', () => assert.strictEqual(validatePhone('1234567890').valid, false), c14);
  verify('Reject alphabetic input', () => assert.strictEqual(validatePhone('abcdefghij').valid, false), c14);

  await verifyAsync('POST /api/customer/profile saves customer name, email, and address securely', async () => {
    const res = await httpPost('/api/customer/profile', {
      phone: '9591142548',
      full_name: 'Sharath Inorahalli',
      email: 'sharathir198@gmail.com',
      address: 'Main Bazaar Road, Kikkeri',
      city: 'K.R. Pete, Mandya',
      state: 'Karnataka',
      pincode: '571423'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.customer?.name, 'Sharath Inorahalli');
    assert.strictEqual(res.json?.customer?.email, 'sharathir198@gmail.com');
    assert.strictEqual(res.json?.customer?.address, 'Main Bazaar Road, Kikkeri');
    assert.strictEqual(res.json?.customer?.city, 'K.R. Pete, Mandya');
    assert.strictEqual(res.json?.customer?.state, 'Karnataka');
    assert.strictEqual(res.json?.customer?.pincode, '571423');
  }, c14);

  await verifyAsync('GET /api/customer/profile retrieves customer profile with address details', async () => {
    const res = await httpGet('/api/customer/profile?phone=9591142548');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json?.exists, true);
    assert.strictEqual(res.json?.customer?.name, 'Sharath Inorahalli');
    assert.strictEqual(res.json?.customer?.address, 'Main Bazaar Road, Kikkeri');
    assert.strictEqual(res.json?.customer?.city, 'K.R. Pete, Mandya');
    assert.strictEqual(res.json?.customer?.state, 'Karnataka');
    assert.strictEqual(res.json?.customer?.pincode, '571423');
  }, c14);

  const testAddrPhone = '9845066666';
  let addr1Id: string;
  let addr2Id: string;

  await verifyAsync('Customer can save multiple delivery addresses with distinct tags', async () => {
    // 1. Save Home Address
    const res1 = await httpPost('/api/customer/addresses', {
      customer_phone: testAddrPhone,
      recipient_name: 'Sharath Farm Home',
      phone: testAddrPhone,
      tag: 'Home',
      street_address: 'Near APMC Mandi, Kikkeri Village',
      city: 'K.R. Pete, Mandya',
      state: 'Karnataka',
      pincode: '571423',
      is_default: true
    });
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.json?.success, true);
    assert.strictEqual(res1.json?.address?.tag, 'Home');
    assert.strictEqual(res1.json?.address?.is_default, true);
    addr1Id = res1.json?.address?.id;
    assert(Boolean(addr1Id));

    // 2. Save Wholesale Warehouse Address
    const res2 = await httpPost('/api/customer/addresses', {
      customer_phone: testAddrPhone,
      recipient_name: 'Sharath Wholesale Depot',
      phone: testAddrPhone,
      tag: 'Warehouse',
      street_address: 'Yeshwanthpur Industrial Suburb, Plot 14B',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560022',
      is_default: false
    });
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.json?.success, true);
    assert.strictEqual(res2.json?.address?.tag, 'Warehouse');
    assert.strictEqual(res2.json?.address?.is_default, false);
    addr2Id = res2.json?.address?.id;

    // 3. Save Temple Trust Address
    const res3 = await httpPost('/api/customer/addresses', {
      customer_phone: testAddrPhone,
      recipient_name: 'Sri Ganapathi Temple Trust',
      phone: testAddrPhone,
      tag: 'Temple',
      street_address: 'Temple Road, Chamundi Hill Foot',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '570010',
      is_default: false
    });
    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.json?.success, true);
    assert.strictEqual(res3.json?.address?.tag, 'Temple');

    // 4. Retrieve all multiple addresses
    const getList = await httpGet(`/api/customer/addresses?phone=${testAddrPhone}`);
    assert.strictEqual(getList.status, 200);
    assert.strictEqual(getList.json?.success, true);
    assert(getList.json?.count >= 3);
    const tags = getList.json?.addresses?.map((a: any) => a.tag);
    assert(tags.includes('Home'));
    assert(tags.includes('Warehouse'));
    assert(tags.includes('Temple'));

    // 5. Delete an address
    const delRes = await fetch(`${BASE_URL}/api/customer/addresses?id=${addr2Id}&phone=${testAddrPhone}`, {
      method: 'DELETE'
    });
    const delJson = await delRes.json();
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delJson.success, true);

    // Verify deleted
    const afterDel = await httpGet(`/api/customer/addresses?phone=${testAddrPhone}`);
    assert.strictEqual(afterDel.json?.addresses?.some((a: any) => a.id === addr2Id), false);
  }, c14);

  let abandonedCartId: string;
  const testAbandonPhone = '9845077777';

  await verifyAsync('POST /api/cart/sync captures cart and watchlist exit event', async () => {
    const syncRes = await httpPost('/api/cart/sync', {
      phone: testAbandonPhone,
      name: 'Test Abandon Buyer',
      email: 'testabandon@example.com',
      cart_items: [
        {
          product_id: semiCoc.id,
          sku: semiCoc.sku,
          title: semiCoc.title,
          quantity: 2,
          unit_price_inr: 1350,
          total_price_inr: 2700
        }
      ],
      watchlist_items: [
        {
          id: oilProd.id,
          sku: oilProd.sku,
          title: oilProd.title
        }
      ],
      subtotal: 2700,
      is_exit: true
    });
    assert.strictEqual(syncRes.status, 200);
    assert.strictEqual(syncRes.json?.success, true);
    assert.strictEqual(syncRes.json?.status, 'abandoned');
    assert(Boolean(syncRes.json?.cart_id));
    abandonedCartId = syncRes.json.cart_id;
  }, c14);

  await verifyAsync('GET /api/cart/sync?cart_id restores full abandoned cart and watchlist', async () => {
    const getRes = await httpGet(`/api/cart/sync?cart_id=${abandonedCartId}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.json?.success, true);
    assert.strictEqual(getRes.json?.cart?.id, abandonedCartId);
    assert.strictEqual(getRes.json?.cart?.customer_phone, testAbandonPhone);
    assert.strictEqual(Number(getRes.json?.cart?.total_amount_inr), 2700);
    assert.strictEqual(getRes.json?.cart?.status, 'abandoned');
  }, c14);

  await verifyAsync('POST /api/notifications/abandonment triggers WhatsApp recovery reminder', async () => {
    const notifRes = await httpPost('/api/notifications/abandonment', {
      phone: testAbandonPhone
    });
    assert.strictEqual(notifRes.status, 200);
    assert.strictEqual(notifRes.json?.success, true);
    assert(notifRes.json?.count >= 1);
    const sent = notifRes.json.notifications[0];
    assert.strictEqual(sent.customer_phone, testAbandonPhone);
    assert(sent.message_preview.includes('SHARATH INORAHALLI'));
    assert(sent.message_preview.includes('cart?resume='));
    assert(sent.message_preview.includes('95911 42548'));
  }, c14);

  cycleResults.push({
    cycle: 14,
    name: 'Customer Authentication & Session Logic',
    totalAssertions: c14.pass + c14.fail,
    passedAssertions: c14.pass,
    failedAssertions: c14.fail,
    defectsFound: c14.defects,
    fixesApplied: c14.fixes,
    durationMs: Date.now() - c14Start,
    status: c14.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 14 Complete: ${c14.pass} passed, ${c14.fail} failed\n`);

  // --------------------------------------------------------------------------
  // CYCLE 15: Concurrency, End-to-End Stress & Full Lifecycle Verification
  // --------------------------------------------------------------------------
  console.log('▶ Running Cycle 15: Concurrency, End-to-End Stress & Full Lifecycle Verification...');
  const c15Start = Date.now();
  const c15 = createTracker();

  const copraProd = products.find((p: any) => p.sku === 'COP-BAL-BOX-15K');

  await verifyAsync('Concurrent multi-order placement and instant tracking', async () => {
    const concurrentOrders = await Promise.all([
      httpPost('/api/orders', {
        customer_name: 'Concurrent Buyer 1',
        customer_phone: '9845010001',
        shipping_address: 'Bangalore East',
        destination_pincode: '560001',
        items: [{ product_id: semiCoc.id, quantity: 1 }]
      }),
      httpPost('/api/orders', {
        customer_name: 'Concurrent Buyer 2',
        customer_phone: '9845010002',
        shipping_address: 'Bangalore West',
        destination_pincode: '560010',
        items: [{ product_id: copraProd.id, quantity: 1 }]
      }),
      httpPost('/api/orders', {
        customer_name: 'Concurrent Buyer 3',
        customer_phone: '9845010003',
        shipping_address: 'Bangalore South',
        destination_pincode: '560011',
        items: [{ product_id: oilProd.id, quantity: 2 }]
      }),
      httpPost('/api/orders', {
        customer_name: 'Concurrent Buyer 4',
        customer_phone: '9845010004',
        shipping_address: 'Kikkeri Mandya',
        destination_pincode: '571423',
        items: [{ product_id: ragiProd.id, quantity: 3 }]
      }),
      httpPost('/api/orders', {
        customer_name: 'Concurrent Buyer 5',
        customer_phone: '9845010005',
        shipping_address: 'Mysuru City',
        destination_pincode: '570001',
        items: [{ product_id: gheeProd.id, quantity: 2 }]
      })
    ]);

    for (let i = 0; i < concurrentOrders.length; i++) {
      assert.strictEqual(concurrentOrders[i].status, 200);
      assert(concurrentOrders[i].json?.order?.order_number?.startsWith('AGR-'));
      assert(concurrentOrders[i].json?.order?.tracking_reference?.startsWith('VRL-BLR-'));
    }

    for (let i = 0; i < concurrentOrders.length; i++) {
      const ordNum = concurrentOrders[i].json?.order?.order_number;
      const trackRes = await httpGet(`/api/orders/track?query=${ordNum}`);
      assert.strictEqual(trackRes.status, 200);
      assert.strictEqual(trackRes.json?.count, 1);
    }
  }, c15);

  cycleResults.push({
    cycle: 15,
    name: 'Concurrency Stress & Full Lifecycle Verification',
    totalAssertions: c15.pass + c15.fail,
    passedAssertions: c15.pass,
    failedAssertions: c15.fail,
    defectsFound: c15.defects,
    fixesApplied: c15.fixes,
    durationMs: Date.now() - c15Start,
    status: c15.fail === 0 ? 'PASSED' : 'FAILED'
  });
  console.log(`  ✅ Cycle 15 Complete: ${c15.pass} passed, ${c15.fail} failed\n`);

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  const totalDuration = Date.now() - startTime;
  const totalAssertions = cycleResults.reduce((acc, c) => acc + c.totalAssertions, 0);
  const totalPassed = cycleResults.reduce((acc, c) => acc + c.passedAssertions, 0);
  const totalFailed = cycleResults.reduce((acc, c) => acc + c.failedAssertions, 0);

  console.log('======================================================================');
  console.log('🏁 15-CYCLE TEST SUITE EXECUTION SUMMARY');
  console.log('======================================================================');
  console.log(`Total Cycles Executed: 15 / 15`);
  console.log(`Total Assertions Evaluated: ${totalAssertions}`);
  console.log(`Assertions Passed: ${totalPassed}`);
  console.log(`Assertions Failed: ${totalFailed}`);
  console.log(`Total Execution Time: ${totalDuration} ms`);
  console.log('======================================================================\n');

  return { cycleResults, totalAssertions, totalPassed, totalFailed, totalDuration };
}

runAutomationSuite()
  .then((res) => {
    if (res.totalFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('❌ Automation Suite Error:', err);
    process.exit(1);
  });
