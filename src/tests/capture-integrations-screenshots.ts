import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminSession } from '../lib/admin-auth';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const session = createAdminSession();
  await context.addCookies([
    {
      name: 'freshroots_admin_session',
      value: session.value,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  const page = await context.newPage();

  const outDir = path.join(process.env.HOME || '', '.gemini/antigravity/brain/677feb52-58ff-4189-9a8e-1e275217da61/integrations-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Integrations tab
  await page.goto('http://localhost:3000/admin?tab=integrations');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '01-service-readiness-desk.png'), fullPage: false });
  console.log('Saved 01-service-readiness-desk.png');

  // 2. Cloudflare Analytics Setup Modal
  await page.goto('http://localhost:3000/admin?tab=integrations&setup=cloudflare-analytics');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '02-setup-cloudflare-analytics.png') });
  console.log('Saved 02-setup-cloudflare-analytics.png');

  // 3. PostHog Funnel Setup
  await page.goto('http://localhost:3000/admin?tab=integrations&setup=posthog');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '03-setup-posthog.png') });
  console.log('Saved 03-setup-posthog.png');

  // 4. Resend Setup
  await page.goto('http://localhost:3000/admin?tab=integrations&setup=resend');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '04-setup-resend.png') });
  console.log('Saved 04-setup-resend.png');

  // 5. Firebase Setup
  await page.goto('http://localhost:3000/admin?tab=integrations&setup=firebase');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '05-setup-firebase.png') });
  console.log('Saved 05-setup-firebase.png');

  await browser.close();
  console.log('All screenshots captured successfully in artifact directory!');
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
