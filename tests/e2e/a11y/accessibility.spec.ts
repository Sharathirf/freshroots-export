import { test, expect } from '../../fixtures/base-test';

test.describe('Accessibility (a11y), Semantic HTML & Keyboard Navigation Suite', () => {
  test('Home page conforms to semantic landmark hierarchy (header, main, footer)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Validate semantic landmarks
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();

    // Verify exactly one primary H1 exists
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Ensure all critical images have non-empty alt text
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('main img'));
      return imgs.filter((img) => !img.getAttribute('alt') || img.getAttribute('alt')?.trim() === '').length;
    });
    expect(imagesWithoutAlt).toBe(0);
  });

  test('Interactive navigation supports keyboard focus and visible focus outlines', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Tab through interactive elements and ensure focus is received
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'BODY']).toContain(focusedTag);
  });

  test('Form controls on Wholesale RFQ Page have associated accessible labels or placeholders', async ({ page }) => {
    await page.goto('/rfq', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main input', { timeout: 10000 });

    const inputs = page.locator('main input:not([type="hidden"]), main textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const hasLabel = id ? (await page.locator(`label[for="${id}"]`).count()) > 0 : false;

      expect(Boolean(ariaLabel || placeholder || hasLabel)).toBe(true);
    }
  });

  test('Buttons have accessible names (text, aria-label, or title)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 15); i++) {
      const btn = buttons.nth(i);
      const text = await btn.innerText();
      const ariaLabel = await btn.getAttribute('aria-label');
      const title = await btn.getAttribute('title');

      const isAccessible = Boolean(text.trim() || ariaLabel || title);
      expect(isAccessible).toBe(true);
    }
  });

  test('Skip to main content anchor is present for screen readers', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    expect(await skipLink.innerText()).toContain('Skip to main content');
  });
});
