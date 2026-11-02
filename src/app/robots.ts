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

  // Production: Allow public catalog and optimize for search engines & AI crawlers
  const publicDisallowed = [
    '/admin',
    '/api/',
    '/track-order',
    '/*?*query=*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: publicDisallowed,
      },
      // AI Search Engine Crawlers (ChatGPT, Perplexity, Claude, Google Gemini)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
        ],
        allow: [
          '/',
          '/products',
          '/products/*',
          '/category/*',
          '/export',
          '/export/*',
          '/wholesale/*',
          '/guides',
          '/guides/*',
        ],
        disallow: [
          '/admin',
          '/api/',
          '/track-order',
        ],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/feed/google-shopping`,
    ],
    host: siteUrl,
  };
}
