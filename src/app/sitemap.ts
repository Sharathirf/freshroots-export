import { MetadataRoute } from 'next';
import { CATALOG_PRODUCTS } from '@/lib/catalog';
import { CATEGORIES } from '@/lib/categories';
import { EDUCATIONAL_GUIDES } from '@/lib/guides';
import { EXPORT_COUNTRIES, getCountrySlug } from '@/lib/export-countries';
import { getSiteUrl, isProductionEnvironment } from '@/lib/seo';

// Verified catalog update timestamp (strictly aligned with live release)
const CATALOG_LAST_MODIFIED = new Date('2026-10-30T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  // Safeguard: In non-production environments (UAT, staging, preview, dev), return an empty sitemap.
  if (!isProductionEnvironment()) {
    return [];
  }

  const baseUrl = getSiteUrl();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${baseUrl}/products/mature-coconuts-4k.jpg`, `${baseUrl}/products/ball-copra-4k.jpg`],
    },
    {
      url: `${baseUrl}/export`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/export/ball-copra-india`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
      images: [`${baseUrl}/products/ball-copra-4k.jpg`],
    },
    {
      url: `${baseUrl}/wholesale/mandi-rates`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/transportation`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: CATALOG_LAST_MODIFIED,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const productUrls: MetadataRoute.Sitemap = CATALOG_PRODUCTS.map((prod) => {
    const fullImageUrl = prod.image_url.startsWith('http') ? prod.image_url : `${baseUrl}${prod.image_url}`;
    return {
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: prod.created_at ? new Date(prod.created_at) : CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
      images: [fullImageUrl],
    };
  });

  const guideUrls: MetadataRoute.Sitemap = EDUCATIONAL_GUIDES.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const corridorUrls: MetadataRoute.Sitemap = EXPORT_COUNTRIES.map((c) => ({
    url: `${baseUrl}/export/corridors/${getCountrySlug(c.name)}`,
    lastModified: CATALOG_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls, ...guideUrls, ...corridorUrls];
}
