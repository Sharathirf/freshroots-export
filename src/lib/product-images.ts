const TENDER_COCONUT_IMAGE =
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80';

/** Corrects legacy catalog rows that still point tender coconuts at an incorrect photo. */
export function getProductImageUrl(sku: string, storedImageUrl: string): string {
  if (sku === 'COC-TND-BLK-LOT') return TENDER_COCONUT_IMAGE;
  return storedImageUrl;
}
