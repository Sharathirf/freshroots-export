import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createAdminSession } from '@/lib/admin-auth';

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = '/Users/apple/.gemini/antigravity/brain/677feb52-58ff-4189-9a8e-1e275217da61';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'admin-mobile-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface DeviceTest {
  name: string;
  width: number;
  height: number;
}

const DEVICES: DeviceTest[] = [
  { name: 'iPhone-SE-375px', width: 375, height: 667 },
  { name: 'iPhone-15Pro-393px', width: 393, height: 852 },
  { name: 'Galaxy-S24-360px', width: 360, height: 800 },
];

async function runMobileAudit() {
  console.log('📱 Starting In-Depth Mobile QA Audit for FreshRoots Admin Portal...\n');

  const browser = await chromium.launch({ headless: true });

  const auditResults: Array<{
    device: string;
    view: string;
    scrollWidth: number;
    clientWidth: number;
    hasOverflow: boolean;
    headerHeight: number;
    headerOverflow: boolean;
    notes: string;
  }> = [];

  for (const device of DEVICES) {
    console.log(`\n======================================================`);
    console.log(`📱 Auditing Device: ${device.name} (${device.width}x${device.height})`);
    console.log(`======================================================`);

    // -------------------------------------------------------------------------
    // 1. UNAUTHENTICATED LOGIN SCREEN AUDIT
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const loginMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth,
        };
      });

      const shotLogin = path.join(SCREENSHOT_DIR, `${device.name}-01-login-totp.png`);
      await page.screenshot({ path: shotLogin, fullPage: true });

      // Click Master Password toggle
      const pwTab = page.locator('button:has-text("Master Password")');
      if (await pwTab.isVisible()) {
        await pwTab.click();
        await page.waitForTimeout(400);
        const shotPw = path.join(SCREENSHOT_DIR, `${device.name}-02-login-password.png`);
        await page.screenshot({ path: shotPw, fullPage: true });
      }

      auditResults.push({
        device: device.name,
        view: 'Login Screen (Dual Auth)',
        scrollWidth: loginMetrics.scrollWidth,
        clientWidth: loginMetrics.clientWidth,
        hasOverflow: loginMetrics.hasOverflow,
        headerHeight: 0,
        headerOverflow: false,
        notes: `Login box responsive; screenshots saved.`,
      });

      await context.close();
    }

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATED OPERATIONS DESK AUDIT
    // -------------------------------------------------------------------------
    {
      const adminSession = createAdminSession();
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      });

      await context.addCookies([
        {
          name: 'freshroots_admin_session',
          value: adminSession.value,
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      await page.waitForSelector('header', { timeout: 6000 });
      await page.waitForTimeout(800);

      // Measure Header Layout
      const headerMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const header = document.querySelector('header');
        const headerInner = header?.querySelector('.max-w-7xl');
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth,
          headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
          headerScrollWidth: headerInner ? headerInner.scrollWidth : 0,
          headerClientWidth: headerInner ? headerInner.clientWidth : 0,
          headerOverflow: headerInner ? headerInner.scrollWidth > headerInner.clientWidth : false,
        };
      });

      console.log(`  [Header] height: ${headerMetrics.headerHeight}px, overflow: ${headerMetrics.headerOverflow ? '⚠️ YES' : '✅ NO'}`);
      console.log(`  [Overall Page] clientWidth: ${headerMetrics.clientWidth}px, scrollWidth: ${headerMetrics.scrollWidth}px, overflow: ${headerMetrics.hasOverflow ? '❌ YES' : '✅ NO'}`);

      // Screenshot Tab 1: Commodities & Pricing
      const shotProducts = path.join(SCREENSHOT_DIR, `${device.name}-03-dashboard-products.png`);
      await page.screenshot({ path: shotProducts, fullPage: false });

      auditResults.push({
        device: device.name,
        view: 'Dashboard: Commodities & Pricing Tab',
        scrollWidth: headerMetrics.scrollWidth,
        clientWidth: headerMetrics.clientWidth,
        hasOverflow: headerMetrics.hasOverflow,
        headerHeight: headerMetrics.headerHeight,
        headerOverflow: headerMetrics.headerOverflow,
        notes: `Header height: ${headerMetrics.headerHeight}px, Header scrollWidth: ${headerMetrics.headerScrollWidth}px vs ${headerMetrics.headerClientWidth}px`,
      });

      // Switch to Wholesale RFQs Tab
      const rfqTab = page.locator('button:has-text("Wholesale RFQs")');
      if (await rfqTab.isVisible()) {
        await rfqTab.click();
        await page.waitForTimeout(600);
        const shotRfq = path.join(SCREENSHOT_DIR, `${device.name}-04-dashboard-rfqs.png`);
        await page.screenshot({ path: shotRfq, fullPage: false });
      }

      // Switch to Retail Orders Tab
      const ordersTab = page.locator('button:has-text("Retail Orders")');
      if (await ordersTab.isVisible()) {
        await ordersTab.click();
        await page.waitForTimeout(600);
        const shotOrders = path.join(SCREENSHOT_DIR, `${device.name}-05-dashboard-orders.png`);
        await page.screenshot({ path: shotOrders, fullPage: false });
      }

      // Switch to Customer CRM Tab
      const crmTab = page.locator('button:has-text("Customer CRM")');
      if (await crmTab.isVisible()) {
        await crmTab.click();
        await page.waitForTimeout(600);
        const shotCrm = path.join(SCREENSHOT_DIR, `${device.name}-06-dashboard-crm.png`);
        await page.screenshot({ path: shotCrm, fullPage: false });
      }

      // Open TOTP Setup Modal from header
      const totpHeaderBtn = page.locator('header button[title*="Google Authenticator"]');
      if (await totpHeaderBtn.isVisible()) {
        await totpHeaderBtn.click();
        await page.waitForTimeout(800);
        const shotTotpModal = path.join(SCREENSHOT_DIR, `${device.name}-07-totp-setup-modal.png`);
        await page.screenshot({ path: shotTotpModal, fullPage: false });
        console.log(`  [2FA Modal] Captured modal on ${device.name}`);
        const doneBtn = page.locator('button:has-text("Done")');
        if (await doneBtn.isVisible()) {
          await doneBtn.click({ force: true });
        } else {
          await page.keyboard.press('Escape');
        }
      }

      await context.close();
    }
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('🏁 Audit Complete! Summary Table:');
  console.log('======================================================');
  console.table(auditResults);
}

runMobileAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
