import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

interface MobileDeviceProfile {
  name: string;
  platform: 'iOS' | 'Android' | 'Tablet';
  width: number;
  height: number;
  userAgent: string;
}

const MOBILE_DEVICES: MobileDeviceProfile[] = [
  {
    name: 'Apple iPhone SE / Mini',
    platform: 'iOS',
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Apple iPhone 15 / 16 Pro',
    platform: 'iOS',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Samsung Galaxy S23 / S24',
    platform: 'Android',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'Google Pixel 8 Pro',
    platform: 'Android',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'Apple iPad Air (Tablet)',
    platform: 'Tablet',
    width: 820,
    height: 1180,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  }
];

interface MobileTestResult {
  category: string;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details?: string;
}

async function runMobileTestSuite() {
  console.log('======================================================================');
  console.log('📱 SHARATH INORAHALLI: COMPREHENSIVE MOBILE DEVICE & PWA QA SUITE');
  console.log('Testing Mobile Web (iOS Safari, Android Chrome) & App Architecture');
  console.log('======================================================================\n');

  const results: MobileTestResult[] = [];

  function record(category: string, testName: string, fn: () => void) {
    try {
      fn();
      results.push({ category, testName, status: 'PASSED' });
      console.log(`  ✅ [${category}] ${testName}`);
    } catch (err: any) {
      results.push({ category, testName, status: 'FAILED', details: err.message });
      console.error(`  ❌ [${category}] ${testName} -> ${err.message}`);
    }
  }

  async function recordAsync(category: string, testName: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ category, testName, status: 'PASSED' });
      console.log(`  ✅ [${category}] ${testName}`);
    } catch (err: any) {
      results.push({ category, testName, status: 'FAILED', details: err.message });
      console.error(`  ❌ [${category}] ${testName} -> ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 1: PWA Web App Manifest for Android & iOS App Installability
  // --------------------------------------------------------------------------
  console.log('▶ Test Group 1: PWA Web App Manifest & Android/iOS App Installability...');
  const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
  const manifestData = await manifestRes.json().catch(() => null);

  record('PWA Manifest', 'HTTP 200 OK with application/manifest+json content-type', () => {
    assert.strictEqual(manifestRes.status, 200);
    assert(manifestRes.headers.get('content-type')?.includes('manifest+json'));
  });

  record('PWA Manifest', 'Display mode set to standalone (full-screen native app style)', () => {
    assert.strictEqual(manifestData?.display, 'standalone');
  });

  record('PWA Manifest', 'Start URL configured for root entry point', () => {
    assert.strictEqual(manifestData?.start_url, '/');
  });

  record('PWA Manifest', 'Theme color and background color set to brand green', () => {
    assert.strictEqual(manifestData?.theme_color, '#3b6d11');
    assert.strictEqual(manifestData?.background_color, '#ffffff');
  });

  record('PWA Manifest', 'Valid app icon SVG configured and accessible over HTTP', () => {
    assert(manifestData?.icons?.length >= 1);
    assert.strictEqual(manifestData?.icons[0]?.src, '/icon.svg');
  });

  const iconRes = await fetch(`${BASE_URL}/icon.svg`);
  record('PWA Manifest', 'Icon file /icon.svg returns HTTP 200 with valid image/svg+xml', () => {
    assert.strictEqual(iconRes.status, 200);
    assert(iconRes.headers.get('content-type')?.includes('svg'));
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Viewport & Native Mobile Browser Meta Tags
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 2: Viewport & Native Mobile Browser Meta Tags...');
  const homeHtmlRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeHtmlRes.text();

  record('Mobile Meta', 'Responsive Viewport defined with width=device-width', () => {
    assert(homeHtml.includes('width=device-width'));
    assert(homeHtml.includes('initial-scale=1'));
  });

  record('Mobile Meta', 'Theme color meta tag for Android status bar color', () => {
    assert(homeHtml.includes('theme-color'));
    assert(homeHtml.includes('#3b6d11'));
  });

  record('Mobile Meta', 'Apple Mobile Web App Capable meta tag for iOS Safari full-screen', () => {
    assert(homeHtml.includes('mobile-web-app-capable') || homeHtml.includes('apple-mobile-web-app-capable'));
  });

  record('Mobile Meta', 'Apple Mobile Status Bar Style configured as default', () => {
    assert(homeHtml.includes('apple-mobile-web-app-status-bar-style'));
  });

  record('Mobile Meta', 'Manifest link rel="manifest" included in head', () => {
    assert(homeHtml.includes('rel="manifest"'));
    assert(homeHtml.includes('/manifest.webmanifest'));
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Mobile Device Profile Simulation (Headers & User-Agents)
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 3: Device Profile Simulation across Android, iOS & Tablet...');

  for (const device of MOBILE_DEVICES) {
    await recordAsync(
      'Device Simulation',
      `${device.name} (${device.platform} ${device.width}x${device.height}px) receives complete HTML`,
      async () => {
        const res = await fetch(`${BASE_URL}/`, {
          headers: {
            'User-Agent': device.userAgent,
            'Sec-CH-UA-Mobile': device.platform === 'Tablet' ? '?0' : '?1',
            'Sec-CH-UA-Platform': device.platform === 'iOS' ? '"iOS"' : '"Android"'
          }
        });
        assert.strictEqual(res.status, 200);
        const text = await res.text();
        assert(text.includes('FreshRoots') || text.includes('SHARATH'));
      }
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: WhatsApp Mobile 1-Tap Deep-Linking
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 4: WhatsApp Mobile 1-Tap Deep-Linking & Direct Desk...');

  record('WhatsApp Deep-Link', 'All WhatsApp links use standardized https://wa.me/919008462568 for mobile intent', () => {
    assert(homeHtml.includes('https://wa.me/919008462568'));
    // Must NOT contain localhost or test phone numbers in public links
    assert(!homeHtml.includes('wa.me/919876543210'));
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Mobile Pack Variant Selection & Ghee 500ml on Mobile
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 5: Mobile Pack Variant Selection (Pure Desi Cow Ghee 500ml @ ₹480)...');

  const productsRes = await fetch(`${BASE_URL}/api/products`);
  const productsData = await productsRes.json();
  const gheeProd = productsData.products.find((p: any) => p.sku === 'DAI-GHE-BIL-01L');

  const mobileCustomerPhone = '9845088888';

  record('Ghee 500ml Mobile', 'Ghee SKU includes specifications for 500 ml @ ₹530 and 1 Litre @ ₹980', () => {
    assert(gheeProd);
    assert(gheeProd.specifications?.available_sizes?.includes('500 ml (₹530)'));
    assert(gheeProd.specifications?.available_sizes?.includes('1 Litre (₹980)'));
  });

  await recordAsync('Ghee 500ml Mobile', 'Mobile order placing 1 unit of 500 ml variant is booked at ₹530 with 12% GST', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      },
      body: JSON.stringify({
        customer_name: 'Mobile Shopper (Bengaluru)',
        customer_phone: mobileCustomerPhone,
        shipping_address: 'Indiranagar 100ft Road, Bengaluru',
        destination_pincode: '560038',
        items: [
          {
            product_id: gheeProd.id,
            quantity: 1,
            unit_price_inr: 530,
            unit_of_measure: '500 ml Glass Jar'
          }
        ]
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(Number(data.order.subtotal_inr), 530);
    assert.strictEqual(Number(data.order.tax_inr), 63.60);
    assert.strictEqual(Number(data.order.delivery_fee_inr), 0, '100% Free delivery applies on mobile order');
    const parsedItems = typeof data.order.items === 'string' ? JSON.parse(data.order.items) : data.order.items;
    assert.strictEqual(parsedItems[0].unit_price_inr, 530);
    assert.strictEqual(parsedItems[0].unit_of_measure, '500 ml Glass Jar');
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 6: Mobile Multi-Address & Session Storage Support
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 6: Mobile Multi-Address & Customer Account Management...');

  await recordAsync('Mobile Customer Profile', 'Save profile from mobile touch input', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: mobileCustomerPhone,
        full_name: 'Smt. Kavitha Raman',
        email: 'kavitha.raman@gmail.com',
        address: '5th Cross, Malleswaram',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560003'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.customer.name, 'Smt. Kavitha Raman');
  });

  await recordAsync('Mobile Address Book', 'Save Home address via mobile drawer', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_phone: mobileCustomerPhone,
        recipient_name: 'Kavitha Home',
        phone: mobileCustomerPhone,
        tag: 'Home',
        street_address: 'Villa 12, Prestige Palms',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        is_default: true
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.address.tag, 'Home');
    assert.strictEqual(data.address.is_default, true);
  });

  await recordAsync('Mobile Address Book', 'Save Farm/Temple secondary address', async () => {
    const res = await fetch(`${BASE_URL}/api/customer/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_phone: mobileCustomerPhone,
        recipient_name: 'Ancestral Temple Trust',
        phone: mobileCustomerPhone,
        tag: 'Temple',
        street_address: 'Agrahara Street, Kikkeri Village',
        city: 'K.R. Pete, Mandya',
        state: 'Karnataka',
        pincode: '571423',
        is_default: false
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.address.tag, 'Temple');
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 7: Mobile Order Tracking Engine (Phone, Order #, Waybill)
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 7: Mobile Order Tracking by Phone, Order #, and Waybill...');

  await recordAsync('Mobile Tracking', 'Lookup orders by mobile customer phone number', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/track?query=${mobileCustomerPhone}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.success);
    assert(data.orders.length >= 1);
    assert.strictEqual(data.orders[0].customer_phone, mobileCustomerPhone);
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 8: 100% Free Doorstep Delivery on Mobile
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 8: 100% Free Doorstep Delivery on Mobile Checkout...');

  await recordAsync('Threshold Shipping', 'Mobile order gets 100% free delivery (₹0 delivery fee)', async () => {
    const copraProd = productsData.products.find((p: any) => p.sku === 'COP-BAL-BOX-15K');
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Free Delivery Buyer',
        customer_phone: '9845012399',
        shipping_address: 'Jayanagar, Bengaluru',
        destination_pincode: '560041',
        items: [
          {
            product_id: copraProd.id,
            quantity: 1,
            unit_price_inr: 5508,
            unit_of_measure: '15 kg Box'
          }
        ]
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Number(data.order.subtotal_inr), 5508);
    assert.strictEqual(Number(data.order.delivery_fee_inr), 0, 'All orders must have ₹0 delivery fee');
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 9: Mobile Legal Compliance Pages
  // --------------------------------------------------------------------------
  console.log('\n▶ Test Group 9: Mobile Legal & Policy Pages Accessibility...');
  const legalPages = ['/contact', '/privacy', '/terms', '/refund-policy', '/shipping-policy'];

  for (const page of legalPages) {
    await recordAsync('Legal Compliance', `Page ${page} loads with HTTP 200 on mobile viewport`, async () => {
      const res = await fetch(`${BASE_URL}${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
        }
      });
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert(text.includes('FreshRoots') || text.includes('SHARATH') || text.includes('Sharath'));
    });
  }

  // --------------------------------------------------------------------------
  // TEST SUMMARY
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;

  console.log('\n======================================================================');
  console.log('🏁 MOBILE & PWA QA EXECUTION SUMMARY');
  console.log('======================================================================');
  console.log(`Total Mobile Assertions: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Overall Mobile Readiness: ${failed === 0 ? '✅ 100% SUCCESS' : '❌ FAILED'}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMobileTestSuite().catch((err) => {
  console.error('Fatal Mobile QA error:', err);
  process.exit(1);
});
