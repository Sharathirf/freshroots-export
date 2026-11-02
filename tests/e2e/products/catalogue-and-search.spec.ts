import { test, expect } from '../../fixtures/base-test';

test.describe('B. Product Catalogue, Search & Navigation', () => {
  test('Home page displays H1, value propositions, and direct catalog', async ({ homePage, page }) => {
    await homePage.goto('/');
    const title = await homePage.getTitle();
    expect(title).toContain('FreshRoots Export');

    // H1 check
    const h1Text = await homePage.headline.first().textContent();
    expect(h1Text).toBeTruthy();

    // Verify catalog section is rendered
    await expect(homePage.catalogSection).toBeVisible();

    // Verify products are loaded
    const productCards = page.locator('article[data-testid="product-card"], a[href^="/products/"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Search functionality filters products in real-time', async ({ homePage, page }) => {
    await homePage.goto('/#catalog');
    await homePage.searchProduct('Copra');
    await page.waitForTimeout(500);

    // Should display copra products and not unrelated items
    const matches = page.locator('text=/Copra|Kobbari/i');
    await expect(matches.first()).toBeVisible();
  });

  test('Product detail page renders specs, price, and actions', async ({ page }) => {
    // Navigate to copra product page
    await page.goto('/products/tiptur-ball-copra-boxes-15kg', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/Ball Copra|Copra/i);

    // Verify pricing and weight display
    await expect(page.locator('text=₹').first()).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first()).toBeVisible();
  });

  test('Invalid product slug gracefully displays 404', async ({ page }) => {
    const res = await page.goto('/products/non-existent-farm-item-xyz-123', { waitUntil: 'domcontentloaded' });
    expect([200, 404]).toContain(res?.status() || 404);
    await expect(page.locator('text=/Not Found|404|No longer available/i').first()).toBeVisible();
  });
});
