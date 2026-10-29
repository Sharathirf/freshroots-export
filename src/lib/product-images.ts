const TENDER_COCONUT_IMAGE = '/products/tender-coconuts-4k.jpg';

/** Maps SKU patterns to local 4K product images. Falls back to stored image if no match. */
export function getProductImageUrl(sku: string, storedImageUrl?: string): string {
  if (sku === 'COC-TND-BLK-LOT') return TENDER_COCONUT_IMAGE;
  if (!storedImageUrl || storedImageUrl.startsWith('http') || storedImageUrl.includes('unsplash')) {
    return resolveProductImageBySku(sku);
  }
  return storedImageUrl;
}

/** Resolves a SKU to its local 4K product image path for order tracking & cart displays. */
export function resolveProductImageBySku(sku?: string): string {
  if (!sku) return '/products/mature-coconuts-4k.jpg';
  const s = sku.toUpperCase();
  if (s.includes('ARE-BLK') || s.includes('ADK')) return '/products/arecanut-adike-4k.jpg';
  if (s.includes('NUR-ARE') || s.includes('ARE')) return '/products/arecanut-saplings-4k.jpg';
  if (s.includes('COC-SEMI') || s.includes('COC-MAT')) return '/products/mature-coconuts-4k.jpg';
  if (s.includes('COP') || s.includes('BAL')) return '/products/ball-copra-4k.jpg';
  if (s.includes('NUR-COC')) return '/products/coconut-saplings-4k.jpg';
  if (s.includes('OIL') || s.includes('GNT') || s.includes('GND')) return '/products/groundnut-oil-4k.jpg';
  if (s.includes('FLR-RAG') || s.includes('RAG-FLR')) return '/products/ragi-flour-4k.jpg';
  if (s.includes('FLR-RIC') || s.includes('RIC-FLR')) return '/products/rice-flour-4k.jpg';
  if (s.includes('MIL') || s.includes('RAG')) return '/products/ragi-millet-4k.jpg';
  if (s.includes('GHE') || s.includes('COW') || s.includes('DAI')) return '/products/cow-ghee-4k.jpg';
  if (s.includes('TND')) return '/products/tender-coconuts-4k.jpg';
  if (s.includes('GIN')) return '/products/ginger-4k.jpg';
  if (s.includes('SHL')) return '/products/coconut-shells-4k.jpg';
  return '/products/mature-coconuts-4k.jpg';
}
