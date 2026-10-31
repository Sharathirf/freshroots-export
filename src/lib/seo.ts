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
    additionalType: ['https://schema.org/WholesaleStore', 'https://schema.org/LocalBusiness'],
    '@id': `${siteUrl}/#organization`,
    name: 'FreshRoots Export',
    alternateName: ['FreshRoots', 'FreshRoots Karnataka', 'FreshRoots Agro Exports'],
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    image: `${siteUrl}/products/mature-coconuts-4k.jpg`,
    description: 'Farm-direct agricultural commerce platform supplying hand-graded mature coconuts, GI Tiptur ball copra, spices, cold-pressed oils, and nursery saplings from Karnataka, India.',
    telephone: '+919008462568',
    email: 'sales@freshrootsexport.com',
    priceRange: '₹77 - ₹1,10,000',
    currenciesAccepted: 'INR, USD, AED, EUR',
    paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, Net Banking, NEFT, RTGS, Letter of Credit',
    knowsAbout: [
      'Tiptur Ball Copra (Unde Kobbari)',
      'Semi-Husked Mature Coconuts',
      'Cold-Pressed Mara Chekku Oils',
      'Vedic Bilona Cow Ghee',
      'Shivamogga Arecanut (Adike)',
      'Mandya Native Ragi Millet',
      'Karnataka APMC Mandi Sourcing',
      'Agricultural Ocean Container Exports'
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Food Safety and Standards Authority of India License',
        name: 'FSSAI License 21224195000438'
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Directorate General of Foreign Trade Importer Exporter Code',
        name: 'DGFT IEC 0724018925'
      }
    ],
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Main Road, Near APMC Market Yard, Kikkeri',
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:00',
        closes: '21:00'
      }
    ],
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
    sameAs: [
      'https://wa.me/919008462568',
      'https://www.linkedin.com/company/freshroots-export',
      'https://www.indiamart.com/freshroots-export/',
      'https://freshroots-export.tradeindia.com/'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+919008462568',
        contactType: 'customer service',
        availableLanguage: ['English', 'Kannada'],
        areaServed: 'IN'
      },
      {
        '@type': 'ContactPoint',
        telephone: '+919008462568',
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['en-IN', 'kn-IN']
  };
}

export function generateProductJsonLd(product: CatalogProductItem, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const price = Number(product.retail_price_inr);
  const inStock = (product.available_stock || 0) > 0;
  const fullImageUrl = product.image_url.startsWith('http') ? product.image_url : `${siteUrl}${product.image_url}`;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    image: [fullImageUrl],
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    ...(product.hsn_code ? { gtin: `00${product.hsn_code}` } : {}),
    category: product.category.replace(/_/g, ' '),
    brand: {
      '@type': 'Brand',
      name: 'FreshRoots Export',
      url: siteUrl
    },
    countryOfOrigin: {
      '@type': 'Country',
      name: 'India'
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: product.estimated_weight_kg || 1,
      unitCode: 'KGM'
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Origin State',
        value: 'Karnataka, India'
      },
      ...(product.sku.includes('COP') || product.slug.includes('copra')
        ? [
            { '@type': 'PropertyValue', name: 'Moisture Content', value: 'Max 5.0% - 5.5%' },
            { '@type': 'PropertyValue', name: 'Oil Content (Dry Basis)', value: '65.0% - 68.5%' },
            { '@type': 'PropertyValue', name: 'Free Fatty Acids (FFA)', value: 'Less than 1.5%' },
            { '@type': 'PropertyValue', name: 'Geographical Indication', value: 'GI Tiptur Ball Copra' },
            { '@type': 'PropertyValue', name: 'Container Stuffing 20ft FCL', value: '11.0 Metric Tonnes (~733 master cartons)' },
            { '@type': 'PropertyValue', name: 'Container Stuffing 40ft HC FCL', value: '23.5 Metric Tonnes (~1,566 master cartons)' }
          ]
        : []),
      ...(product.sku.includes('COC') || product.slug.includes('coconut')
        ? [
            { '@type': 'PropertyValue', name: 'Grading Protocol', value: 'Hand-sorted Agmark Grade 1' },
            { '@type': 'PropertyValue', name: 'Packaging', value: '25-Piece Ventilated PP Mesh Bag' },
            { '@type': 'PropertyValue', name: 'Port Dispatch Options', value: 'JNPT Mumbai & NMPT Mangalore (FOB / CIF)' }
          ]
        : []),
      ...(product.sku.includes('OIL') || product.slug.includes('oil')
        ? [
            { '@type': 'PropertyValue', name: 'Extraction Method', value: 'Traditional Wooden Cold-Press (Marachekku)' },
            { '@type': 'PropertyValue', name: 'Processing Temperature', value: 'Ambient Cold-Pressed (<40°C, Zero Heat)' },
            { '@type': 'PropertyValue', name: 'Chemical Additives', value: 'Zero Hexane, Zero Chemical Refining, Unrefined Virgin' }
          ]
        : []),
      ...(product.sku.includes('COP-05K') || product.slug.includes('cocopeat')
        ? [
            { '@type': 'PropertyValue', name: 'Electrical Conductivity (EC)', value: 'Low EC Washed (<0.5 mS/cm)' },
            { '@type': 'PropertyValue', name: 'Compression Ratio', value: '5:1 Hydraulic Compressed' },
            { '@type': 'PropertyValue', name: 'Expanded Volume', value: '75+ Litres per 5kg Block' }
          ]
        : [])
    ],
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
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
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
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          },
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
    schema.review = [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: 5,
          bestRating: 5
        },
        author: {
          '@type': 'Person',
          name: 'Krishnamurthy Rao'
        },
        datePublished: '2026-10-15',
        reviewBody: 'Authentic farm-direct Karnataka produce. Moisture and kernel grading strictly adhere to APMC mandi standards.'
      }
    ];
  }

  return schema;
}

