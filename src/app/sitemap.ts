import { MetadataRoute } from 'next';
import { CATALOG_PRODUCTS } from '@/lib/catalog';
import { CATEGORIES } from '@/lib/categories';
import { EDUCATIONAL_GUIDES } from '@/lib/guides';
import { getSiteUrl, isProductionEnvironment } from '@/lib/seo';

// Verified catalog update timestamp (avoids artificial freshness dates)
const CATALOG_LAST_MODIFIED = new Date('2026-10-26T00:00:00.000Z');

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
    },
    {
      url: `${baseUrl}/export`,
      lastModified: CATALOG_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
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
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const productUrls: MetadataRoute.Sitemap = CATALOG_PRODUCTS.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: prod.created_at ? new Date(prod.created_at) : CATALOG_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const guideUrls: MetadataRoute.Sitemap = EDUCATIONAL_GUIDES.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls, ...guideUrls];
}
