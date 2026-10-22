import { MetadataRoute } from 'next';

const PRODUCT_SLUGS = [
  'fresh-semi-husked-mature-coconuts-25-piece',
  'pure-karnataka-ragi-millet-5kg',
  'fresh-farm-tender-coconuts-bulk',
  'high-yield-coconut-plants-1-year-2-feet',
  'pure-wood-pressed-groundnut-oil-1l',
  'farm-fresh-pure-desi-cow-ghee-1l',
  'tiptur-ball-copra-boxes-15kg',
  'high-yield-arecanut-plants-1-foot',
  'raw-coconut-shells-industrial-bulk-ton',
  'fresh-farm-ginger-50kg-bulk'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sharathinorahalli.com';

  const productUrls: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/transportation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    }
  ];

  return [...staticUrls, ...productUrls];
}
