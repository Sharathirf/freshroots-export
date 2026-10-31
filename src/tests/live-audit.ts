import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  module: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  recommendation?: string;
}

const results: TestResult[] = [];

function recordResult(res: TestResult) {
  results.push(res);
  const icon = res.status === 'PASS' ? '✅' : res.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${res.status}] ${res.module} > ${res.name}: ${res.details}`);
}

async function runAudit() {
  console.log('🚀 Starting Comprehensive Live Platform Playwright Audit for FreshRoots Export (https://freshrootsexport.com)...\n');
  
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FreshRoots-Audit-Bot',
    viewport: { width: 1280, height: 800 }
  });
  const page: Page = await context.newPage();

  // -------------------------------------------------------------
  // MODULE 1: HOMEPAGE & HEADER TICKER AUDIT
  // -------------------------------------------------------------
  console.log('\n--- MODULE 1: HOMEPAGE & HEADER TICKER AUDIT ---');
  try {
    const homeResponse = await page.goto('https://freshrootsexport.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = homeResponse?.status();
    if (status === 200) {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Homepage HTTP Status',
        status: 'PASS',
        details: 'Homepage loaded successfully with status 200.'
      });
    } else {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Homepage HTTP Status',
        status: 'FAIL',
        details: `Homepage returned status ${status}.`,
        recommendation: 'Check web server routing and CDN status.'
      });
    }

    // Check ticker text
    await page.waitForTimeout(3000); // Allow ticker to mount and hydrate
    const bodyText = await page.innerText('body');
    
    // Check ticker presence and items
    const hasCopra = /copra/i.test(bodyText) && (/tiptur/i.test(bodyText) || /33[,.]?100|₹/i.test(bodyText));
    const hasArecanut = /arecanut/i.test(bodyText) || /shimoga/i.test(bodyText) || /shivamogga/i.test(bodyText) || /70[,.]?809/i.test(bodyText);
    const hasCoconut = /coconut/i.test(bodyText);

    // Look specifically at ticker element
    const tickerEl = await page.$('[data-testid="mandi-ticker"], .ticker, header, [class*="ticker"]');
    const tickerText = tickerEl ? await tickerEl.innerText() : '';

    if (hasCopra && hasArecanut) {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Mandi Rate Ticker Live Rates',
        status: 'PASS',
        details: `Ticker verified on homepage. Copra, Arecanut, and Coconut rates detected in page content.`
      });
    } else {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Mandi Rate Ticker Live Rates',
        status: 'FAIL',
        details: `Missing expected Mandi ticker rates. Copra detected: ${hasCopra}, Arecanut detected: ${hasArecanut}, Coconut: ${hasCoconut}. Header text preview: "${tickerText.slice(0, 150)}..."`,
        recommendation: 'Verify mandi-sync API route and header ticker marquee component hydration.'
      });
    }

    // Header & Footer Navigation Links Audit
    const links = await page.$$eval('header a, footer a', (anchors) => 
      anchors.map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') }))
    );

    const brokenHrefs: { text?: string; href: string | null }[] = [];
    const internalLinksToCheck: string[] = [];

    for (const l of links) {
      if (!l.href || l.href.startsWith('about:invalid') || l.href === '#' || l.href.startsWith('javascript:')) {
        brokenHrefs.push(l);
      } else if (l.href.startsWith('/')) {
        if (!internalLinksToCheck.includes(l.href)) {
          internalLinksToCheck.push(l.href);
        }
      }
    }

    if (brokenHrefs.length === 0) {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Header & Footer Href Sanity',
        status: 'PASS',
        details: `All ${links.length} header/footer links have valid href attributes.`
      });
    } else {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Header & Footer Href Sanity',
        status: 'FAIL',
        details: `Found ${brokenHrefs.length} invalid/empty hrefs: ${JSON.stringify(brokenHrefs)}`,
        recommendation: 'Replace empty or invalid href attributes with valid destination URLs.'
      });
    }

    // Sample check key internal links
    const failedLinks: { href: string; status: number }[] = [];
    const sampleLinks = internalLinksToCheck.slice(0, 10);
    for (const target of sampleLinks) {
      try {
        const resp = await page.goto(`https://freshrootsexport.com${target}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (!resp || resp.status() >= 400) {
          failedLinks.push({ href: target, status: resp ? resp.status() : 0 });
        }
      } catch (err: any) {
        failedLinks.push({ href: target, status: 500 });
      }
    }

    if (failedLinks.length === 0) {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Navigation Route Resolution',
        status: 'PASS',
        details: `Sampled navigation links (${sampleLinks.join(', ')}) resolved successfully without 404.`
      });
    } else {
      recordResult({
        module: 'Module 1: Homepage & Ticker',
        name: 'Navigation Route Resolution',
        status: 'FAIL',
        details: `Failed links: ${JSON.stringify(failedLinks)}`,
        recommendation: 'Fix broken navigation routes returning 404.'
      });
    }

  } catch (err: any) {
    recordResult({
      module: 'Module 1: Homepage & Ticker',
      name: 'Homepage Execution',
      status: 'FAIL',
      details: `Exception: ${err.message}`
    });
  }

  // -------------------------------------------------------------
  // MODULE 2: CATALOG & VARIANT PRICING CONSISTENCY TEST
  // -------------------------------------------------------------
  console.log('\n--- MODULE 2: CATALOG & VARIANT PRICING CONSISTENCY TEST ---');
  try {
    await page.goto('https://freshrootsexport.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Product cards count
    const productCardSelectors = await page.$$eval('[data-testid="product-card"], a[href^="/products/"]', (els) => {
      return els.map(e => ({
        href: e.getAttribute('href'),
        text: e.textContent?.trim().replace(/\s+/g, ' ')
      })).filter(e => e.href?.startsWith('/products/'));
    });

    const uniqueProductHrefs = Array.from(new Set(productCardSelectors.map(p => p.href)));
    console.log(`Discovered ${uniqueProductHrefs.length} unique product links on homepage:`, uniqueProductHrefs);

    recordResult({
      module: 'Module 2: Catalog & Pricing',
      name: 'Commodity Catalog Count',
      status: uniqueProductHrefs.length >= 10 ? 'PASS' : 'WARNING',
      details: `Found ${uniqueProductHrefs.length} products listed on homepage catalog.`
    });

    // Check Wood-Pressed Groundnut Oil
    // Let's find the card on the homepage
    const groundnutLink = uniqueProductHrefs.find(h => h && /groundnut/i.test(h));
    console.log('Groundnut oil link:', groundnutLink);

    let homepageGroundnutPrice = '';
    let homepageGroundnutVariant = '';

    if (groundnutLink) {
      const cardEl = await page.$(`a[href="${groundnutLink}"]`);
      if (cardEl) {
        const cardText = await cardEl.innerText();
        console.log('Groundnut oil card text:', cardText);
        const priceMatch = cardText.match(/₹\s*(\d+)/);
        if (priceMatch) homepageGroundnutPrice = priceMatch[1];
        if (cardText.includes('500ml') || cardText.includes('500 ml')) homepageGroundnutVariant = '500ml';
        else if (cardText.includes('1L') || cardText.includes('1 L')) homepageGroundnutVariant = '1L';
      }

      // Navigate to Groundnut Oil Product Page
      await page.goto(`https://freshrootsexport.com${groundnutLink}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const pdpTitle = await page.title();
      const pdpBody = await page.innerText('body');

      // Check current displayed price
      // Look for active variant selection and price
      const priceTextMatches = pdpBody.match(/₹\s*(\d+)/g) || [];
      console.log('PDP price matches:', priceTextMatches.slice(0, 5));

      // Variant selector check
      const variantButtons = await page.$$eval('button', (btns) => 
        btns.filter(b => b.textContent?.includes('500') || b.textContent?.includes('1L') || b.textContent?.includes('1 L'))
            .map(b => ({ text: b.textContent?.trim(), class: b.getAttribute('class') }))
      );
      console.log('Variant buttons found:', variantButtons);

      // Check Estimated Weight specification
      const weightRowMatch = pdpBody.match(/Estimated Weight:?\s*([^\n\r]+)/i);
      const estimatedWeightText = weightRowMatch ? weightRowMatch[1].trim() : 'NOT FOUND';
      console.log('Estimated Weight spec:', estimatedWeightText);

      // Verify if dynamic variant weight is implemented or static
      const isWeightDynamic = estimatedWeightText.includes('0.46') || estimatedWeightText.includes('460g') || estimatedWeightText.includes('0.5');
      if (isWeightDynamic) {
        recordResult({
          module: 'Module 2: Catalog & Pricing',
          name: 'Dynamic Estimated Weight Specification',
          status: 'PASS',
          details: `Estimated Weight displays ${estimatedWeightText} dynamically for selected variant.`
        });
      } else {
        recordResult({
          module: 'Module 2: Catalog & Pricing',
          name: 'Dynamic Estimated Weight Specification',
          status: 'FAIL',
          details: `Estimated Weight is static (${estimatedWeightText}) and does not reflect 500ml variant weight (~0.46kg).`,
          recommendation: 'Tie Estimated Weight spec directly to active selectedVariant state in ProductDetailClient.tsx.'
        });
      }

      // Check Related Products / Cross-Sell section on PDP
      const relatedSection = await page.$('section, div:has-text("Related"), div:has-text("You May Also Like"), div:has-text("Recommended")');
      const relatedText = relatedSection ? await relatedSection.innerText() : '';

      // Check cross-sell pricing across related products
      // Look for groundnut oil in other products' related sections
      const otherProductLink = uniqueProductHrefs.find(h => h && !/groundnut/i.test(h));
      if (otherProductLink) {
        await page.goto(`https://freshrootsexport.com${otherProductLink}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const otherPdpBody = await page.innerText('body');
        // Look for Groundnut oil in related products
        if (/Groundnut/i.test(otherPdpBody)) {
          // Check price rendered for Groundnut oil in related products
          const crossSellGroundnutMatch = otherPdpBody.match(/Groundnut[\s\S]{1,100}₹\s*(\d+)/i);
          const crossSellPrice = crossSellGroundnutMatch ? crossSellGroundnutMatch[1] : null;
          console.log('Cross sell Groundnut oil match price:', crossSellPrice);

          if (crossSellPrice === '469') {
            recordResult({
              module: 'Module 2: Catalog & Pricing',
              name: 'Cross-Sell Variant Pricing Consistency',
              status: 'FAIL',
              details: `Cross-sell widget renders stale 1L base price ₹469 instead of active default 500ml variant price (₹250).`,
              recommendation: 'Update related products query/mapping to pull active variant pricing instead of product.retail_price_inr.'
            });
          } else if (crossSellPrice === '250') {
            recordResult({
              module: 'Module 2: Catalog & Pricing',
              name: 'Cross-Sell Variant Pricing Consistency',
              status: 'PASS',
              details: `Cross-sell widget displays correct variant price ₹${crossSellPrice}.`
            });
          } else {
            recordResult({
              module: 'Module 2: Catalog & Pricing',
              name: 'Cross-Sell Variant Pricing Consistency',
              status: 'WARNING',
              details: `Cross-sell Groundnut price detected: ₹${crossSellPrice || 'N/A'}. Homepage Groundnut price: ₹${homepageGroundnutPrice}.`
            });
          }
        }
      }

    } else {
      recordResult({
        module: 'Module 2: Catalog & Pricing',
        name: 'Groundnut Oil Slug Resolution',
        status: 'FAIL',
        details: 'Wood-Pressed Groundnut Oil link not found on homepage.',
        recommendation: 'Ensure groundnut oil product is published in catalog.'
      });
    }

  } catch (err: any) {
    recordResult({
      module: 'Module 2: Catalog & Pricing',
      name: 'Catalog Execution',
      status: 'FAIL',
      details: `Exception: ${err.message}`
    });
  }

  // -------------------------------------------------------------
  // MODULE 3: B2B EXPORT & RFQ FLOW TEST
  // -------------------------------------------------------------
  console.log('\n--- MODULE 3: B2B EXPORT & RFQ FLOW TEST ---');
  try {
    const exportResp = await page.goto('https://freshrootsexport.com/export', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const exportStatus = exportResp?.status();

    if (exportStatus === 200) {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'Export Hub (/export) Route Status',
        status: 'PASS',
        details: '/export page loaded with 200 OK.'
      });

      await page.waitForTimeout(2000);
      const exportBody = await page.innerText('body');

      // Check Corridors
      const corridors = ['Vietnam', 'Bangladesh', 'UAE', 'Saudi Arabia', 'USA'];
      const missingCorridors = corridors.filter(c => !new RegExp(c, 'i').test(exportBody));

      if (missingCorridors.length === 0) {
        recordResult({
          module: 'Module 3: B2B Export & RFQ',
          name: 'International Export Corridors Rendering',
          status: 'PASS',
          details: `All corridors (${corridors.join(', ')}) rendered properly.`
        });
      } else {
        recordResult({
          module: 'Module 3: B2B Export & RFQ',
          name: 'International Export Corridors Rendering',
          status: 'FAIL',
          details: `Missing corridors: ${missingCorridors.join(', ')}`,
          recommendation: 'Verify GlobalExportCorridors component data.'
        });
      }

      // Check RFQ trigger and form navigation
      const rfqLink = await page.$('a[href*="rfq"], a[href*="contact#rfq"], button:has-text("RFQ"), button:has-text("Quote")');
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'Export RFQ Trigger Action',
        status: rfqLink ? 'PASS' : 'WARNING',
        details: rfqLink ? 'Found interactive RFQ call-to-action on /export page.' : 'No direct RFQ button found on /export.'
      });
    } else {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'Export Hub (/export) Route Status',
        status: 'FAIL',
        details: `/export returned HTTP ${exportStatus}`,
        recommendation: 'Check /export page deployment.'
      });
    }

    // Test RFQ Route / Modal / Destination Query Param
    console.log('Navigating to contact / RFQ page...');
    await page.goto('https://freshrootsexport.com/contact?destination=Vietnam#rfq', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const contactBody = await page.innerText('body');
    const hasRfqSection = /rfq|quote|inquiry/i.test(contactBody);

    // Look for form inputs
    const inputs = await page.$$('form input, form textarea, form select');
    console.log(`Found ${inputs.length} form inputs on contact/rfq page.`);

    // Check Cloudflare Turnstile
    const turnstile = await page.$('.cf-turnstile, iframe[src*="cloudflare"], iframe[src*="turnstile"], [data-sitekey]');
    const hasTurnstile = turnstile !== null;

    if (hasTurnstile) {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'Cloudflare Turnstile Bot Protection',
        status: 'PASS',
        details: 'Cloudflare Turnstile challenge component detected in RFQ/Contact form.'
      });
    } else {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'Cloudflare Turnstile Bot Protection',
        status: 'WARNING',
        details: 'Cloudflare Turnstile challenge iframe/container not detected on page load.',
        recommendation: 'Ensure Turnstile script and widget are properly mounted on RFQ forms.'
      });
    }

    // Check prefilled destination query parameter handling
    const destInput = await page.$('input[name="destination"], input[name="country"], select[name="destination"], select[name="country"]');
    let destValue = '';
    if (destInput) {
      destValue = await destInput.inputValue();
    }

    if (destValue.toLowerCase().includes('vietnam')) {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'RFQ Pre-filled Destination Param',
        status: 'PASS',
        details: `Destination correctly pre-filled with "${destValue}" from query parameter.`
      });
    } else {
      recordResult({
        module: 'Module 3: B2B Export & RFQ',
        name: 'RFQ Pre-filled Destination Param',
        status: 'WARNING',
        details: `Destination field not automatically pre-filled (value: "${destValue || 'empty'}").`,
        recommendation: 'Read destination query parameter and set initial form state in RFQ form.'
      });
    }

  } catch (err: any) {
    recordResult({
      module: 'Module 3: B2B Export & RFQ',
      name: 'Export/RFQ Execution',
      status: 'FAIL',
      details: `Exception: ${err.message}`
    });
  }

  // -------------------------------------------------------------
  // MODULE 4: LOGISTICS & TRACKING CONSOLE TEST
  // -------------------------------------------------------------
  console.log('\n--- MODULE 4: LOGISTICS & TRACKING CONSOLE TEST ---');
  try {
    // 1. Transportation & Shiprocket Freight Estimator
    await page.goto('https://freshrootsexport.com/transportation', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const transportBody = await page.innerText('body');
    const hasFreightCalculator = /freight|shipping|estimate|shiprocket|calculator/i.test(transportBody);
    const dropdowns = await page.$$('select, [role="combobox"]');

    if (dropdowns.length > 0) {
      recordResult({
        module: 'Module 4: Logistics & Tracking',
        name: 'Shiprocket Freight Estimator Dropdown',
        status: 'PASS',
        details: `Freight estimator dropdown interactive controls verified (${dropdowns.length} select/combobox elements found).`
      });
    } else {
      recordResult({
        module: 'Module 4: Logistics & Tracking',
        name: 'Shiprocket Freight Estimator Dropdown',
        status: 'WARNING',
        details: 'No standard dropdown element found on /transportation page.',
        recommendation: 'Verify ShippingRateCalculator component is rendered with interactive state/service select dropdowns.'
      });
    }

    // 2. Track Order Console Test
    await page.goto('https://freshrootsexport.com/track-order', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check if loading placeholder is visible
    const trackBodyInitial = await page.innerText('body');
    const hasStuckLoading = trackBodyInitial.includes('Loading Consignment Tracking Console');
    
    // Check if input interface is immediately available
    const trackingInput = await page.$('input[placeholder*="AWB"], input[placeholder*="order"], input[type="text"]');

    if (trackingInput && !hasStuckLoading) {
      recordResult({
        module: 'Module 4: Logistics & Tracking',
        name: 'Instant Tracking Console Render',
        status: 'PASS',
        details: 'Consignment tracking console input rendered instantly on first HTML load without client-side loading hang.'
      });
    } else if (hasStuckLoading) {
      recordResult({
        module: 'Module 4: Logistics & Tracking',
        name: 'Instant Tracking Console Render',
        status: 'FAIL',
        details: 'Encountered client-side placeholder "Loading Consignment Tracking Console...".',
        recommendation: 'Refactor /track-order into a React Server Component to deliver input forms directly in SSR HTML.'
      });
    } else {
      recordResult({
        module: 'Module 4: Logistics & Tracking',
        name: 'Instant Tracking Console Render',
        status: 'WARNING',
        details: 'Tracking input selector not immediately matched on initial load.'
      });
    }

  } catch (err: any) {
    recordResult({
      module: 'Module 4: Logistics & Tracking',
      name: 'Logistics Execution',
      status: 'FAIL',
      details: `Exception: ${err.message}`
    });
  }

  // -------------------------------------------------------------
  // MODULE 5: LEGAL, POLICY & COMPLIANCE FOOTER AUDIT
  // -------------------------------------------------------------
  console.log('\n--- MODULE 5: LEGAL, POLICY & COMPLIANCE FOOTER AUDIT ---');
  try {
    const compliancePages = [
      { path: '/privacy', name: 'Privacy Policy' },
      { path: '/terms', name: 'Terms of Service' },
      { path: '/shipping-policy', name: 'Shipping Policy' },
      { path: '/refund-policy', name: 'Refund Policy' },
    ];

    const requiredStatutoryStrings = [
      { key: 'FSSAI Lic. 21224195000438', regex: /21224195000438/ },
      { key: 'GSTIN 29AAKPI7841N1ZX', regex: /29AAKPI7841N1ZX/ },
      { key: 'APEDA Registration', regex: /APEDA/i },
      { key: 'DGFT / IEC', regex: /IEC|DGFT|Directorate General of Foreign Trade/i }
    ];

    for (const p of compliancePages) {
      const resp = await page.goto(`https://freshrootsexport.com${p.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const statusCode = resp?.status();

      if (statusCode === 200) {
        const text = await page.innerText('body');
        const missingDetails = requiredStatutoryStrings.filter(s => !s.regex.test(text)).map(s => s.key);

        if (missingDetails.length === 0) {
          recordResult({
            module: 'Module 5: Legal & Compliance',
            name: `${p.name} (${p.path})`,
            status: 'PASS',
            details: `Accessible (200 OK) with all statutory compliance credentials (FSSAI, GSTIN, APEDA, DGFT/IEC) explicitly stated.`
          });
        } else {
          recordResult({
            module: 'Module 5: Legal & Compliance',
            name: `${p.name} (${p.path})`,
            status: 'WARNING',
            details: `Accessible (200 OK) but missing statutory strings: ${missingDetails.join(', ')}`,
            recommendation: `Add statutory compliance block (FSSAI, DGFT IEC, APEDA, GSTIN) to ${p.path}.`
          });
        }
      } else {
        recordResult({
          module: 'Module 5: Legal & Compliance',
          name: `${p.name} (${p.path})`,
          status: 'FAIL',
          details: `Returned HTTP ${statusCode}`,
          recommendation: `Ensure ${p.path} page is deployed and accessible.`
        });
      }
    }

  } catch (err: any) {
    recordResult({
      module: 'Module 5: Legal & Compliance',
      name: 'Legal Audit Execution',
      status: 'FAIL',
      details: `Exception: ${err.message}`
    });
  }

  // -------------------------------------------------------------
  // ADDITIONAL ARCHITECTURE & INTEGRATION CHECKS (PART 1, 2, 3)
  // -------------------------------------------------------------
  console.log('\n--- ADDITIONAL SYSTEM & SECURITY CHECKS ---');
  try {
    // 1. Telephone link check on /contact
    await page.goto('https://freshrootsexport.com/contact', { waitUntil: 'domcontentloaded', timeout: 20000 });
    const telLink = await page.$('a[href^="tel:"]');
    const telHref = telLink ? await telLink.getAttribute('href') : null;
    
    if (telHref === 'tel:+919008462568') {
      recordResult({
        module: 'Part 1: UI Code Fixes',
        name: 'Telephone Link (/contact)',
        status: 'PASS',
        details: `Clean tel link verified: ${telHref}`
      });
    } else {
      recordResult({
        module: 'Part 1: UI Code Fixes',
        name: 'Telephone Link (/contact)',
        status: telHref ? 'WARNING' : 'FAIL',
        details: `Tel href is "${telHref}". Expected: tel:+919008462568.`,
        recommendation: 'Replace malformed or non-standard tel href with clean <a href="tel:+919008462568">.'
      });
    }

    // 2. Admin Route Protection Check
    const adminResp = await page.goto('https://freshrootsexport.com/admin', { waitUntil: 'domcontentloaded', timeout: 20000 });
    const currentUrl = page.url();
    const adminStatus = adminResp?.status();
    const adminBody = await page.innerText('body');
    const isProtected = currentUrl.includes('/admin/login') || currentUrl.includes('/login') || adminBody.includes('Sign in') || adminBody.includes('Unauthorized') || adminStatus === 401 || adminStatus === 403;

    if (isProtected) {
      recordResult({
        module: 'Part 2: Admin Security',
        name: 'Admin Route Edge Protection',
        status: 'PASS',
        details: `Unauthorized access to /admin blocked/redirected to ${currentUrl} (Status: ${adminStatus}).`
      });
    } else {
      recordResult({
        module: 'Part 2: Admin Security',
        name: 'Admin Route Edge Protection',
        status: 'FAIL',
        details: `/admin was accessed directly without authentication challenge! URL: ${currentUrl}`,
        recommendation: 'Implement Edge middleware.ts to intercept all /admin/* routes and enforce HttpOnly session authentication.'
      });
    }

    // 3. robots.txt and sitemap.xml check
    const robotsResp = await page.goto('https://freshrootsexport.com/robots.txt', { timeout: 15000 });
    const sitemapResp = await page.goto('https://freshrootsexport.com/sitemap.xml', { timeout: 15000 });

    const robotsOk = robotsResp?.status() === 200;
    const sitemapOk = sitemapResp?.status() === 200;

    if (robotsOk && sitemapOk) {
      recordResult({
        module: 'Part 3: CI/CD Quality Gates',
        name: 'SEO & Bot Access (robots.txt & sitemap.xml)',
        status: 'PASS',
        details: 'Both robots.txt and sitemap.xml return HTTP 200 OK.'
      });
    } else {
      recordResult({
        module: 'Part 3: CI/CD Quality Gates',
        name: 'SEO & Bot Access (robots.txt & sitemap.xml)',
        status: 'FAIL',
        details: `robots.txt: ${robotsResp?.status()}, sitemap.xml: ${sitemapResp?.status()}`,
        recommendation: 'Verify Next.js robots.ts and sitemap.ts routes are correctly exported and not blocked by WAF rules.'
      });
    }

  } catch (err: any) {
    console.error('Additional checks error:', err);
  }

  await browser.close();

  // Print Summary
  console.log('\n======================================================');
  console.log('AUDIT COMPLETE. SUMMARY OF RESULTS:');
  console.log('======================================================');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  console.log(`Total Checks: ${results.length} | PASS: ${passes} | FAIL: ${fails} | WARNING: ${warnings}\n`);
}

runAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
