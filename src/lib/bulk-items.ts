export interface BulkOrderItemMeta {
  order: number;
  simpleName: string;
  cleanName: string;
  skuMatch: string;
}

export const BULK_ORDER_ITEMS: BulkOrderItemMeta[] = [
  {
    order: 1,
    simpleName: '1. Tender Coconut (Bulk Order Lot)',
    cleanName: 'Tender Coconut (Bulk Order Lot)',
    skuMatch: 'COC-TND-BLK-LOT'
  },
  {
    order: 2,
    simpleName: '2. Arecanut Plants (1–1.5 Feet Height)',
    cleanName: 'Arecanut Plants (1–1.5 Feet Height)',
    skuMatch: 'NUR-ARE-PLT-01Y'
  },
  {
    order: 3,
    simpleName: '3. Coconut Plants (1 Year Old, 2 Feet Height)',
    cleanName: 'Coconut Plants (1 Year Old, 2 Feet Height)',
    skuMatch: 'NUR-COC-PLT-01Y'
  },
  {
    order: 4,
    simpleName: '4. Ragi Millet (5 kg, 10 kg, 25 kg Packs)',
    cleanName: 'Ragi Millet (5 kg, 10 kg, 25 kg Packs)',
    skuMatch: 'MIL-RAG-ORG-05K'
  },
  {
    order: 5,
    simpleName: '5. Groundnut Oil (Wood-Pressed, Cold-Pressed)',
    cleanName: 'Groundnut Oil (Wood-Pressed, Cold-Pressed)',
    skuMatch: 'OIL-GND-WOD-01L'
  },
  {
    order: 6,
    simpleName: '6. Cow Ghee (Traditional Bilona, 1 Litre)',
    cleanName: 'Cow Ghee (Traditional Bilona, 1 Litre)',
    skuMatch: 'DAI-GHE-BIL-01L'
  },
  {
    order: 7,
    simpleName: '7. Mature Coconuts (25-Piece Bag, ~15 kg)',
    cleanName: 'Mature Coconuts (25-Piece Bag, ~15 kg)',
    skuMatch: 'COC-SEMI-25P-15K'
  },
  {
    order: 8,
    simpleName: '8. Ball Copra (15 kg, 25 kg, 30 kg Boxes)',
    cleanName: 'Ball Copra (15 kg, 25 kg, 30 kg Boxes)',
    skuMatch: 'COP-BAL-BOX-15K'
  },
  {
    order: 9,
    simpleName: '9. Fresh Ginger (50 kg Bulk Gunny Bag)',
    cleanName: 'Fresh Ginger (50 kg Bulk Gunny Bag)',
    skuMatch: 'SPI-GIN-BLK-50K'
  },
  {
    order: 10,
    simpleName: '10. Coconut Shells (Industrial Grade, Metric Tonne)',
    cleanName: 'Coconut Shells (Industrial Grade, Metric Tonne)',
    skuMatch: 'COI-SHL-BLK-01T'
  },
  {
    order: 11,
    simpleName: '11. Arecanut (Adike) — Bulk Commodity Lot',
    cleanName: 'Arecanut (Adike) — Bulk Commodity Lot',
    skuMatch: 'ARE-BLK-ADK-01Q'
  }
];

export function getBulkOrderItemMeta(item?: {
  sku?: string;
  slug?: string;
  title?: string;
}): BulkOrderItemMeta | undefined {
  if (!item) return undefined;
  const sku = (item.sku || '').toUpperCase();
  const slug = (item.slug || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  // Bulk arecanut commodity is distinct from arecanut nursery plants.
  if (sku.includes('ARE-BLK') || sku.includes('ADK')) {
    return BULK_ORDER_ITEMS[10];
  }

  // 1. Tender Coconut
  if (sku.includes('TND') || slug.includes('tender') || title.includes('tender')) {
    return BULK_ORDER_ITEMS[0];
  }
  // 2. Arecanut Plants
  if (
    (sku.includes('ARE') && sku.includes('PLT')) ||
    slug.includes('arecanut') && (slug.includes('plant') || slug.includes('sapling')) ||
    title.includes('arecanut') && (title.includes('plant') || title.includes('sapling'))
  ) {
    return BULK_ORDER_ITEMS[1];
  }
  // 3. Coconut Plants
  if (
    (sku.includes('COC') && sku.includes('PLT')) ||
    slug.includes('coconut-plant') ||
    title.includes('coconut plant') ||
    title.includes('coconut sapling')
  ) {
    return BULK_ORDER_ITEMS[2];
  }
  // 4. Ragi Millet
  if (sku.includes('RAG') || slug.includes('ragi') || title.includes('ragi')) {
    return BULK_ORDER_ITEMS[3];
  }
  // 5. Groundnut Oil
  if (
    sku.includes('GND') ||
    slug.includes('groundnut') ||
    title.includes('groundnut') ||
    (sku.includes('OIL') && !title.includes('virgin'))
  ) {
    return BULK_ORDER_ITEMS[4];
  }
  // 6. Cow Ghee
  if (sku.includes('GHE') || slug.includes('ghee') || title.includes('ghee')) {
    return BULK_ORDER_ITEMS[5];
  }
  // 7. Mature Coconuts
  if (
    sku.includes('MAT') ||
    sku.includes('SEMI') ||
    slug.includes('mature') ||
    slug.includes('semi-husked') ||
    (title.includes('mature') && !title.includes('tender'))
  ) {
    return BULK_ORDER_ITEMS[6];
  }
  // 8. Ball Copra
  if (sku.includes('COP') || sku.includes('BAL') || slug.includes('copra') || title.includes('copra')) {
    return BULK_ORDER_ITEMS[7];
  }
  // 9. Fresh Ginger
  if (sku.includes('GIN') || slug.includes('ginger') || title.includes('ginger')) {
    return BULK_ORDER_ITEMS[8];
  }
  // 10. Coconut Shells
  if (sku.includes('SHL') || slug.includes('shell') || title.includes('shell')) {
    return BULK_ORDER_ITEMS[9];
  }

  return undefined;
}

export function getBulkOrderDisplayName(item?: {
  sku?: string;
  slug?: string;
  title?: string;
}): string {
  const meta = getBulkOrderItemMeta(item);
  if (meta) {
    return meta.simpleName;
  }
  return item?.title || 'Farm Commodity';
}

export function getBulkOrderCleanName(item?: {
  sku?: string;
  slug?: string;
  title?: string;
}): string {
  const meta = getBulkOrderItemMeta(item);
  if (meta) {
    return meta.cleanName;
  }
  return item?.title || 'Farm Commodity';
}

export function sortProductsByBulkOrder<T extends { sku?: string; slug?: string; title?: string }>(
  products: T[]
): T[] {
  return [...products].sort((a, b) => {
    const orderA = getBulkOrderItemMeta(a)?.order ?? 99;
    const orderB = getBulkOrderItemMeta(b)?.order ?? 99;
    return orderA - orderB;
  });
}
