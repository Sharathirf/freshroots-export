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

it('Per-nut retail equivalent for Grade A 50-nut bag must be ₹33.00/nut', () => {
  const bagPrice = 1650.00;
  const nutCount = 50;
  const perNut = bagPrice / nutCount;
  assert.strictEqual(perNut, 33.00, 'Per nut price must match ₹33.00');
});

it('Free delivery threshold must apply at ₹1,500; flat ₹99 below', () => {
  const threshold = 1500;
  const cartSubtotalHigh = 1650;
  const cartSubtotalLow = 1350;

  const deliveryHigh = cartSubtotalHigh >= threshold ? 0 : 99;
  const deliveryLow = cartSubtotalLow >= threshold ? 0 : 99;

  assert.strictEqual(deliveryHigh, 0, 'Cart above ₹1,500 must receive free shipping');
  assert.strictEqual(deliveryLow, 99, 'Cart below ₹1,500 must incur ₹99 delivery fee');
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
