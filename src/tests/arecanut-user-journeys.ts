import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import pool, { query } from '../lib/db';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const ARTIFACT_DIR = path.resolve(process.cwd(), 'playwright-screenshots/arecanut-e2e');
const PRODUCT_SLUG = 'shimoga-arecanut-adike-bulk';

type JourneyResult = {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  screenshot: string;
  error?: string;
};

const results: JourneyResult[] = [];
let browser: Browser;
let testRfqEmail: string | undefined;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function openHome(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#catalog').waitFor({ state: 'visible' });
  await page.locator('#catalog article').first().waitFor({ state: 'visible' });
}

async function selectArecanutCategory(page: Page) {
  const categoryButton = page.getByRole('button', { name: 'Arecanut (Bulk)', exact: true });
  await categoryButton.click();
  assert((await categoryButton.getAttribute('aria-pressed')) === 'true', 'Arecanut category should become the active filter.');
  await page.locator('#catalog article').filter({ hasText: 'Shimoga Arecanut' }).waitFor({ state: 'visible' });
}

async function startContext(viewport = { width: 1440, height: 1000 }): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  return { context, page };
}

async function runJourney(
  id: string,
  name: string,
  test: (page: Page) => Promise<void>,
  viewport?: { width: number; height: number }
) {
  const screenshot = `${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  const artifactPath = path.join(ARTIFACT_DIR, screenshot);
  const { context, page } = await startContext(viewport);
  let errorMessage: string | undefined;

  try {
    await test(page);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  try {
    const dismissInstallPrompt = page.getByRole('button', { name: 'Not now', exact: true });
    await dismissInstallPrompt.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => undefined);
    if (await dismissInstallPrompt.isVisible().catch(() => false)) await dismissInstallPrompt.click();
    await page
      .locator('aside[aria-label="Install FreshRoots Export app"]')
      .waitFor({ state: 'detached', timeout: 1_000 })
      .catch(() => undefined);
    await page.screenshot({ path: artifactPath, fullPage: true, animations: 'disabled' });
  } catch (error) {
    const screenshotError = error instanceof Error ? error.message : String(error);
    errorMessage = [errorMessage, `Screenshot failed: ${screenshotError}`].filter(Boolean).join('\n');
  }

  await context.close();
  const result: JourneyResult = {
    id,
    name,
    status: errorMessage ? 'failed' : 'passed',
    screenshot,
    ...(errorMessage ? { error: errorMessage } : {}),
  };
  results.push(result);
  console.log(`${result.status === 'passed' ? 'PASS' : 'FAIL'} ${id}: ${name} — ${screenshot}`);
  if (errorMessage) console.error(`  ${errorMessage}`);
}

async function cleanupTestRfq() {
  if (!testRfqEmail) return;
  const quotes = await query<{ id: string }>(
    'SELECT id FROM wholesale_quotations WHERE contact_email = $1',
    [testRfqEmail]
  );
  for (const quote of quotes) {
    await query(
      "DELETE FROM audit_logs WHERE entity_type = 'wholesale_quotations' AND entity_id = $1",
      [quote.id]
    );
  }
  await query('DELETE FROM wholesale_quotations WHERE contact_email = $1', [testRfqEmail]);
}

async function run() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser = await chromium.launch({
    headless: true,
    ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await runJourney('01', 'home-catalog-loads', async (page) => {
    await openHome(page);
    await page.locator('#catalog article').first().waitFor({ state: 'visible' });
    assert((await page.title()).length > 0, 'The home page should have a document title.');
    assert(await page.getByRole('heading', { name: 'Select Your Produce' }).isVisible(), 'Catalog heading is missing.');
  });

  await runJourney('02', 'daily-mandi-price-cache', async (page) => {
    await openHome(page);
    const rates = await page.evaluate(async () => {
      const [copraResponse, arecanutResponse, repeatedResponse] = await Promise.all([
        fetch('/api/mandi/copra', { cache: 'no-store' }),
        fetch('/api/mandi/arecanut', { cache: 'no-store' }),
        fetch('/api/mandi/arecanut', { cache: 'no-store' }),
      ]);
      return {
        copraStatus: copraResponse.status,
        copra: await copraResponse.json(),
        arecanutStatus: arecanutResponse.status,
        arecanut: await arecanutResponse.json(),
        repeated: await repeatedResponse.json(),
      };
    });
    assert(rates.copraStatus === 200 && rates.arecanutStatus === 200, 'Mandi price endpoints must respond successfully.');
    assert(Number(rates.copra.pricePerQuintal) > 0, 'Copra price must be stored per quintal.');
    assert(Number(rates.arecanut.pricePerQuintal) > 0, 'Arecanut price must be stored per quintal.');
    assert(rates.arecanut.source.includes('acrop.app/mandi/karnataka/shivamogga/shimoga/arecanut'), 'Arecanut source link is incorrect.');
    assert(rates.arecanut.checkedOn === rates.repeated.checkedOn, 'Repeated requests should read the same daily DB cache record.');
    assert(await page.getByRole('link', { name: /Shimoga (?:APMC|Mandi) arecanut maximum/ }).isVisible(), 'The arecanut mandi source link is not visible in the ticker.');
    assert((await page.locator('header').innerText()).includes('/quintal'), 'The ticker should show prices using the source unit, per quintal.');
  });

  await runJourney('03', 'filter-arecanut-catalog', async (page) => {
    await openHome(page);
    await selectArecanutCategory(page);
    const cards = page.locator('#catalog article');
    assert((await cards.count()) === 1, 'Arecanut category should show only the bulk arecanut product.');
    assert(await cards.first().locator('h3').filter({ hasText: 'Shimoga Arecanut' }).isVisible(), 'Filtered arecanut product is missing.');
  });

  await runJourney('04', 'bulk-only-product-card', async (page) => {
    await openHome(page);
    await selectArecanutCategory(page);
    const card = page.locator('#catalog article').filter({ hasText: 'Shimoga Arecanut' });
    assert(await card.getByText('Bulk Orders Only').isVisible(), 'Product card must identify the arecanut lot as bulk-only.');
    assert(await card.getByText(/Mandi maximum: ₹[\d,]+ \/ quintal/).isVisible(), 'Card must display the mandi maximum per quintal.');
    assert(await card.getByText('Minimum bulk lot: 100 kg').isVisible(), 'Card must explain the 100 kg minimum lot.');
    assert((await card.getByRole('button', { name: /Add to Cart/ }).count()) === 0, 'Bulk-only card must not offer retail cart checkout.');
    assert(await card.getByRole('button', { name: /Request Wholesale/ }).isVisible(), 'Bulk quotation CTA is missing.');
  });

  await runJourney('05', 'prefilled-wholesale-quotation', async (page) => {
    await openHome(page);
    await selectArecanutCategory(page);
    const card = page.locator('#catalog article').filter({ hasText: 'Shimoga Arecanut' });
    await card.getByRole('button', { name: /Request Wholesale/ }).click();
    await page.getByRole('heading', { name: 'Request Wholesale Volume Quotation' }).waitFor({ state: 'visible' });
    const productSelect = page.locator('select').first();
    assert((await productSelect.locator('option:checked').innerText()).includes('Arecanut'), 'RFQ must preselect the product the buyer chose.');
    assert((await page.locator('select').nth(2).innerText()).includes('100 kg (1 Quintal)'), 'RFQ must offer a 1-quintal order volume.');
  });

  await runJourney('06', 'product-detail-wholesale-only', async (page) => {
    await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Wholesale & Commercial Bulk Consignment Only').waitFor({ state: 'visible' });
    assert(await page.locator('h1').filter({ hasText: 'Shimoga Arecanut' }).isVisible(), 'Arecanut product detail heading is missing.');
    assert(await page.getByText('Required Quantity', { exact: false }).isVisible(), 'Bulk inquiry form is missing from the product page.');
    assert((await page.getByRole('button', { name: /Add to Cart|Buy Now/ }).count()) === 0, 'Product detail must not allow retail purchase.');
  });

  await runJourney('07', 'minimum-lot-validation', async (page) => {
    await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Wholesale & Commercial Bulk Consignment Only').waitFor({ state: 'visible' });
    await page.locator('input[placeholder="e.g. Ramesh Kumar"]').fill('Arecanut Test Buyer');
    await page.locator('input[placeholder="e.g. 9845012345"]').fill('9876500001');
    await page.locator('input[type="number"]').first().fill('50');
    let rfqPostCount = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/rfq') && request.method() === 'POST') rfqPostCount += 1;
    });
    await page.getByRole('button', { name: 'Request a Bulk Quote' }).click();
    await page.getByText('Arecanut is supplied in lots of at least 100 kg (1 quintal).').waitFor({ state: 'visible' });
    assert(rfqPostCount === 0, 'Below-minimum lots must be rejected before submission.');
  });

  await runJourney('08', 'submit-valid-one-quintal-rfq', async (page) => {
    await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Wholesale & Commercial Bulk Consignment Only').waitFor({ state: 'visible' });
    testRfqEmail = `codex-arecanut-${Date.now()}@example.test`;
    await page.locator('input[placeholder="e.g. Ramesh Kumar"]').fill('Arecanut E2E Buyer');
    await page.locator('input[placeholder="e.g. 9845012345"]').fill('9876500002');
    await page.locator('input[placeholder="e.g. buyer@company.com"]').fill(testRfqEmail);
    await page.locator('input[type="number"]').first().fill('1');
    await page.locator('select').first().selectOption('Quintals');
    await page.getByRole('button', { name: 'Request a Bulk Quote' }).click();
    await page.getByText('Inquiry Registered').waitFor({ state: 'visible' });
    assert(await page.getByText('1 Quintal', { exact: true }).isVisible(), 'Successful enquiry should confirm the one-quintal quantity.');
    assert(await page.getByText('Requested Commodity:', { exact: true }).isVisible(), 'Successful enquiry should show the requested commodity details.');
  });

  await runJourney('09', 'retail-checkout-rejected', async (page) => {
    await page.goto(`${BASE_URL}/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded' });
    const response = await page.evaluate(async () => {
      const catalogResponse = await fetch('/api/products?category=arecanut');
      const catalog = await catalogResponse.json();
      const product = catalog.products?.[0];
      if (!product) throw new Error('Arecanut product is not in the API catalog.');
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Bulk Test Buyer',
          customer_phone: '9876500003',
          shipping_address: 'Test address',
          destination_pincode: '560001',
          payment_method: 'razorpay',
          items: [{ product_id: product.id, sku: product.sku, title: product.title, quantity: 100 }],
        }),
      });
      return { status: orderResponse.status, body: await orderResponse.json() };
    });
    assert(response.status === 400, 'Retail order API should reject a bulk-only arecanut SKU.');
    assert(/wholesale bulk inquiries/i.test(response.body.error || ''), 'Rejection should direct the buyer to a wholesale quotation.');
  });

  await runJourney('10', 'mobile-arecanut-buyer-flow', async (page) => {
    await openHome(page);
    await selectArecanutCategory(page);
    const card = page.locator('#catalog article').filter({ hasText: 'Shimoga Arecanut' });
    assert(await card.getByText('Bulk Orders Only').isVisible(), 'Bulk-only status should remain visible on mobile.');
    assert(await card.getByRole('button', { name: /Request Wholesale/ }).isVisible(), 'Wholesale CTA should remain available on mobile.');
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    assert(dimensions.document <= dimensions.viewport + 1, `Mobile page overflows horizontally (${dimensions.document}px > ${dimensions.viewport}px).`);
  }, { width: 390, height: 844 });

  try {
    await cleanupTestRfq();
  } catch (error) {
    console.error('Could not clean up the RFQ created by journey 08:', error);
    results.push({
      id: 'cleanup',
      name: 'remove-test-rfq-records',
      status: 'failed',
      screenshot: '',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  await browser.close();
  await pool.end();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  const passed = results.filter((result) => result.status === 'passed').length;
  const failed = results.length - passed;
  console.log(`\n${passed}/10 user journeys passed; ${failed} failed.`);
  console.log(`Screenshots and results: ${ARTIFACT_DIR}`);
  if (failed > 0) process.exitCode = 1;
}

void run().catch(async (error) => {
  console.error('E2E journey runner failed:', error);
  if (browser) await browser.close();
  await pool.end();
  process.exitCode = 1;
});