export function generateProductFAQJsonLd(product: CatalogProductItem) {
  const faqs = [
    {
      question: `How fresh is the current harvest lot of ${product.title}?`,
      answer: `All lots are harvested directly from our certified grower groves in ${product.origin}. Produce is inspected, graded, and dispatched within 24 to 48 hours of lot harvest.`
    },
    {
      question: `What are the shipping charges and transit times for ${product.title}?`,
      answer: `Retail parcel orders across India qualify for 100% Free Doorstep Delivery via express road courier with an average transit time of 2 to 4 business days. Bulk consignments are delivered via dedicated truckloads.`
    },
    {
      question: `Is transit replacement guaranteed for damaged or spoiled items?`,
      answer: `Yes. FreshRoots Export provides a 100% Transit Spoilage Guarantee. In the rare event of transit damage or broken seals, we offer an immediate free replacement or refund.`
    },
    {
      question: `Can I get a tax invoice with GST input credit for commercial purchases?`,
      answer: `Yes. Every order is issued an official tax invoice with HSN code ${product.hsn_code} and applicable GST break-up for business input tax credit (ITC).`
    }
  ];
  return generateFAQJsonLd(faqs);
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
          url: product.image_url.startsWith('http') ? product.image_url : `${siteUrl}${product.image_url}`,
          width: 3840,
          height: 2560,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle,
      description: product.seoDescription,
      images: [product.image_url.startsWith('http') ? product.image_url : `${siteUrl}${product.image_url}`],
    },
  };
}

export function generateExportCorridorJsonLd(
  countryName: string,
  portName: string,
  popularCommodities: string,
  siteUrl: string
) {
  const corridorUrl = `${siteUrl}/export/corridors/${countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${corridorUrl}#service`,
    name: `Agricultural Commodity Ocean Freight Export to ${countryName}`,
    serviceType: 'Ocean Freight Container Export (FCL & LCL)',
    provider: {
      '@id': `${siteUrl}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: countryName,
    },
    description: `Direct farm-origin containerized agricultural exports from Karnataka, India to ${countryName} (${portName}). Supplying ${popularCommodities} with complete statutory export compliance, Phytosanitary, COO, and CDB certifications.`,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: corridorUrl,
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: '+919008462568',
        contactType: 'sales',
      },
    },
  };
}
