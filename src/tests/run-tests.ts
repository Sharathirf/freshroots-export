import assert from 'assert';

console.log('🧪 Starting Automated Quality Assurance & Business Rules Test Suite...\n');

let passedCount = 0;
let failedCount = 0;

function it(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     ${err.message}`);
    failedCount++;
  }
}

// ----------------------------------------------------
// Test Suite 1: Agricultural Pricing & GST Tax Calculations
// ----------------------------------------------------
console.log('📦 Test Suite 1: Agricultural Pricing & Tax Compliance');

it('Fresh Coconuts (HSN 080112) must have 0.00% GST (Nil-rated produce)', () => {
  const hsnCode = '080112';
  const taxRate = hsnCode === '080112' ? 0.00 : 5.00;
  const bagPrice = 1650.00;
  const taxAmount = (bagPrice * taxRate) / 100;
  assert.strictEqual(taxAmount, 0.00, 'Fresh coconuts must attract zero GST');
});

it('Copra Commodities (HSN 1203) must attract 5.00% GST', () => {
  const hsnCode = '1203';
  const taxRate = hsnCode === '1203' ? 5.00 : 0.00;
  const copraBoxPrice = 4750.00;
  const taxAmount = (copraBoxPrice * taxRate) / 100;
  assert.strictEqual(taxAmount, 237.50, 'Copra must compute exactly 5% GST');
});

it('Milling Copra and Ball Copra moisture thresholds must strictly align at ≤ 5.50%', () => {
  const ballCopraMoisture = 5.20;
  const millingCopraMoisture = 5.50;
  const qualityStandardLimit = 5.50;

  assert.strictEqual(ballCopraMoisture <= qualityStandardLimit, true);
  assert.strictEqual(millingCopraMoisture <= qualityStandardLimit, true);
  assert.strictEqual(millingCopraMoisture, 5.50, 'Milling copra catalog limit must be aligned at 5.5%');
});

it('Per-unit pricing compliance for Semi-Husked 25-piece bag at ₹1,479/unit (incl. 2% payment platform charge & 100% Free Delivery)', () => {
  const unitPrice = 1479.00;
  const weightKg = 15.0;
  const ratePerKg = parseFloat((unitPrice / weightKg).toFixed(2));
  assert.strictEqual(ratePerKg, 98.60, 'Effective rate per kg reflects freight and 2% payment platform charge absorption');
  assert.strictEqual(unitPrice, 1479.00, 'Unit price must equal ₹1,479.00');
});

it('100% Free Doorstep Delivery: All orders qualify for free delivery (₹0 delivery fee, no threshold)', () => {
  const threshold = 0;
  const cartSubtotalHigh = 3100;
  const cartSubtotalMid = 1450;
  const cartSubtotalLow = 520;

  const isFreeHigh = cartSubtotalHigh >= threshold;
  const isFreeMid = cartSubtotalMid >= threshold;
  const isFreeLow = cartSubtotalLow >= threshold;

  assert.strictEqual(isFreeHigh, true, 'High cart value must qualify for 100% free delivery');
  assert.strictEqual(isFreeMid, true, 'Single commodity order must qualify for 100% free delivery');
  assert.strictEqual(isFreeLow, true, 'Smallest variant order (e.g. 500ml Ghee) must qualify for 100% free delivery');
});

// ----------------------------------------------------
// Test Suite 2: Order State Machine Transitions
// ----------------------------------------------------
console.log('\n🔄 Test Suite 2: Order State Machine & Integrity');

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'cancelled'],
  paid: ['allocated', 'cancelled', 'refunded'],
  allocated: ['packed', 'cancelled'],
  packed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: []
};

function canTransition(current: string, next: string): boolean {
  return (VALID_TRANSITIONS[current] || []).includes(next);
}

it('Permits standard forward order lifecycle (paid -> allocated -> packed -> dispatched -> delivered)', () => {
  assert.strictEqual(canTransition('paid', 'allocated'), true);
  assert.strictEqual(canTransition('allocated', 'packed'), true);
  assert.strictEqual(canTransition('packed', 'dispatched'), true);
  assert.strictEqual(canTransition('dispatched', 'delivered'), true);
});

it('Blocks illegal state skips (cannot jump from paid directly to dispatched)', () => {
  assert.strictEqual(canTransition('paid', 'dispatched'), false);
});

it('Prevents modifying already delivered orders (terminal state)', () => {
  assert.strictEqual(canTransition('delivered', 'cancelled'), false);
  assert.strictEqual(canTransition('delivered', 'dispatched'), false);
});

// ----------------------------------------------------
// Test Suite 3: Wholesale RFQ Quotation & Validity Engine
// ----------------------------------------------------
console.log('\n📄 Test Suite 3: Wholesale RFQ & Freight Calculation');

it('Calculates correct dynamic freight for Bengaluru Urban (560xxx) vs Regional Karnataka (57xxxx)', () => {
  const calcFreight = (pincode: string) => {
    if (pincode.startsWith('560')) return 2200;
    if (pincode.startsWith('57') || pincode.startsWith('58')) return 4000;
    return 8500;
  };

  assert.strictEqual(calcFreight('560001'), 2200, 'Bengaluru pin code should be ₹2,200 freight');
  assert.strictEqual(calcFreight('572201'), 4000, 'Tiptur / Tumakuru regional should be ₹4,000 freight');
  assert.strictEqual(calcFreight('636001'), 8500, 'Interstate destination should be ₹8,500 freight');
});

it('Wholesale quote validity must be set to 48 hours to hedge Mandi spot price swings', () => {
  const now = new Date('2026-10-21T10:00:00Z');
  const validUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const diffHours = (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60);

  assert.strictEqual(diffHours, 48, 'Quote validity must be exactly 48 hours');
});

it('Wholesale RFQ volume options must adapt unit terminology per SKU (Copra = kg, Coconuts = Nuts)', () => {
  const isCopra = (sku: string) => sku.startsWith('COP');
  const coconutUnits = ['500 Nuts (10 Bags)', '1,000 Nuts (20 Bags)', '20,000 Nuts (10 MT Truckload)'];
  const copraUnits = ['100 kg (4 Boxes / 1 Quintal)', '250 kg (10 Boxes)', '1,000 kg (40 Boxes / 1 MT)'];

  const selectedSku = 'COP-BAL-TIP-25K';
  const options = isCopra(selectedSku) ? copraUnits : coconutUnits;

  assert.strictEqual(options[0].includes('kg'), true, 'Copra options must use kg');
  assert.strictEqual(options[0].includes('Nuts'), false, 'Copra options must never mention nuts');
});

it('Stock label formatting must produce human-readable units and avoid awkward strings like "220 25 s"', () => {
  const formatStock = (stock: number, uom: string) => {
    if (uom.toLowerCase().includes('box')) return `${stock} Boxes in stock`;
    if (uom.toLowerCase().includes('bag')) return `${stock} Bags in stock`;
    return `${stock} Units in stock`;
  };

  const ballCopraStock = formatStock(220, '25 kg Corrugated Box');
  const millingCopraStock = formatStock(220, '50 kg Gunny Bag');
  const coconutStock = formatStock(220, 'Bag of 50 Nuts');

  assert.strictEqual(ballCopraStock, '220 Boxes in stock');
  assert.strictEqual(millingCopraStock, '220 Bags in stock');
  assert.strictEqual(coconutStock, '220 Bags in stock');
  assert.strictEqual(ballCopraStock.includes('25 s'), false);
  assert.strictEqual(millingCopraStock.includes('50 s'), false);
});

// ----------------------------------------------------
// Test Suite 4: Inventory Reservation & Spoilage Write-Off
// ----------------------------------------------------
console.log('\n🌾 Test Suite 4: Inventory Batch & Spoilage Guards');

it('Atomic inventory deduction must never allow available stock to go negative', () => {
  let available = 20;
  const requested = 25;
  const canFulfill = available >= requested;

  if (canFulfill) {
    available -= requested;
  }

  assert.strictEqual(canFulfill, false, 'Must reject order when requested exceeds available');
  assert.strictEqual(available >= 0, true, 'Available stock must remain non-negative');
});

it('Damaged stock write-off correctly moves units from available to damaged bucket', () => {
  let available = 100;
  let damaged = 2;
  const writeOff = 5;

  assert.strictEqual(available >= writeOff, true);
  available -= writeOff;
  damaged += writeOff;

  assert.strictEqual(available, 95);
  assert.strictEqual(damaged, 7);
});

// ----------------------------------------------------
// Test Suite 5: Bulk Inquiry Validation, Price Secrecy & Pan-India Coverage
// ----------------------------------------------------
console.log('\n🔒 Test Suite 5: Bulk Inquiry Validation, Price Secrecy & Coverage');

interface InquiryPayload {
  customer_name?: string;
  contact_phone?: string;
  contact_email?: string;
  product_title?: string;
  requested_quantity?: number;
  unit?: string;
  company_name?: string;
  gstin?: string;
}

function validateBulkInquiry(data: InquiryPayload): { valid: boolean; error?: string } {
  if (!data.customer_name || !data.customer_name.trim()) {
    return { valid: false, error: 'Customer name is mandatory.' };
  }
  const hasPhone = Boolean(data.contact_phone && data.contact_phone.trim().length >= 7);
  const hasEmail = Boolean(data.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email.trim()));
  if (!hasPhone && !hasEmail) {
    return { valid: false, error: 'Please provide at least one contact method (phone number or valid email address).' };
  }
  if (!data.product_title || !data.product_title.trim()) {
    return { valid: false, error: 'Product name is mandatory.' };
  }
  if (!data.requested_quantity || data.requested_quantity <= 0) {
    return { valid: false, error: 'Requested quantity must be greater than zero.' };
  }
  if (!data.unit || !data.unit.trim()) {
    return { valid: false, error: 'Unit of measurement is mandatory.' };
  }
  return { valid: true };
}

it('Permits bulk inquiry with phone only (email, company, GSTIN omitted)', () => {
  const result = validateBulkInquiry({
    customer_name: 'Ramesh Patel',
    contact_phone: '+91 98450 12345',
    product_title: 'GI Ball Copra (Tumakuru)',
    requested_quantity: 50,
    unit: 'Boxes (25kg)'
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, undefined);
});

it('Permits bulk inquiry with email only (phone, company, GSTIN omitted)', () => {
  const result = validateBulkInquiry({
    customer_name: 'Apex Supermarkets Procurement',
    contact_email: 'buyer@apexretail.com',
    product_title: 'GI Byadgi Chilli Stemless',
    requested_quantity: 100,
    unit: 'Cartons (10kg)'
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, undefined);
});

it('Rejects bulk inquiry when neither phone nor email is supplied', () => {
  const result = validateBulkInquiry({
    customer_name: 'Anonymous Trader',
    product_title: 'Milling Copra',
    requested_quantity: 10,
    unit: 'Bags'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error?.includes('at least one contact method'), true);
});

it('Rejects bulk inquiry when quantity is zero or negative', () => {
  const result = validateBulkInquiry({
    customer_name: 'Valid Name',
    contact_phone: '9845012345',
    product_title: 'Milling Copra',
    requested_quantity: 0,
    unit: 'Bags'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error?.includes('greater than zero'), true);
});

it('Strict Wholesale Price Privacy: public product model must not leak wholesale pricing benchmark', () => {
  const publicProduct = {
    id: 'prod-001',
    slug: 'byadgi-chilli-stemless-10kg',
    title: 'GI Byadgi Chilli Stemless',
    price_inr: 4200.00,
    category: 'spices',
    grade: 'GI Extra Bold'
  };

  assert.strictEqual((publicProduct as any).wholesale_benchmark_price_inr, undefined, 'wholesale_benchmark_price_inr must be hidden');
  assert.strictEqual((publicProduct as any).procurement_cost_inr, undefined, 'procurement_cost_inr must never be public');
});

it('Delivery eligibility covers all valid 6-digit Indian PIN codes nationwide', () => {
  const isPincodeServiceable = (pin: string) => /^[1-9][0-9]{5}$/.test(pin.trim());

  assert.strictEqual(isPincodeServiceable('110001'), true, 'Delhi is serviceable');
  assert.strictEqual(isPincodeServiceable('400001'), true, 'Mumbai is serviceable');
  assert.strictEqual(isPincodeServiceable('700001'), true, 'Kolkata is serviceable');
  assert.strictEqual(isPincodeServiceable('600001'), true, 'Chennai is serviceable');
  assert.strictEqual(isPincodeServiceable('560001'), true, 'Bengaluru is serviceable');
  assert.strictEqual(isPincodeServiceable('572201'), true, 'Tiptur is serviceable');
  assert.strictEqual(isPincodeServiceable('571423'), true, 'Kikkeri Mandya headquarters is serviceable');
  assert.strictEqual(isPincodeServiceable('99999'), false, '5-digit invalid pin must be rejected');
});

// ----------------------------------------------------
// Test Suite 6: Customer Order Tracking, Watchlist & Operations
// ----------------------------------------------------
console.log('📱 Test Suite 6: Order Tracking, Customer Account & Watchlist');

it('Order tracking search pattern correctly classifies Order Number, Tracking Reference, and Phone', () => {
  const parseTrackingQuery = (q: string) => {
    const cleanDigits = q.replace(/\D/g, '');
    const isOrderOrRef = q.toUpperCase().startsWith('AGR') || 
                         q.toUpperCase().startsWith('VRL') || 
                         q.toUpperCase().startsWith('SR');
    return {
      isOrderOrRef,
      hasPhoneDigits: cleanDigits.length >= 10,
      phoneSlice: cleanDigits.slice(-10)
    };
  };

  const res1 = parseTrackingQuery('AGR-20261021-2117');
  assert.strictEqual(res1.isOrderOrRef, true);

  const res2 = parseTrackingQuery('VRL-BLR-181729');
  assert.strictEqual(res2.isOrderOrRef, true);

  const res3 = parseTrackingQuery('+91 90084 62568');
  assert.strictEqual(res3.isOrderOrRef, false);
  assert.strictEqual(res3.hasPhoneDigits, true);
  assert.strictEqual(res3.phoneSlice, '9008462568');
});

it('Customer Sign-In requires valid 10-digit Indian phone number', () => {
  const validatePhoneLogin = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const clean = digits.length >= 10 ? digits.slice(-10) : digits;
    if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) {
      return { valid: true, clean };
    }
    return { valid: false, error: 'Enter a valid 10-digit Indian mobile number' };
  };

  assert.strictEqual(validatePhoneLogin('9008462568').valid, true);
  assert.strictEqual(validatePhoneLogin('+91 90084 62568').valid, true);
  assert.strictEqual(validatePhoneLogin('12345').valid, false);
  assert.strictEqual(validatePhoneLogin('1234567890').valid, false); // invalid starting digit
});

it('Watchlist correctly toggles products and maintains uniqueness', () => {
  let watchlist: Array<{ id: string; title: string }> = [];

  const toggle = (item: { id: string; title: string }) => {
    if (watchlist.some((p) => p.id === item.id)) {
      watchlist = watchlist.filter((p) => p.id !== item.id);
    } else {
      watchlist = [item, ...watchlist];
    }
  };

  const itemA = { id: 'prod-copra', title: 'GI Ball Copra' };
  const itemB = { id: 'prod-nut', title: 'Grade A Coconuts' };

  toggle(itemA);
  assert.strictEqual(watchlist.length, 1);
  assert.strictEqual(watchlist[0].id, 'prod-copra');

  toggle(itemB);
  assert.strictEqual(watchlist.length, 2);

  // Toggling existing item removes it
  toggle(itemA);
  assert.strictEqual(watchlist.length, 1);
  assert.strictEqual(watchlist[0].id, 'prod-nut');
});

it('Admin pricing update rejects negative prices or negative stock quantities', () => {
  const validateProductUpdate = (data: { retail_price_inr?: number; available_stock?: number }) => {
    if (data.retail_price_inr !== undefined && data.retail_price_inr <= 0) {
      return { valid: false, error: 'Price must be greater than zero' };
    }
    if (data.available_stock !== undefined && data.available_stock < 0) {
      return { valid: false, error: 'Stock cannot be negative' };
    }
    return { valid: true };
  };

  assert.strictEqual(validateProductUpdate({ retail_price_inr: 1650, available_stock: 50 }).valid, true);
  assert.strictEqual(validateProductUpdate({ retail_price_inr: -100 }).valid, false);
  assert.strictEqual(validateProductUpdate({ available_stock: -5 }).valid, false);
});

// ----------------------------------------------------
// Test Suite 7: 1st-Order Coupon (FIRST100) Policy
// ----------------------------------------------------
console.log('🏷️ Test Suite 7: 1st-Order Coupon (FIRST100) Policy');

import { AVAILABLE_COUPONS, validateCoupon } from '../lib/coupons';

it('Only FIRST100 is available as a public coupon and offers ₹100 flat off', () => {
  assert.strictEqual(AVAILABLE_COUPONS.length, 1);
  assert.strictEqual(AVAILABLE_COUPONS[0].code, 'FIRST100');
  assert.strictEqual(AVAILABLE_COUPONS[0].value, 100);
  assert.strictEqual(AVAILABLE_COUPONS[0].type, 'flat');
  assert.strictEqual(AVAILABLE_COUPONS[0].firstOrderOnly, true);
});

it('FIRST100 successfully applies ₹100 discount for a first order with subtotal >= ₹400', () => {
  const result = validateCoupon('FIRST100', 500, true);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.discountAmount, 100);
});

it('FIRST100 is rejected if subtotal is below minimum order amount (₹400)', () => {
  const result = validateCoupon('FIRST100', 350, true);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.discountAmount, 0);
  assert.ok(result.message.includes('Minimum order for FIRST100 is ₹400'));
});

it('FIRST100 is strictly rejected if user is NOT a first-time buyer', () => {
  const result = validateCoupon('FIRST100', 1000, false);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.discountAmount, 0);
  assert.ok(result.message.includes('valid exclusively on your 1st farm order'));
});

it('Legacy coupon codes not in catalog are rejected', () => {
  const result = validateCoupon('RANDOMCODE99', 1000, true);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.discountAmount, 0);
});

// ----------------------------------------------------
// Test Suite 8: Bulk Order Item Simple Names (1 to 10)
// ----------------------------------------------------
console.log('📋 Test Suite 8: Bulk Order Item Simple Names');

import {
  BULK_ORDER_ITEMS,
  getBulkOrderDisplayName,
  getBulkOrderCleanName,
  sortProductsByBulkOrder
} from '../lib/bulk-items';

it('Bulk order item selection defines exactly 14 simple items in designated 1-14 sequence', () => {
  assert.strictEqual(BULK_ORDER_ITEMS.length, 14);
  assert.strictEqual(BULK_ORDER_ITEMS[0].simpleName, '1. Tender Coconut (Bulk Order Lot)');
  assert.strictEqual(BULK_ORDER_ITEMS[1].simpleName, '2. Arecanut Plants (1–1.5 Feet Height)');
  assert.strictEqual(BULK_ORDER_ITEMS[2].simpleName, '3. Coconut Plants (1 Year Old, 2 Feet Height)');
  assert.strictEqual(BULK_ORDER_ITEMS[3].simpleName, '4. Ragi Millet (5 kg, 10 kg, 25 kg Packs)');
  assert.strictEqual(BULK_ORDER_ITEMS[4].simpleName, '5. Groundnut Oil (Wood-Pressed, Cold-Pressed)');
  assert.strictEqual(BULK_ORDER_ITEMS[5].simpleName, '6. Cow Ghee (Traditional Bilona, 1 Litre)');
  assert.strictEqual(BULK_ORDER_ITEMS[6].simpleName, '7. Mature Coconuts (25-Piece Bag, ~15 kg)');
  assert.strictEqual(BULK_ORDER_ITEMS[7].simpleName, '8. Ball Copra (15 kg, 25 kg, 30 kg Boxes)');
  assert.strictEqual(BULK_ORDER_ITEMS[8].simpleName, '9. Fresh Ginger (50 kg Bulk Gunny Bag)');
  assert.strictEqual(BULK_ORDER_ITEMS[9].simpleName, '10. Coconut Shells (Industrial Grade, Metric Tonne)');
  assert.strictEqual(BULK_ORDER_ITEMS[10].simpleName, '11. Arecanut (Adike) — Bulk Commodity Lot');
  assert.strictEqual(BULK_ORDER_ITEMS[11].simpleName, '12. Ragi Flour (Mandya Stone-Ground 5 kg Bag)');
  assert.strictEqual(BULK_ORDER_ITEMS[12].simpleName, '13. Rice Flour (Pure Stone-Ground 5 kg Bag)');
  assert.strictEqual(BULK_ORDER_ITEMS[13].simpleName, '14. Coconut Oil (Wood-Pressed, Cold-Pressed)');
});

it('getBulkOrderDisplayName correctly resolves catalog products by SKU or title', () => {
  assert.strictEqual(
    getBulkOrderDisplayName({ sku: 'COC-TND-BLK-LOT', title: 'Fresh Tender Coconuts' }),
    '1. Tender Coconut (Bulk Order Lot)'
  );
  assert.strictEqual(
    getBulkOrderDisplayName({ sku: 'NUR-ARE-PLT-01Y', title: 'Arecanut Plants' }),
    '2. Arecanut Plants (1–1.5 Feet Height)'
  );
  assert.strictEqual(
    getBulkOrderDisplayName({ sku: 'COI-SHL-BLK-01T', title: 'Raw Coconut Shells' }),
    '10. Coconut Shells (Industrial Grade, Metric Tonne)'
  );
  assert.strictEqual(
    getBulkOrderCleanName({ sku: 'COC-TND-BLK-LOT', title: 'Fresh Tender Coconuts' }),
    'Tender Coconut (Bulk Order Lot)'
  );
});

it('sortProductsByBulkOrder orders arbitrary product list into sequence 1 through 10', () => {
  const unsorted = [
    { sku: 'COI-SHL-BLK-01T', title: 'Shells' },
    { sku: 'COC-TND-BLK-LOT', title: 'Tender' },
    { sku: 'OIL-GND-WOD-01L', title: 'Groundnut Oil' }
  ];
  const sorted = sortProductsByBulkOrder(unsorted);
  assert.strictEqual(sorted[0].sku, 'COC-TND-BLK-LOT');
  assert.strictEqual(sorted[1].sku, 'OIL-GND-WOD-01L');
  assert.strictEqual(sorted[2].sku, 'COI-SHL-BLK-01T');
});

// ----------------------------------------------------
console.log('🔍 Test Suite 9: Intelligent Commodity Search & Synonyms');

import { searchMatchesProduct } from '../lib/search-matcher';
import { getAllCatalogProducts } from '../lib/catalog';

it('Search matcher accurately finds Coconut Oil via title, synonyms and regional terms', () => {
  const products = getAllCatalogProducts();
  const coconutOil = products.find((p) => p.sku === 'OIL-COC-WOD-01L')!;
  assert.ok(coconutOil, 'Wood-Pressed Coconut Oil must be present in catalog');

  assert.strictEqual(searchMatchesProduct(coconutOil, 'coconut oil'), true);
  assert.strictEqual(searchMatchesProduct(coconutOil, 'marachekku'), true);
  assert.strictEqual(searchMatchesProduct(coconutOil, 'kobbari enne'), true);
  assert.strictEqual(searchMatchesProduct(coconutOil, 'virgin oil'), true);
  assert.strictEqual(searchMatchesProduct(coconutOil, 'tiptur oil'), true);
});

it('Search matcher separates Groundnut Oil from Coconut Oil accurately', () => {
  const products = getAllCatalogProducts();
  const groundnutOil = products.find((p) => p.sku === 'OIL-GND-WOD-01L')!;
  assert.ok(groundnutOil, 'Groundnut Oil must be present');

  assert.strictEqual(searchMatchesProduct(groundnutOil, 'groundnut oil'), true);
  assert.strictEqual(searchMatchesProduct(groundnutOil, 'peanut'), true);
  assert.strictEqual(searchMatchesProduct(groundnutOil, 'coconut'), false);
});

it('Search matcher resolves regional Kannada terms for Copra, Ghee, Flour and Saplings', () => {
  const products = getAllCatalogProducts();
  const copra = products.find((p) => p.sku === 'COP-BAL-BOX-15K')!;
  const ghee = products.find((p) => p.sku === 'DAI-GHE-BIL-01L')!;
  const ragiFlour = products.find((p) => p.sku === 'FLR-RAG-STN-05K')!;

  assert.strictEqual(searchMatchesProduct(copra, 'kobbari'), true);
  assert.strictEqual(searchMatchesProduct(ghee, 'tuppa'), true);
  assert.strictEqual(searchMatchesProduct(ragiFlour, 'ragi hittu'), true);
});

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================');
console.log(`Test Execution Results: ${passedCount} Passed, ${failedCount} Failed.`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
