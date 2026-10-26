import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'playwright-screenshots/mobile-audit');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PAGES_TO_TEST = [
  { name: '01-homepage', path: '/' },
  { name: '02-product-pdp', path: '/products/tiptur-ball-copra-special' },
  { name: '03-track-order', path: '/track-order' },
  { name: '04-transportation', path: '/transportation' },
  { name: '05-contact', path: '/contact' },
  { name: '06-privacy', path: '/privacy' },
  { name: '07-terms', path: '/terms' },
  { name: '08-refund-policy', path: '/refund-policy' },
  { name: '09-shipping-policy', path: '/shipping-policy' },
  { name: '10-admin', path: '/admin' },
  { name: '11-not-found', path: '/non-existent-page-404' }
];

async function runMobileAudit() {
  console.log('======================================================================');
  console.log('📱 COMPREHENSIVE MOBILE VIEWPORT AUDIT & UI DIAGNOSIS');
  console.log('======================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  const results: any[] = [];

  for (const pageTest of PAGES_TO_TEST) {
    console.log(`▶ Auditing: ${pageTest.name} (${pageTest.path})...`);
    try {
      await page.goto(`${BASE_URL}${pageTest.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const auditData = await page.evaluate(() => {
        const winWidth = window.innerWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const hasHorizontalScroll = scrollWidth > winWidth + 1 || bodyScrollWidth > winWidth + 1;

        const overflowing: any[] = [];
        document.querySelectorAll('*').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winWidth + 2) {
            overflowing.push({
              tag: el.tagName,
              id: el.id,
              class: (el.className || '').toString().slice(0, 60),
              right: Math.round(rect.right),
              overflowPx: Math.round(rect.right - winWidth)
            });
          }
        });

        // Check input fonts for iOS zoom (< 16px font-size causes unwanted zoom)
        const smallInputs: any[] = [];
        document.querySelectorAll('input, select, textarea').forEach((input) => {
          const style = window.getComputedStyle(input);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize < 15.5) {
            smallInputs.push({
              tag: input.tagName,
              placeholder: (input as any).placeholder || '',
              fontSize: `${fontSize}px`
            });
          }
        });

        return {
          winWidth,
          scrollWidth,
          hasHorizontalScroll,
          overflowingCount: overflowing.length,
          overflowingItems: overflowing.slice(0, 5),
          smallInputsCount: smallInputs.length,
          smallInputs: smallInputs.slice(0, 3)
        };
      });

      const shotPath = `${SCREENSHOT_DIR}/${pageTest.name}.png`;
      await page.screenshot({ path: shotPath, fullPage: false });

      results.push({
        name: pageTest.name,
        path: pageTest.path,
        status: auditData.hasHorizontalScroll ? 'FAILED_OVERFLOW' : 'PASSED',
        auditData
      });

      console.log(
        `   ${auditData.hasHorizontalScroll ? '❌ OVERFLOW' : '✅ CLEAN'}: scrollWidth=${auditData.scrollWidth}px (window=${auditData.winWidth}px), overflowingEls=${auditData.overflowingCount}, smallInputs=${auditData.smallInputsCount}`
      );
      if (auditData.overflowingCount > 0) {
        console.log('   🚨 Overflowing elements:', auditData.overflowingItems);
      }
    } catch (e: any) {
      console.error(`   ❌ Error loading ${pageTest.path}:`, e.message);
      results.push({ name: pageTest.name, path: pageTest.path, status: 'ERROR', error: e.message });
    }
  }

  // ---------------------------------------------------------
  // MODAL & DRAWER CHECKS ON MOBILE
  // ---------------------------------------------------------
  console.log('\n▶ Auditing Modals & Drawers on Mobile...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // 1. Cart Drawer & Checkout Drawer
  try {
    await page.waitForSelector('#catalog', { timeout: 10000 });
    await page.locator('#catalog').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const addBtn = page.locator('#catalog button:has-text("Add")').first();
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();

    await page.waitForSelector('text=Your Shopping Cart', { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-modal-cart-drawer.png` });
    console.log('   ✅ Saved: 12-modal-cart-drawer.png');

    // Click Proceed to checkout
    const chkBtn = page.locator('button:has-text("Proceed to Delivery & Payment")');
    if (await chkBtn.isVisible()) {
      await chkBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/13-modal-checkout-drawer.png` });
      console.log('   ✅ Saved: 13-modal-checkout-drawer.png');
    }

    // Close drawer
    const closeBtn = page.locator('button[aria-label="Close cart"], button:has-text("✕")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(400);
  } catch (err: any) {
    console.warn('   ⚠️ Cart Drawer check warning:', err.message);
  }

  // 2. Wholesale RFQ Modal
  try {
    const rfqBtn = page.locator('button:has-text("Wholesale / Bulk Quote"), button:has-text("Wholesale")').first();
    if (await rfqBtn.isVisible()) {
      await rfqBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/14-modal-wholesale-rfq.png` });
      console.log('   ✅ Saved: 14-modal-wholesale-rfq.png');

      const closeRfq = page.locator('button[aria-label="Close"], button:has-text("✕")').first();
      if (await closeRfq.isVisible()) await closeRfq.click();
      await page.waitForTimeout(400);
    }
  } catch (err: any) {
    console.warn('   ⚠️ RFQ modal check warning:', err.message);
  }

  // 3. Voice / WhatsApp Order Modal
  try {
    const voiceBtn = page.locator('button:has-text("WhatsApp Order"), button:has-text("Voice Order")');
    if (await voiceBtn.isVisible()) {
      await voiceBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/15-modal-voice-order.png` });
      console.log('   ✅ Saved: 15-modal-voice-order.png');
    }
  } catch (err: any) {
    console.warn('   ⚠️ Voice modal check warning:', err.message);
  }

  // 4. PDP Sticky Action Bar
  try {
    await page.goto(`${BASE_URL}/products/tiptur-ball-copra-special`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-pdp-mobile-sticky-action-bar.png` });
    console.log('   ✅ Saved: 02-pdp-mobile-sticky-action-bar.png');
  } catch (err: any) {
    console.warn('   ⚠️ PDP Sticky action bar warning:', err.message);
  }

  console.log('\n======================================================================');
  console.log('📊 MOBILE AUDIT RESULTS SUMMARY');
  console.log('======================================================================');
  console.table(
    results.map((r) => ({
      Page: r.name,
      Route: r.path,
      Status: r.status,
      ScrollWidth: r.auditData?.scrollWidth || 'N/A',
      Overflowing: r.auditData?.overflowingCount || 0,
      SmallInputs: r.auditData?.smallInputsCount || 0
    }))
  );

  await browser.close();
  return results;
}

runMobileAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
