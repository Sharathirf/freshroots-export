import { NextResponse } from 'next/server';
import { getAllCatalogProducts } from '@/lib/catalog';
import { getSiteUrl } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Google Merchant Center RSS 2.0 / XML Product Feed
 * Standardized schema allowing 100% free organic product listings on Google Shopping & Search.
 * Spec: https://support.google.com/merchants/answer/160589
 */
export async function GET() {
  const siteUrl = getSiteUrl();
  const products = getAllCatalogProducts();

  const xmlItems = products
    .filter((p) => p.is_active && (p.retail_price_inr || 0) > 0)
    .map((p) => {
      const price = Number(p.retail_price_inr || 0).toFixed(2);
      const link = `${siteUrl}/products/${p.slug}`;
      const img = p.image_url?.startsWith('http') ? p.image_url : `${siteUrl}${p.image_url || '/products/mature-coconuts-4k.jpg'}`;
      const inStock = (p.available_stock || 0) > 0;
      const cleanDesc = (p.description || p.seoDescription || '')
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .trim();

      return `
    <item>
      <g:id>${escapeXml(p.sku || p.id)}</g:id>
      <g:title><![CDATA[${p.title}]]></g:title>
      <g:description><![CDATA[${cleanDesc}]]></g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(img)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>FreshRoots Export</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Direct Farm Express Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Fresh Produce</g:google_product_category>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>FreshRoots Export | Direct-From-Farm Produce &amp; Agro Commodities</title>
    <link>${siteUrl}</link>
    <description>Direct farm-gate supply of GI-Tagged Tiptur Ball Copra, Mature Coconuts, Shivamogga Arecanut, Wood-Pressed Oils, and Pure Bilona Cow Ghee from Mandya, Karnataka.</description>
    ${xmlItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
