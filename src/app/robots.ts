import { MetadataRoute } from 'next';
import { getSiteUrl, isProductionEnvironment } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const isProd = isProductionEnvironment();
  const siteUrl = getSiteUrl();

  // Safeguard: strictly disallow indexing on non-production (development, staging, UAT, preview)
  if (!isProd) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  // Production: Allow public catalog, block private dashboards, internal APIs, and order queries
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/track-order',
          '/*?*query=*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
