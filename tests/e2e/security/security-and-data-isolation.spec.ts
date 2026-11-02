import { test, expect } from '../../fixtures/base-test';

test.describe('6. Security, Headers & Data Isolation', () => {
  test('Security response headers are strictly enforced', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response).not.toBeNull();
    const headers = response?.headers() || {};

    // 1. Content Security Policy (CSP)
    expect(headers['content-security-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain("default-src 'self'");

    // 2. MIME sniffing protection
    expect(headers['x-content-type-options']).toBe('nosniff');

    // 3. Clickjacking protection
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');

    // 4. Referrer Policy
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('SQL Injection resistance on customer lookup', async ({ request }) => {
    const maliciousPayload = "' OR '1'='1' --";
    const res = await request.get(`/api/customer/profile?phone=${encodeURIComponent(maliciousPayload)}`);
    // Should safely return 400 or empty results without database error (500)
    expect([200, 400]).toContain(res.status());
    const json = await res.json();
    expect(json.customer).toBeFalsy();
  });

  test('Admin metrics API blocks unauthenticated callers with 401', async ({ request }) => {
    const res = await request.get('/api/admin/metrics');
    expect(res.status()).toBe(401);
  });
});
