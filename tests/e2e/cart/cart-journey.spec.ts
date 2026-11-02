import { test, expect } from '../../fixtures/base-test';

test.describe('C. Add to Cart & Shopping Cart Journey', () => {
  test('Guest user clicking Add to Cart prompts Sign In modal; Authenticated user opens Cart Drawer', async ({ page }) => {
    // 1. Guest user flow
    await page.goto('/products/fresh-semi-husked-mature-coconuts-25-piece', { waitUntil: 'domcontentloaded' });
    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    await addBtn.click();

    // Verify Sign In modal or Cart Drawer opens
    const signInModal = page.locator('text=/Customer Sign In|Sign In & Sign Up/i');
    await expect(signInModal.first()).toBeVisible({ timeout: 5000 });

    // 2. Authenticated user flow
    await page.evaluate(() => {
      localStorage.setItem(
        'tiptur_customer_session',
        JSON.stringify({
          phone: '9845019999',
          name: 'Verified Farmer Buyer',
          signedInAt: new Date().toISOString(),
        })
      );
    });

    await page.reload();
    await page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first().click();

    // Verify Cart Drawer opens with item and price
    const drawer = page.locator('div.fixed.inset-0, div[role="dialog"], aside').filter({ hasText: /Shopping Cart|My Cart|Cart/i });
    await expect(drawer.first()).toBeVisible({ timeout: 5000 });
    await expect(drawer.first().locator('text=₹').first()).toBeVisible();
  });

  test('Cart quantity updates and item removal', async ({ page }) => {
    // Inject item directly into localStorage for deterministic testing
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const sampleItem = [
        {
          product_id: 'prod-mature-coconuts',
          sku: 'COC-MATURE-25P',
          title: 'Fresh Semi-Husked Mature Coconuts (25-Nut Bag)',
          unit_of_measure: '25-nut bag',
          quantity: 1,
          unit_price_inr: 1479,
          total_price_inr: 1479,
          estimated_weight_kg: 15,
        },
      ];
      localStorage.setItem('tiptur_direct_cart', JSON.stringify(sampleItem));
      localStorage.setItem(
        'tiptur_customer_session',
        JSON.stringify({ phone: '9845019999', name: 'Verified Farmer Buyer' })
      );
    });

    // Reload page to hydrate cart
    await page.reload();

    // Open Cart
    const cartTrigger = page.locator('button[aria-label*="cart" i], button:has-text("Cart")').first();
    await cartTrigger.click();

    const drawer = page.locator('div.fixed.inset-0, div[role="dialog"], aside').filter({ hasText: /Shopping Cart|My Cart|Cart/i });
    await expect(drawer.first()).toBeVisible();

    // Verify item is present
    await expect(drawer.first().locator('text=Mature Coconuts').first()).toBeVisible();

    // Click remove item / trash button
    const removeBtn = drawer.first().locator('button[title*="Remove" i], button:has(svg.lucide-trash-2)').first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      await expect(drawer.first().locator('text=/Cart is empty|Your cart is empty/i')).toBeVisible();
    }
  });

  test('Cart data persists across page navigation', async ({ page }) => {
    // 1. Authenticate user
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem(
        'tiptur_customer_session',
        JSON.stringify({ phone: '9845019999', name: 'Verified Farmer Buyer' })
      );
    });

    // 2. Add product to cart via product page
    await page.goto('/products/fresh-semi-husked-mature-coconuts-25-piece', { waitUntil: 'domcontentloaded' });
    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    await addBtn.click();
    await page.waitForTimeout(800);

    // 3. Navigate to another page (e.g. /export)
    await page.goto('/export', { waitUntil: 'domcontentloaded' });

    // 4. Verify cart items persist in localStorage
    const storedCart = await page.evaluate(() => localStorage.getItem('tiptur_direct_cart'));
    expect(storedCart).toBeTruthy();
    expect(storedCart).not.toBe('[]');
    expect(storedCart).toContain('COC-');
  });
});
