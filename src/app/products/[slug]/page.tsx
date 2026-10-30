import type { Metadata } from 'next';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getCatalogProductBySlug, getAllCatalogProducts } from '@/lib/catalog';
import { getCategoryById } from '@/lib/categories';
import {
  generateProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateProductFAQJsonLd,
  getSiteUrl
} from '@/lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllCatalogProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);

  if (!product) {
    return {
      title: 'Agricultural Commodity | FreshRoots Export',
      description: 'Explore farm-direct agricultural commodities, GI copra, coconuts, and nursery saplings from Karnataka, India.',
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);
  const allProducts = getAllCatalogProducts();
  const siteUrl = getSiteUrl();

  const productJsonLd = product ? generateProductJsonLd(product, siteUrl) : null;
  const productFaqJsonLd = product ? generateProductFAQJsonLd(product) : null;

  const categoryDef = product ? getCategoryById(product.category) : null;
  const categoryTitle = categoryDef ? categoryDef.title : 'Agricultural Produce';
  const categorySlug = categoryDef ? categoryDef.slug : 'mature-coconut';

  const breadcrumbs = product
    ? [
        { name: 'Home', url: '/' },
        { name: categoryTitle, url: `/category/${categorySlug}` },
        { name: product.title, url: `/products/${product.slug}` }
      ]
    : null;
  const breadcrumbJsonLd = breadcrumbs ? generateBreadcrumbJsonLd(breadcrumbs, siteUrl) : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {productFaqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetailClient
        initialProduct={product}
        allProducts={allProducts}
        slug={slug}
      />
    </>
  );
}
