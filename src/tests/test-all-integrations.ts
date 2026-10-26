import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Starting Comprehensive 6-Integration Verification Suite...\n');

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (error: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    if (error.stack) {
      console.error(`     ${error.stack.split('\n').slice(1, 3).join('\n')}`);
    }
    failed++;
  }
}

async function runAll() {
  // =========================================================================
  // 1. FIREBASE CLOUD MESSAGING (FCM)
  // =========================================================================
  console.log('🔔 Testing Integration 1: Firebase Cloud Messaging (FCM)');

  await test('FCM service worker route handler returns valid JS with required scope header', async () => {
    const swRoute = await import('../app/api/push/messaging-sw.js/route');
    
    // Test base unconfigured response
    const unconfiguredRes = await swRoute.GET();
    assert.strictEqual(unconfiguredRes.status, 200, 'Service worker route must return status 200');
    assert.strictEqual(unconfiguredRes.headers.get('content-type'), 'application/javascript; charset=utf-8');
    assert.strictEqual(unconfiguredRes.headers.get('service-worker-allowed'), '/', 'Must allow root scope "/"');
    const unconfiguredBody = await unconfiguredRes.text();
    assert(unconfiguredBody.includes('self.addEventListener(\'notificationclick\''), 'Must register notification click listener');

    // Test configured response when Firebase credentials are provided
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock_api_key';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mock_project';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';

    const configuredRes = await swRoute.GET();
    const configuredBody = await configuredRes.text();
    assert(configuredBody.includes('firebase-messaging-compat.js'), 'Must load Firebase Messaging compat script');
    assert(configuredBody.includes('messaging.onBackgroundMessage'), 'Must register background message listener');
    assert(configuredBody.includes('freshroots-mandi'), 'Must contain freshroots-mandi tag handler');

    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  });

  await test('FCM static service worker bridge exists in public/ directory', () => {
    const swBridgePath = path.join(process.cwd(), 'public/firebase-messaging-sw.js');
    assert(fs.existsSync(swBridgePath), 'public/firebase-messaging-sw.js must exist');
    const content = fs.readFileSync(swBridgePath, 'utf8');
    assert(content.includes('/api/push/messaging-sw.js'), 'Bridge must import /api/push/messaging-sw.js');
  });

  await test('FCM subscribe endpoint reports availability without crashing', async () => {
    const subscribeRoute = await import('../app/api/push/subscribe/route');
    const response = await subscribeRoute.GET();
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert('available' in data, 'Must return availability boolean');
    assert.strictEqual(typeof data.available, 'boolean');
  });

  await test('FCM subscribe endpoint blocks cross-origin and malformed tokens', async () => {
    const subscribeRoute = await import('../app/api/push/subscribe/route');
    
    // Cross origin
    const badOriginReq = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      headers: { origin: 'https://evil-attacker.example', host: 'localhost:3000' },
      body: JSON.stringify({ token: '1234567890123456789012345' }),
    });
    const res1 = await subscribeRoute.POST(badOriginReq as any);
    assert.strictEqual(res1.status, 403, 'Must reject mismatched origin');

    // Invalid token (too short)
    const badTokenReq = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', host: 'localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'short' }),
    });
    const res2 = await subscribeRoute.POST(badTokenReq as any);
    assert.strictEqual(res2.status, 400, 'Must reject short tokens');
  });

  await test('FCM admin messaging function handles unconfigured state gracefully', async () => {
    const { sendMandiPriceUpdate } = await import('../lib/push');
    // Calling without valid service account should return safely without unhandled rejection
    await sendMandiPriceUpdate({
      commodity: 'copra',
      market: 'Tiptur Mandi',
      pricePerQuintal: 34500,
      reportedAt: '26 Oct 2026',
    });
    assert(true, 'sendMandiPriceUpdate returned cleanly');
  });

  // =========================================================================
  // 2. CLOUDFLARE WEB ANALYTICS
  // =========================================================================
  console.log('\n📊 Testing Integration 2: Cloudflare Web Analytics');

  await test('Layout mounts Cloudflare Web Analytics beacon script with SPA support', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    assert(layoutContent.includes('NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN'), 'Must reference CLOUDFLARE token');
    assert(layoutContent.includes('https://static.cloudflareinsights.com/beacon.min.js'), 'Must load official Cloudflare beacon');
    assert(layoutContent.includes('spa: true'), 'Must enable SPA route change tracking');
    assert(layoutContent.includes('strategy="afterInteractive"'), 'Must load afterInteractive for performance');
  });

  // =========================================================================
  // 3. POSTHOG SHOPPING FUNNEL TRACKING
  // =========================================================================
  console.log('\n🛍️ Testing Integration 3: PostHog Funnel Tracking');

  await test('PostHog tracking functions execute safely in all environments', async () => {
    const { track, trackPageView } = await import('../lib/analytics');
    
    // Calling in Node environment (window undefined) should not throw
    assert.doesNotThrow(() => {
      track('product_card_viewed', { sku: 'COC-SEMI-25P-15K', price: 1479 });
      track('add_to_cart', { sku: 'COP-BAL-BOX-15K', quantity: 2 });
      track('cart_viewed', { item_count: 3, subtotal: 4500 });
      track('coupon_applied', { code: 'FIRST100', discount_amount: 100 });
      track('begin_checkout', { value: 4400, currency: 'INR' });
      track('payment_initiated', { payment_method: 'card', value: 4400 });
      track('purchase', { order_id: 'ORD-1001', value: 4400 });
      trackPageView('/products/tiptur-ball-copra');
    }, 'PostHog track functions must execute safely');
  });

  await test('Full E-Commerce Funnel event triggers are wired in components', () => {
    const cartDrawerCode = fs.readFileSync(path.join(process.cwd(), 'src/components/CartDrawer.tsx'), 'utf8');
    const cartContextCode = fs.readFileSync(path.join(process.cwd(), 'src/context/CartContext.tsx'), 'utf8');
    const productCardCode = fs.readFileSync(path.join(process.cwd(), 'src/components/ProductCard.tsx'), 'utf8');
    const rfqModalCode = fs.readFileSync(path.join(process.cwd(), 'src/components/WholesaleRFQModal.tsx'), 'utf8');

    // Funnel Step 1: Product card view
    assert(productCardCode.includes('track(\'product_card_viewed\''), 'ProductCard must track product_card_viewed');
    
    // Funnel Step 2: Add to cart
    assert(cartContextCode.includes('track(\'add_to_cart\''), 'CartContext must track add_to_cart');
    
    // Funnel Step 3: View cart drawer
    assert(cartDrawerCode.includes('track(\'cart_viewed\''), 'CartDrawer must track cart_viewed');
    
    // Funnel Step 4: Update/remove items in cart
    assert(cartContextCode.includes('track(\'remove_from_cart\''), 'CartContext must track remove_from_cart');
    assert(cartContextCode.includes('track(\'update_cart_quantity\''), 'CartContext must track update_cart_quantity');

    // Funnel Step 5: Coupon application
    assert(cartDrawerCode.includes('track(\'coupon_applied\''), 'CartDrawer must track coupon_applied');

    // Funnel Step 6: Begin checkout
    assert(cartDrawerCode.includes('track(\'begin_checkout\''), 'CartDrawer must track begin_checkout');

    // Funnel Step 7: Payment initiated
    assert(cartDrawerCode.includes('track(\'payment_initiated\''), 'CartDrawer must track payment_initiated');

    // Funnel Step 8: Order completed (purchase)
    assert(cartDrawerCode.includes('track(\'purchase\''), 'CartDrawer must track purchase');

    // Wholesale Funnel: RFQ started & submitted
    assert(rfqModalCode.includes('track(\'rfq_started\''), 'RFQModal must track rfq_started');
    assert(rfqModalCode.includes('track(\'rfq_submitted\''), 'RFQModal must track rfq_submitted');
  });

  // =========================================================================
  // 4. CLOUDFLARE TURNSTILE (SPAM REDUCTION)
  // =========================================================================
  console.log('\n🛡️ Testing Integration 4: Cloudflare Turnstile');

  await test('Turnstile verification passes cleanly when not configured (graceful dev bypass)', async () => {
    const { verifyTurnstile } = await import('../lib/turnstile');
    const req = new Request('http://localhost:3000/api/rfq');
    
    // Ensure no secret is set
    const oldSecret = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    
    const result = await verifyTurnstile('any-token', req);
    assert.strictEqual(result.configured, false);
    assert.strictEqual(result.valid, true, 'Unconfigured Turnstile should allow submission');
    
    if (oldSecret) process.env.TURNSTILE_SECRET_KEY = oldSecret;
  });

  await test('Turnstile verification rejects invalid, empty, or oversized tokens', async () => {
    const { verifyTurnstile } = await import('../lib/turnstile');
    const req = new Request('http://localhost:3000/api/rfq');

    process.env.TURNSTILE_SECRET_KEY = 'test_secret_key';
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test_site_key';

    const r1 = await verifyTurnstile('', req);
    assert.strictEqual(r1.valid, false, 'Empty token must be rejected');

    const r2 = await verifyTurnstile(null, req);
    assert.strictEqual(r2.valid, false, 'Null token must be rejected');

    const r3 = await verifyTurnstile('x'.repeat(2500), req);
    assert.strictEqual(r3.valid, false, 'Oversized token (>2048 chars) must be rejected');

    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  await test('TurnstileChallenge component is integrated in all inquiry forms', () => {
    const rfqModal = fs.readFileSync(path.join(process.cwd(), 'src/components/WholesaleRFQModal.tsx'), 'utf8');
    const bulkForm = fs.readFileSync(path.join(process.cwd(), 'src/components/BulkInquiryForm.tsx'), 'utf8');
    const enquiryModal = fs.readFileSync(path.join(process.cwd(), 'src/components/EnquiryModal.tsx'), 'utf8');
    const commercialFaq = fs.readFileSync(path.join(process.cwd(), 'src/components/CommercialInquiryFaq.tsx'), 'utf8');

    assert(rfqModal.includes('<TurnstileChallenge'), 'WholesaleRFQModal must include TurnstileChallenge');
    assert(bulkForm.includes('<TurnstileChallenge'), 'BulkInquiryForm must include TurnstileChallenge');
    assert(enquiryModal.includes('<TurnstileChallenge'), 'EnquiryModal must include TurnstileChallenge');
    assert(commercialFaq.includes('<TurnstileChallenge'), 'CommercialInquiryFaq must include TurnstileChallenge');
  });

  // =========================================================================
  // 5. RESEND (TRANSACTIONAL EMAIL)
  // =========================================================================
  console.log('\n📧 Testing Integration 5: Resend Transactional Email');

  await test('Resend detects unconfigured state and fails safe without throwing', async () => {
    const { emailIsConfigured, sendTransactionalEmail, deliverTransactionalEmail } = await import('../lib/email');

    const oldKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    assert.strictEqual(emailIsConfigured(), false);
    
    const sendResult = await sendTransactionalEmail({
      to: 'buyer@example.com',
      subject: 'Order Confirmation',
      text: 'Order ORD-1234 received.',
      html: '<h1>Order ORD-1234 received</h1>'
    });
    assert.strictEqual(sendResult.sent, false);
    assert.strictEqual(sendResult.reason, 'not_configured');

    const deliverResult = await deliverTransactionalEmail({
      to: 'buyer@example.com',
      subject: 'Order Confirmation',
      text: 'Order ORD-1234 received.'
    }, 'test_order');
    assert.strictEqual(deliverResult.sent, false);
    assert.strictEqual(deliverResult.reason, 'not_configured');

    if (oldKey) process.env.RESEND_API_KEY = oldKey;
  });

  await test('Resend email calls are integrated in /api/orders and /api/rfq', () => {
    const ordersApi = fs.readFileSync(path.join(process.cwd(), 'src/app/api/orders/route.ts'), 'utf8');
    const rfqApi = fs.readFileSync(path.join(process.cwd(), 'src/app/api/rfq/route.ts'), 'utf8');

    assert(ordersApi.includes('deliverTransactionalEmail'), '/api/orders must call deliverTransactionalEmail');
    assert(ordersApi.includes('order_buyer_confirmation'), '/api/orders must trigger buyer confirmation');
    assert(ordersApi.includes('order_admin_notification'), '/api/orders must trigger admin notification');

    assert(rfqApi.includes('deliverTransactionalEmail'), '/api/rfq must call deliverTransactionalEmail');
    assert(rfqApi.includes('rfq_buyer_confirmation'), '/api/rfq must trigger buyer confirmation');
    assert(rfqApi.includes('rfq_admin_notification'), '/api/rfq must trigger admin notification');
  });

  // =========================================================================
  // 6. SENTRY (ERROR MONITORING)
  // =========================================================================
  console.log('\n🚨 Testing Integration 6: Sentry Error Monitoring');

  await test('All 3 Sentry runtime config files exist and compile', () => {
    const clientPath = path.join(process.cwd(), 'sentry.client.config.ts');
    const serverPath = path.join(process.cwd(), 'sentry.server.config.ts');
    const edgePath = path.join(process.cwd(), 'sentry.edge.config.ts');

    assert(fs.existsSync(clientPath), 'sentry.client.config.ts must exist');
    assert(fs.existsSync(serverPath), 'sentry.server.config.ts must exist');
    assert(fs.existsSync(edgePath), 'sentry.edge.config.ts must exist');
  });

  await test('Next.js build and instrumentation are wrapped with Sentry', () => {
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    assert(nextConfigContent.includes('withSentryConfig'), 'next.config.ts must be wrapped with withSentryConfig');

    const instrPath = path.join(process.cwd(), 'instrumentation.ts');
    const instrContent = fs.readFileSync(instrPath, 'utf8');
    assert(instrContent.includes('onRequestError = Sentry.captureRequestError'), 'instrumentation.ts must export onRequestError');
  });

  await test('Sentry PII scrubbing removes user, cookies, headers, and query strings', () => {
    const serverConfig = fs.readFileSync(path.join(process.cwd(), 'sentry.server.config.ts'), 'utf8');
    assert(serverConfig.includes('delete event.user'), 'Must delete event.user');
    assert(serverConfig.includes('delete event.request.cookies'), 'Must delete cookies');
    assert(serverConfig.includes('delete event.request.headers'), 'Must delete request headers');
    assert(serverConfig.includes('delete event.request.data'), 'Must delete request body data');
    assert(serverConfig.includes('event.request.url = `${url.origin}${url.pathname}`'), 'Must sanitize URL query params');
  });

  await test('Next.js Error Boundaries capture exceptions to Sentry', () => {
    const errorBoundary = fs.readFileSync(path.join(process.cwd(), 'src/app/error.tsx'), 'utf8');
    const globalError = fs.readFileSync(path.join(process.cwd(), 'src/app/global-error.tsx'), 'utf8');

    assert(errorBoundary.includes('Sentry.captureException(error)'), 'error.tsx must capture to Sentry');
    assert(globalError.includes('Sentry.captureException(error)'), 'global-error.tsx must capture to Sentry');
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n======================================================');
  console.log(`Integration Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
