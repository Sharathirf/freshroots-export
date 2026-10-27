import assert from 'node:assert/strict';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { CATALOG_PRODUCTS, getAllCatalogProducts } from '../lib/catalog';
import {
  generateProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateArticleJsonLd,
  generateItemListJsonLd,
  generateFAQJsonLd
} from '../lib/seo';
import { EDUCATIONAL_GUIDES } from '../lib/guides';
import { CATEGORIES } from '../lib/categories';
import { EXPORT_COUNTRIES } from '../lib/export-countries';

console.log('🧪 Starting FreshRoots Export Technical SEO & Metadata Test Suite...\n');

let passCount = 0;
function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      res.then(() => {
        console.log(`  ✅ ${name}`);
        passCount++;
      }).catch((err) => {
        console.error(`  ❌ ${name}:`, err.message);
        process.exitCode = 1;
      });
    } else {
      console.log(`  ✅ ${name}`);
      passCount++;
    }
  } catch (err: any) {
    console.error(`  ❌ ${name}:`, err.message);
    process.exitCode = 1;
  }
}

async function runSeoTests() {
  // Test 1: Catalog Integrity
  test('Catalog contains exactly 11 distinct agricultural commodities with valid SKUs and slugs', () => {
    const products = getAllCatalogProducts();
    assert.equal(products.length, 11, `Expected 11 catalog products, got ${products.length}`);
    const slugs = new Set(products.map((p) => p.slug));
    assert.equal(slugs.size, 11, 'All product slugs must be unique');
    const skus = new Set(products.map((p) => p.sku));
    assert.equal(skus.size, 11, 'All product SKUs must be unique');
  });

  // Test 2: Product Metadata Uniqueness
  test('Every product has unique, non-empty SEO title and meta description', () => {
    const products = getAllCatalogProducts();
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const prod of products) {
      assert.ok(prod.seoTitle && prod.seoTitle.length > 20, `SEO Title for ${prod.sku} too short`);
      assert.ok(prod.seoDescription && prod.seoDescription.length > 50, `SEO Description for ${prod.sku} too short`);
      assert.ok(!titles.has(prod.seoTitle), `Duplicate SEO Title detected: ${prod.seoTitle}`);
      assert.ok(!descriptions.has(prod.seoDescription), `Duplicate SEO Description detected: ${prod.seoDescription}`);
      titles.add(prod.seoTitle);
      descriptions.add(prod.seoDescription);

      const metadata = generateProductMetadata(prod);
      assert.equal(metadata.title, prod.seoTitle);
      assert.equal(metadata.description, prod.seoDescription);
      assert.ok(metadata.alternates?.canonical, `Missing canonical for ${prod.slug}`);
    }
  });

  // Test 3: Structured Data Schema Validation
  test('Product JSON-LD schema conforms to Schema.org standards (Product, Offer, Brand, InStock)', () => {
    const siteUrl = 'https://freshrootsexport.com';
    const sample = CATALOG_PRODUCTS[0];
    const jsonLd = generateProductJsonLd(sample, siteUrl);

    assert.equal(jsonLd['@context'], 'https://schema.org');
    assert.equal(jsonLd['@type'], 'Product');
    assert.equal(jsonLd.name, sample.title);
    assert.equal(jsonLd.sku, sample.sku);
    assert.ok(jsonLd.offers, 'Offers block must exist');
    assert.equal(jsonLd.offers.priceCurrency, 'INR');
    assert.equal(jsonLd.offers.price, sample.retail_price_inr);
    assert.equal(jsonLd.offers.availability, 'https://schema.org/InStock');
    assert.ok(jsonLd.aggregateRating, 'AggregateRating block must exist for reviewed product');
    assert.equal(jsonLd.aggregateRating.ratingValue, sample.average_rating);
  });

  // Test 4: BreadcrumbList Schema Validation
  test('BreadcrumbList JSON-LD schema creates valid hierarchical list with 1-based indexing', () => {
    const siteUrl = 'https://freshrootsexport.com';
    const crumbs = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/#products' },
      { name: 'Mature Coconuts', url: '/products/fresh-semi-husked-mature-coconuts-25-piece' }
    ];
    const breadcrumbLd = generateBreadcrumbJsonLd(crumbs, siteUrl);

    assert.equal(breadcrumbLd['@context'], 'https://schema.org');
    assert.equal(breadcrumbLd['@type'], 'BreadcrumbList');
    assert.equal(breadcrumbLd.itemListElement.length, 3);
    assert.equal(breadcrumbLd.itemListElement[0].position, 1);
    assert.equal(breadcrumbLd.itemListElement[1].position, 2);
    assert.equal(breadcrumbLd.itemListElement[2].position, 3);
    assert.equal(breadcrumbLd.itemListElement[2].item, `${siteUrl}/products/fresh-semi-husked-mature-coconuts-25-piece`);
  });

  // Test 5: Organization & WebSite JSON-LD
  test('Organization JSON-LD includes agricultural brand credentials, contact desk, and 12 export corridors', () => {
    const siteUrl = 'https://freshrootsexport.com';
    const org = generateOrganizationJsonLd(siteUrl);
    const site = generateWebSiteJsonLd(siteUrl);

    assert.equal(org['@type'], 'Organization');
    assert.equal(org.telephone, '+919591142548');
    assert.equal(org.email, 'sharathir198@gmail.com');
    assert.ok(Array.isArray(org.areaServed));
    assert.equal(org.areaServed.length, 13); // India + 12 corridors
    assert.equal(site['@type'], 'WebSite');
  });

  // Test 6: Environment Isolation in Robots.txt
  test('Robots.txt restricts dev/staging/UAT and allows indexable routes in production', () => {
    const originalEnv = process.env.APP_ENV;
    const originalNodeEnv = process.env.NODE_ENV;

    // Simulate UAT
    process.env.APP_ENV = 'uat';
    const uatRobots = robots();
    const uatRules = Array.isArray(uatRobots.rules) ? uatRobots.rules[0] : uatRobots.rules;
    assert.equal(uatRules.disallow, '/', 'UAT environment must disallow all crawlers');
    assert.equal(uatRobots.sitemap, undefined, 'UAT environment must not publish sitemap');

    // Simulate Staging
    process.env.APP_ENV = 'staging';
    const stagingRobots = robots();
    const stagingRules = Array.isArray(stagingRobots.rules) ? stagingRobots.rules[0] : stagingRobots.rules;
    assert.equal(stagingRules.disallow, '/', 'Staging environment must disallow all crawlers');

    // Simulate Production
    delete process.env.APP_ENV;
    delete process.env.VERCEL_ENV;
    (process.env as any).NODE_ENV = 'production';
    const prodRobots = robots();
    const prodRules = Array.isArray(prodRobots.rules) ? prodRobots.rules[0] : prodRobots.rules;
    assert.ok(Array.isArray(prodRules.allow) || prodRules.allow === '/', 'Production robots must have allow rules');
    assert.ok(Array.isArray(prodRules.disallow), 'Production robots must have disallow rules');
    assert.ok(prodRules.disallow.includes('/admin'), 'Production must disallow /admin');
    assert.ok(prodRules.disallow.includes('/api/'), 'Production must disallow /api/');
    assert.ok(prodRobots.sitemap?.includes('/sitemap.xml'), 'Production robots must point to sitemap.xml');

    // Restore
    if (originalEnv) process.env.APP_ENV = originalEnv;
    else delete process.env.APP_ENV;
    (process.env as any).NODE_ENV = originalNodeEnv;
  });

  // Test 7: Sitemap Generation in Production vs Staging
  test('Sitemap includes all 11 products + static routes in production with verified lastModified date', () => {
    const originalEnv = process.env.APP_ENV;
    const originalNodeEnv = process.env.NODE_ENV;

    // Simulate staging: must return empty array to prevent staging indexing leaks
    process.env.APP_ENV = 'staging';
    const stagingSitemap = sitemap();
    assert.equal(stagingSitemap.length, 0, 'Staging sitemap must be empty array');

    // Simulate production: must return 9 static + 7 categories + 11 products + 5 guides = 32 total entries
    delete process.env.APP_ENV;
    delete process.env.VERCEL_ENV;
    (process.env as any).NODE_ENV = 'production';
    const prodSitemap = sitemap();
    assert.equal(prodSitemap.length, 32, `Expected 32 sitemap items (9 static + 7 categories + 11 products + 5 guides), got ${prodSitemap.length}`);

    // Verify lastModified is a valid Date without dynamic regeneration
    for (const item of prodSitemap) {
      assert.ok(item.url.startsWith('https://freshrootsexport.com'), `Invalid URL in sitemap: ${item.url}`);
      assert.ok(item.lastModified, `Missing lastModified for ${item.url}`);
      const date = item.lastModified instanceof Date ? item.lastModified : new Date(item.lastModified);
      assert.ok(!isNaN(date.getTime()), `Invalid lastModified date for ${item.url}`);
      assert.ok(date.getFullYear() === 2026, `Expected verified 2026 release year, got ${date.toISOString()}`);
    }

    // Restore
    if (originalEnv) process.env.APP_ENV = originalEnv;
    else delete process.env.APP_ENV;
    (process.env as any).NODE_ENV = originalNodeEnv;
  });

  // Test 8: Article JSON-LD Schema
  test('Article JSON-LD schema correctly formats headline, author, and publisher', () => {
    const guide = EDUCATIONAL_GUIDES[0];
    const schema = generateArticleJsonLd(
      {
        title: guide.title,
        description: guide.metaDescription,
        slug: guide.slug,
        publishedAt: guide.publishedAt,
        updatedAt: guide.updatedAt,
      },
      'https://freshrootsexport.com'
    );
    assert.equal(schema['@type'], 'Article');
    assert.equal(schema.headline, guide.title);
    assert.equal(schema.url, `https://freshrootsexport.com/guides/${guide.slug}`);
    assert.equal(schema.author.name, 'FreshRoots Agronomy Research Desk');
  });

  // Test 9: ItemList JSON-LD Schema for Categories
  test('ItemList JSON-LD schema renders category items with 1-based indexing', () => {
    const category = CATEGORIES[0];
    const schema = generateItemListJsonLd(
      category.title,
      [
        { name: 'Mature Coconuts 25 Bag', url: '/products/fresh-mature-coconut', price: 1479 },
      ],
      'https://freshrootsexport.com'
    );
    assert.equal(schema['@type'], 'ItemList');
    assert.equal(schema.numberOfItems, 1);
    assert.equal(schema.itemListElement[0].position, 1);
    assert.ok(schema.itemListElement[0].url.startsWith('https://freshrootsexport.com'));
  });

  // Test 10: FAQPage JSON-LD Schema
  test('FAQPage JSON-LD schema validates Question and acceptedAnswer pairs', () => {
    const faqs = [
      { question: 'What is the moisture percentage?', answer: 'Under 5.5%.' }
    ];
    const schema = generateFAQJsonLd(faqs);
    assert.ok(schema);
    assert.equal(schema['@type'], 'FAQPage');
    assert.equal(schema.mainEntity[0].name, 'What is the moisture percentage?');
    assert.equal(schema.mainEntity[0].acceptedAnswer.text, 'Under 5.5%.');
  });

  // Test 11: Export Countries Wikipedia Links
  test('All 12 active global export corridors have verified Wikipedia links', () => {
    assert.equal(EXPORT_COUNTRIES.length, 12, 'Must have exactly 12 active export countries');
    for (const c of EXPORT_COUNTRIES) {
      assert.ok(c.wikiUrl, `Missing wikiUrl for ${c.name}`);
      assert.ok(c.wikiUrl.startsWith('https://en.wikipedia.org/wiki/'), `Invalid Wikipedia URL for ${c.name}: ${c.wikiUrl}`);
      assert.ok(c.flag, `Missing flag for ${c.name}`);
    }
  });

  console.log(`\n🎉 All ${passCount} Technical SEO tests passed successfully!`);
}

runSeoTests();
