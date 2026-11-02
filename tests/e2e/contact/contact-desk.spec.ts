import { test, expect } from '../../fixtures/base-test';

test.describe('F. Contact Us & Farm-Gate Coordinates', () => {
  test('Contact page displays verified farm coordinates and official contacts', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });

    // Verify Title and Headline
    await expect(page.locator('h1')).toContainText(/Contact & Operations/i);

    // Verify Office Address (Kikkeri, Mandya)
    await expect(page.locator('text=Kikkeri').first()).toBeVisible();
    await expect(page.locator('text=571423').first()).toBeVisible();

    // Verify Phone Helpline & WhatsApp
    await expect(page.locator('a[href*="9008462568"]:visible').first()).toBeVisible();

    // Verify Official Electronic Mail
    await expect(page.locator('a[href*="sales@freshrootsexport.com"]:visible').first()).toBeVisible();

    // Verify Google Business Profile badge
    await expect(page.locator('text=/Google Business Profile|Verified/i').first()).toBeVisible();
  });
});
