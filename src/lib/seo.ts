import { Metadata } from 'next';
import { CatalogProductItem } from './catalog';

export function isProductionEnvironment(): boolean {
  if (process.env.APP_ENV === 'uat' || process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'development') {
    return false;
  }
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
    return false;
  }
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && configured.trim().length > 0) {
    return configured.trim().replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  return 'https://freshrootsexport.com';
}

export function getRobotsDirectives(allowIndexing = true): Metadata['robots'] {
  const isProd = isProductionEnvironment();
  if (!isProd || !allowIndexing) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

export function generateOrganizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'FreshRoots Export',
    alternateName: ['FreshRoots', 'FreshRoots Karnataka'],
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: 'Farm-direct agricultural commerce platform supplying hand-graded mature coconuts, GI Tiptur ball copra, spices, cold-pressed oils, and nursery saplings from Karnataka, India.',
    telephone: '+919591142548',
    email: 'sharathir198@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kikkeri, K.R. Pet Taluk, Mandya District',
      addressRegion: 'Karnataka',
      postalCode: '571423',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 12.8344,
      longitude: 76.4022
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'Vietnam' },
      { '@type': 'Country', name: 'Bangladesh' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'Nepal' },
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'Cambodia' },
      { '@type': 'Country', name: 'Qatar' },
      { '@type': 'Country', name: 'Malaysia' },
      { '@type': 'Country', name: 'Kuwait' },
      { '@type': 'Country', name: 'Iran' },
      { '@type': 'Country', name: 'United Kingdom' }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+919591142548',
        contactType: 'customer service',
        availableLanguage: ['English', 'Kannada'],
        areaServed: 'IN'
      },
      {
        '@type': 'ContactPoint',
        telephone: '+919591142548',
        contactType: 'sales',
        availableLanguage: ['English', 'Kannada'],
        areaServed: ['IN', 'AE', 'VN', 'BD', 'US', 'SA', 'MY', 'GB']
      }
    ]
  };
}

export function generateWebSiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'FreshRoots Export',
    description: 'Farm-Gate Agricultural Commodities from Karnataka',
    publisher: {
      '@id': `${siteUrl}/#organization`
    },
    inLanguage: ['en-IN', 'kn-IN']
  };
}

export function generateProductJsonLd(product: CatalogProductItem, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const price = Number(product.retail_price_inr);
  const inStock = (product.available_stock || 0) > 0;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    image: [product.image_url],
    description: product.description,
    sku: product.sku,
    category: product.category.replace(/_/g, ' '),
    brand: {
      '@type': 'Brand',
      name: 'FreshRoots Export'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: {
        '@id': `${siteUrl}/#organization`
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 4,
            unitCode: 'DAY'
          }
        }
      }
    }
  };

  if (product.review_count && product.review_count > 0 && product.average_rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.review_count,
      bestRating: 5,
      worstRating: 1
    };
  }

  return schema;
}

export function generateArticleJsonLd(
  article: {
    title: string;
    description: string;
    slug: string;
    publishedAt: string;
    updatedAt: string;
    authorName?: string;
  },
  siteUrl: string
) {
  const articleUrl = `${siteUrl}/guides/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title,
    description: article.description,
    url: articleUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: article.authorName || 'FreshRoots Agronomy Research Desk',
      url: siteUrl,
    },
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    inLanguage: 'en-IN',
  };
}

export function generateItemListJsonLd(
  name: string,
  items: Array<{ name: string; url: string; image?: string; price?: number }>,
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function generateFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbJsonLd(
  crumbs: Array<{ name: string; url: string }>,
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`
    }))
  };
}

export function generateProductMetadata(product: CatalogProductItem): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/products/${product.slug}`;

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    keywords: product.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: getRobotsDirectives(true),
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      url: canonicalUrl,
      siteName: 'FreshRoots Export',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle,
      description: product.seoDescription,
      images: [product.image_url],
    },
  };
}
