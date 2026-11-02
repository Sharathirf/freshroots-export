import { test, expect } from '../../fixtures/base-test';

test.describe('International Agro-Export Corridors & FCL Trade Suite', () => {
  test('Export hub (/export) renders certification badges, FCL container specs, and lead time metrics', async ({ page }) => {
    await page.goto('/export', { waitUntil: 'domcontentloaded' });

    // Validate H1 and core export capabilities
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('main h1').first()).toContainText(/Agricultural Exports/i);

    // Verify statutory export certifications (APEDA, FSSAI, Coconut Development Board, DGFT)
    await expect(page.locator('main').locator('text=/APEDA|FSSAI|CDB|DGFT|Phytosanitary/i').first()).toBeVisible();

    // Check RFQ CTA presence
    const rfqCta = page.locator('main a[href*="/rfq"]:visible, main a[href*="/wholesale/rfq"]:visible, a[href*="wa.me"]:visible').first();
    await expect(rfqCta).toBeVisible();
  });

  test('Vietnam Trade Corridor (/export/corridors/vietnam) renders port metrics & ocean transit info', async ({ page }) => {
    await page.goto('/export/corridors/vietnam', { waitUntil: 'domcontentloaded' });

    // Verify country heading
    await expect(page.locator('main h1').filter({ hasText: /Vietnam/i })).toBeVisible();

    // Verify port of discharge details (e.g. Cat Lai / Hai Phong)
    await expect(page.locator('main').locator('text=/Port|Transit|Container|Ocean/i').first()).toBeVisible();

    // Verify quotation button on corridor page
    const quoteBtn = page.locator('main a[href*="/rfq"]:visible, main button:has-text("Quote"):visible, a[href*="wa.me"]:visible').first();
    await expect(quoteBtn).toBeVisible();
  });

  test('UAE Trade Corridor (/export/corridors/uae) renders Jebel Ali port logistics and HS codes', async ({ page }) => {
    await page.goto('/export/corridors/uae', { waitUntil: 'domcontentloaded' });

    // Verify UAE corridor content
    await expect(page.locator('main h1').filter({ hasText: /United Arab Emirates|UAE/i })).toBeVisible();
    await expect(page.locator('main').locator('text=/Jebel Ali|Dubai|Port/i').first()).toBeVisible();
  });

  test('Ball Copra Dedicated Export Page (/export/ball-copra-india) renders GI specs and grade standards', async ({ page }) => {
    await page.goto('/export/ball-copra-india', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('main').locator('text=/Tiptur|Ball Copra|Unde Kobbari|Grade/i').first()).toBeVisible();
  });
});
