import { test, expect } from '../../fixtures/base-test';
import { loginAsAdmin } from '../../helpers/auth-helpers';

test.describe('A. Authentication & User Profile Flows', () => {
  const testPhone = '9845019999';

  test('Guest user cannot access protected admin dashboard', async ({ page }) => {
    const res = await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Expect either redirect to /admin/login or access denied
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/login|\/admin/);
    if (!currentUrl.includes('/admin/login')) {
      const heading = await page.locator('h1, h2, div').filter({ hasText: /Admin Access|Sign in|Protected/i }).first();
      await expect(heading).toBeVisible();
    }
  });

  test('Customer Phone OTP request and verification workflow', async ({ request }) => {
    // 1. Send OTP
    const sendRes = await request.post('/api/auth/otp', {
      data: {
        action: 'send',
        phone: testPhone,
        fullName: 'QA Verification Buyer',
      },
    });
    expect(sendRes.status()).toBe(200);
    const sendJson = await sendRes.json();
    expect(sendJson.success).toBe(true);

    // 2. Reject Invalid OTP
    const invalidVerifyRes = await request.post('/api/auth/otp', {
      data: {
        action: 'verify',
        phone: testPhone,
        code: '9999',
      },
    });
    expect(invalidVerifyRes.status()).toBe(400);
    const invalidJson = await invalidVerifyRes.json();
    expect(invalidJson.success).toBe(false);

    // 3. Accept Valid OTP ('1234' demo code)
    const validVerifyRes = await request.post('/api/auth/otp', {
      data: {
        action: 'verify',
        phone: testPhone,
        code: '1234',
        fullName: 'QA Verification Buyer',
      },
    });
    expect(validVerifyRes.status()).toBe(200);
    const validJson = await validVerifyRes.json();
    expect(validJson.success).toBe(true);
    expect(validJson.verified).toBe(true);
    expect(validJson.phone).toBe(testPhone);
  });

  test('Customer Profile retrieval and update', async ({ request }) => {
    // 1. Update customer profile
    const updateRes = await request.post('/api/customer/profile', {
      data: {
        phone: testPhone,
        full_name: 'QA Principal Architect',
        email: 'qa.architect@freshrootsexport.com',
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570001',
      },
    });
    expect(updateRes.status()).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.success).toBe(true);
    expect(updateJson.customer.name).toBe('QA Principal Architect');

    // 2. Retrieve customer profile
    const getRes = await request.get(`/api/customer/profile?phone=${testPhone}`);
    expect(getRes.status()).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.success).toBe(true);
    expect(getJson.exists).toBe(true);
    expect(getJson.customer.phone).toBe(testPhone);
    expect(getJson.customer.email).toBe('qa.architect@freshrootsexport.com');
  });

  test('Administrator with valid session cookie gains full access to /admin', async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL || 'http://localhost:3000');
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=/FreshRoots Ops|Operations Desk|Commercial Desk/i').first()).toBeVisible();
  });
});
