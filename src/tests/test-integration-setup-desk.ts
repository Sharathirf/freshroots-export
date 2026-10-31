import assert from 'assert';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Integration Setup Desk & API...\n');

async function run() {
  // Authenticate via /api/admin/auth to obtain a valid session cookie
  const authRes = await fetch('http://localhost:3000/api/admin/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
    },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  });
  assert.strictEqual(authRes.status, 200, 'Admin login must succeed');
  const cookieHeader = authRes.headers.get('set-cookie');
  assert(cookieHeader, 'Must receive set-cookie header');
  const cookie = cookieHeader.split(';')[0];

  // 1. GET /api/admin/integrations
  const getRes = await fetch('http://localhost:3000/api/admin/integrations', {
    headers: { cookie },
  });
  assert.strictEqual(getRes.status, 200, 'GET /api/admin/integrations must return 200');
  const getData = await getRes.json();
  assert(Array.isArray(getData.integrations), 'Must return integrations array');
  assert.strictEqual(getData.integrations.length, 6, 'Must return all 6 integrations');

  const ids = getData.integrations.map((i: any) => i.id);
  assert(ids.includes('cloudflare-analytics'), 'Must include cloudflare-analytics');
  assert(ids.includes('posthog'), 'Must include posthog');
  assert(ids.includes('turnstile'), 'Must include turnstile');
  assert(ids.includes('resend'), 'Must include resend');
  assert(ids.includes('sentry'), 'Must include sentry');
  assert(ids.includes('firebase'), 'Must include firebase');
  console.log('  ✅ PASS: All 6 integration services retrieved with correct schema');

  // 1b. Test Saving Integration Credentials to Database
  const saveRes = await fetch('http://localhost:3000/api/admin/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      serviceId: 'cloudflare-analytics',
      action: 'save',
      keys: {
        NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN: '0729f41f44f546f8aca4a6417ae60925',
      },
    }),
  });
  assert.strictEqual(saveRes.status, 200, 'POST save must return 200');
  const saveData = await saveRes.json();
  assert.strictEqual(saveData.success, true, 'Save must succeed');
  console.log('  ✅ PASS: Cloudflare Analytics Token saved to persistent storage without file errors');

  // 2. Test Connection on PostHog
  const testRes = await fetch('http://localhost:3000/api/admin/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      serviceId: 'posthog',
      action: 'test',
      keys: {
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_dummy_key_for_verification_suite',
      },
    }),
  });
  assert.strictEqual(testRes.status, 200, 'POST test must return 200');
  const testData = await testRes.json();
  assert('success' in testData, 'Must return test result success flag');
  console.log('  ✅ PASS: PostHog connection test endpoint executed cleanly');

  // 3. Test Sentry error monitoring test ping
  const sentryRes = await fetch('http://localhost:3000/api/admin/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      serviceId: 'sentry',
      action: 'test',
      keys: {
        NEXT_PUBLIC_SENTRY_DSN: 'https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/1234567',
      },
    }),
  });
  assert.strictEqual(sentryRes.status, 200);
  const sentryData = await sentryRes.json();
  assert.strictEqual(sentryData.success, true);
  console.log('  ✅ PASS: Sentry DSN validation and connection check succeeded');

  // 4. Test Cloudflare Turnstile verification test with official Cloudflare test credentials
  const turnstileRes = await fetch('http://localhost:3000/api/admin/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      serviceId: 'turnstile',
      action: 'test',
      keys: {
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
        TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      },
    }),
  });
  assert.strictEqual(turnstileRes.status, 200);
  const turnstileData = await turnstileRes.json();
  assert.strictEqual(turnstileData.success, true);
  console.log('  ✅ PASS: Turnstile test endpoint ping verified with official Cloudflare test keys');

  // 5. Check redirects on /admin/integrations and /admin/integrations/posthog
  const redir1 = await fetch('http://localhost:3000/admin/integrations', {
    redirect: 'manual',
    headers: { cookie },
  });
  assert.strictEqual(redir1.status, 307, 'Should redirect to /admin?tab=integrations');
  assert(redir1.headers.get('location')?.includes('/admin?tab=integrations'));
  console.log('  ✅ PASS: /admin/integrations redirects cleanly to /admin?tab=integrations');

  const redir2 = await fetch('http://localhost:3000/admin/integrations/posthog', {
    redirect: 'manual',
    headers: { cookie },
  });
  assert.strictEqual(redir2.status, 307, 'Should redirect to /admin?tab=integrations&setup=posthog');
  assert(redir2.headers.get('location')?.includes('setup=posthog'));
  console.log('  ✅ PASS: /admin/integrations/posthog redirects cleanly to setup wizard');

  console.log('\n🎉 ALL INTEGRATION SETUP DESK TESTS PASSED!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
