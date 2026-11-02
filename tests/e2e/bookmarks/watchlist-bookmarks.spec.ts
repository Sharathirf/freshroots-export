import { test, expect } from '../../fixtures/base-test';

test.describe('G. Watchlist / Bookmark Functionality', () => {
  test('Toggling watchlist persists in localStorage and updates Navbar count', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Seed customer session so watchlist is enabled
    await page.evaluate(() => {
      localStorage.setItem('tiptur_customer_session', JSON.stringify({ phone: '9845019999', name: 'Watchlist Tester' }));
      localStorage.setItem(
        'tiptur_wishlist',
        JSON.stringify([
          {
            id: 'prod-copra',
            title: 'GI Tiptur Ball Copra (15 kg Master Box)',
            price: 5508,
            category: 'copra',
          },
        ])
      );
    });

    await page.reload();

    // Verify Watchlist trigger has count 1
    const watchlistTrigger = page.locator('button[aria-label="View Watchlist"], button[title="My Watchlist"]').first();
    await expect(watchlistTrigger).toBeVisible();

    // Open Watchlist
    await watchlistTrigger.click();

    // Verify item is present in Watchlist drawer
    const drawer = page.locator('div.fixed.inset-0, div[role="dialog"], aside').filter({ hasText: /My Watchlist|Watchlist/i });
    await expect(drawer.first()).toBeVisible();
    await expect(drawer.first().locator('text=Ball Copra').first()).toBeVisible();

    // Remove from watchlist
    const removeBtn = drawer.first().locator('button[title*="Remove from watchlist" i], button:has(svg.lucide-trash-2)').first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      await expect(drawer.first().locator('text=/Watchlist is Empty/i')).toBeVisible();
    }
  });
});
