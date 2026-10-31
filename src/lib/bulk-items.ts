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
  },
  {
    order: 12,
    simpleName: '12. Ragi Flour (Mandya Stone-Ground 5 kg Bag)',
    cleanName: 'Ragi Flour (Mandya Stone-Ground 5 kg Bag)',
    skuMatch: 'FLR-RAG-STN-05K'
  },
  {
    order: 13,
    simpleName: '13. Rice Flour (Pure Stone-Ground 5 kg Bag)',
    cleanName: 'Rice Flour (Pure Stone-Ground 5 kg Bag)',
    skuMatch: 'FLR-RIC-STN-05K'
  },
  {
    order: 14,
    simpleName: '14. Coconut Oil (Wood-Pressed, Cold-Pressed)',
    cleanName: 'Coconut Oil (Wood-Pressed, Cold-Pressed)',
    skuMatch: 'OIL-COC-WOD-01L'
  },
  {
    order: 15,
    simpleName: '15. Coconut Shell Charcoal (Kiln-Carbonized, Bulk Metric Ton)',
    cleanName: 'Coconut Shell Charcoal (Kiln-Carbonized, Bulk Metric Ton)',
    skuMatch: 'COI-CHR-BLK-01T'
  },
  {
    order: 16,
    simpleName: '16. Cocopeat 5 kg Blocks (Low EC & High EC Pallets / Containers)',
    cleanName: 'Cocopeat 5 kg Blocks (Low EC & High EC Pallets / Containers)',
    skuMatch: 'COI-COP-05K'
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
  // 12. Ragi Flour
  if (
    sku.includes('FLR-RAG') ||
    sku.includes('RAG-FLR') ||
    slug.includes('ragi-flour') ||
    title.includes('ragi flour') ||
    title.includes('ragi hittu')
  ) {
    return BULK_ORDER_ITEMS[11];
  }
  // 13. Rice Flour
  if (
    sku.includes('FLR-RIC') ||
    sku.includes('RIC-FLR') ||
    slug.includes('rice-flour') ||
    title.includes('rice flour') ||
    title.includes('akki hittu')
  ) {
    return BULK_ORDER_ITEMS[12];
  }
  // 4. Ragi Millet
  if (sku.includes('RAG') || slug.includes('ragi') || title.includes('ragi')) {
    return BULK_ORDER_ITEMS[3];
  }
  // 14. Coconut Oil
  if (
    sku.includes('OIL-COC') ||
    sku.includes('COC-OIL') ||
    (slug.includes('coconut') && slug.includes('oil')) ||
    (title.includes('coconut') && title.includes('oil')) ||
    title.includes('kobbari enne')
  ) {
    return BULK_ORDER_ITEMS[13];
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
  // 15. Coconut Shell Charcoal
  if (
    sku.includes('CHR') ||
    slug.includes('charcoal') ||
    title.includes('charcoal')
  ) {
    return BULK_ORDER_ITEMS[14];
  }
  // 16. Cocopeat Blocks
  if (
    sku.includes('COI-COP') ||
    sku.includes('COCOPEAT') ||
    slug.includes('cocopeat') ||
    title.includes('cocopeat') ||
    title.includes('coir pith')
  ) {
    return BULK_ORDER_ITEMS[15];
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

export interface VolumeOption {
  value: string;
  label: string;
  unitLabel: string;
}

export function getBulkOrderVolumeOptions(item?: {
  sku?: string;
  slug?: string;
  title?: string;
}): VolumeOption[] {
  const meta = getBulkOrderItemMeta(item);
  const order = meta?.order ?? 0;

  switch (order) {
    case 1: // 1. Tender Coconut
      return [
        { value: '1000', label: '1,000 pieces (Mini Canter)', unitLabel: 'pieces' },
        { value: '2500', label: '2,500 pieces (Canter Load)', unitLabel: 'pieces' },
        { value: '5000', label: '5,000 pieces (Full Truckload)', unitLabel: 'pieces' },
        { value: '10000', label: '10,000 pieces (Lorry Consignment)', unitLabel: 'pieces' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'pieces' },
      ];

    case 2: // 2. Arecanut Plants
      return [
        { value: '100', label: '100 Plants (Orchard Starter)', unitLabel: 'Plants' },
        { value: '250', label: '250 Plants (Farm Acre Lot)', unitLabel: 'Plants' },
        { value: '500', label: '500 Plants (Plantation Lot)', unitLabel: 'Plants' },
        { value: '1000', label: '1,000 Plants (Commercial Orchard)', unitLabel: 'Plants' },
        { value: '2500', label: '2,500 Plants (Full Nursery Truck)', unitLabel: 'Plants' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Plants' },
      ];

    case 3: // 3. Coconut Plants
      return [
        { value: '50', label: '50 Plants (1 Yr Old, 2 Ft)', unitLabel: 'Plants' },
        { value: '100', label: '100 Plants (Orchard Starter)', unitLabel: 'Plants' },
        { value: '250', label: '250 Plants (Estate Block)', unitLabel: 'Plants' },
        { value: '500', label: '500 Plants (Canter Load)', unitLabel: 'Plants' },
        { value: '1000', label: '1,000 Plants (10-Wheeler Truckload)', unitLabel: 'Plants' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Plants' },
      ];

    case 4: // 4. Ragi Millet
      return [
        { value: '250', label: '250 kg (10 Bags of 25kg)', unitLabel: 'kg' },
        { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
        { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
        { value: '2500', label: '2,500 kg (2.5 MT Tempo Load)', unitLabel: 'kg' },
        { value: '5000', label: '5,000 kg (5 MT Full Truckload)', unitLabel: 'kg' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'kg' },
      ];

    case 5: // 5. Groundnut Oil
      return [
        { value: '50', label: '50 Litres (Commercial Cans)', unitLabel: 'Litres' },
        { value: '100', label: '100 Litres (Wholesale Batch)', unitLabel: 'Litres' },
        { value: '250', label: '250 Litres (Half Barrel Lot)', unitLabel: 'Litres' },
        { value: '500', label: '500 Litres (Commercial Barrel Lot)', unitLabel: 'Litres' },
        { value: '1000', label: '1,000 Litres (Bulk Tanker / Drum Lot)', unitLabel: 'Litres' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Litres' },
      ];

    case 6: // 6. Cow Ghee
      return [
        { value: '25', label: '25 Litres (Commercial Cans)', unitLabel: 'Litres' },
        { value: '50', label: '50 Litres (Wholesale Batch)', unitLabel: 'Litres' },
        { value: '100', label: '100 Litres (Commercial Lot)', unitLabel: 'Litres' },
        { value: '250', label: '250 Litres (Bulk Dispatch)', unitLabel: 'Litres' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Litres' },
      ];

    case 7: // 7. Mature Coconuts
      return [
        { value: '500', label: '500 Nuts (10 Bags of 50)', unitLabel: 'Nuts' },
        { value: '1000', label: '1,000 Nuts (20 Bags of 50)', unitLabel: 'Nuts' },
        { value: '2500', label: '2,500 Nuts (Tempo Mini Lot)', unitLabel: 'Nuts' },
        { value: '5000', label: '5,000 Nuts (Canter Truckload)', unitLabel: 'Nuts' },
        { value: '10000', label: '10,000 Nuts (Full 10-Wheeler Truck)', unitLabel: 'Nuts' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Nuts' },
      ];

    case 8: // 8. Ball Copra
      return [
        { value: '500', label: '500 kg (20 Master Boxes of 25kg)', unitLabel: 'kg' },
        { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
        { value: '2500', label: '2,500 kg (2.5 MT Tempo Load)', unitLabel: 'kg' },
        { value: '5000', label: '5,000 kg (5 MT Truckload)', unitLabel: 'kg' },
        { value: '10000', label: '10,000 kg (10 MT Lorry Consignment)', unitLabel: 'kg' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'kg' },
      ];

    case 9: // 9. Fresh Ginger
      return [
        { value: '250', label: '250 kg (5 Sacks of 50kg)', unitLabel: 'kg' },
        { value: '500', label: '500 kg (10 Sacks of 50kg)', unitLabel: 'kg' },
        { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
        { value: '2500', label: '2,500 kg (Tempo Load)', unitLabel: 'kg' },
        { value: '5000', label: '5,000 kg (5 MT Canter Load)', unitLabel: 'kg' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'kg' },
      ];

    case 10: // 10. Coconut Shells
      return [
        { value: '1000', label: '1 Metric Tonne (1,000 kg)', unitLabel: 'Tonnes' },
        { value: '3000', label: '3 Metric Tonnes (Tempo Load)', unitLabel: 'Tonnes' },
        { value: '5000', label: '5 Metric Tonnes (Canter Truckload)', unitLabel: 'Tonnes' },
        { value: '10000', label: '10 Metric Tonnes (10-Wheeler Truckload)', unitLabel: 'Tonnes' },
        { value: '20000', label: '20 Metric Tonnes (Multi-Axle Lorry)', unitLabel: 'Tonnes' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Tonnes' },
      ];

    case 11: // 11. Arecanut (Adike)
      return [
        { value: '100', label: '100 kg (1 Quintal)', unitLabel: 'kg' },
        { value: '250', label: '250 kg (2.5 Quintals)', unitLabel: 'kg' },
        { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
        { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
        { value: '5000', label: '5,000 kg (5 MT Full Truckload)', unitLabel: 'kg' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'kg' },
      ];

    case 12: // 12. Ragi Flour
    case 13: // 13. Rice Flour
      return [
        { value: '250', label: '250 kg (10 Bags of 25kg)', unitLabel: 'kg' },
        { value: '500', label: '500 kg (5 Quintals)', unitLabel: 'kg' },
        { value: '1000', label: '1,000 kg (1 Metric Tonne)', unitLabel: 'kg' },
        { value: '2500', label: '2,500 kg (2.5 MT Tempo Load)', unitLabel: 'kg' },
        { value: '5000', label: '5,000 kg (5 MT Full Truckload)', unitLabel: 'kg' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'kg' },
      ];

    case 14: // 14. Coconut Oil
      return [
        { value: '50', label: '50 Litres (Commercial Cans)', unitLabel: 'Litres' },
        { value: '100', label: '100 Litres (Wholesale Batch)', unitLabel: 'Litres' },
        { value: '250', label: '250 Litres (Half Barrel Lot)', unitLabel: 'Litres' },
        { value: '500', label: '500 Litres (Commercial Barrel Lot)', unitLabel: 'Litres' },
        { value: '1000', label: '1,000 Litres (Bulk Tanker / Drum Lot)', unitLabel: 'Litres' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Litres' },
      ];

    case 15: // 15. Coconut Shell Charcoal
      return [
        { value: '1000', label: '1 Metric Tonne (1,000 kg)', unitLabel: 'Tonnes' },
        { value: '3000', label: '3 Metric Tonnes (Tempo Load)', unitLabel: 'Tonnes' },
        { value: '5000', label: '5 Metric Tonnes (Canter Truckload)', unitLabel: 'Tonnes' },
        { value: '10000', label: '10 Metric Tonnes (10-Wheeler Truckload)', unitLabel: 'Tonnes' },
        { value: '20000', label: '20 Metric Tonnes (Multi-Axle Lorry)', unitLabel: 'Tonnes' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Tonnes' },
      ];

    case 16: // 16. Cocopeat Blocks
      return [
        { value: '100', label: '100 Blocks (~500 kg Pallet)', unitLabel: 'Blocks' },
        { value: '250', label: '250 Blocks (~1.25 Metric Tonnes)', unitLabel: 'Blocks' },
        { value: '500', label: '500 Blocks (~2.5 MT Mini Canter)', unitLabel: 'Blocks' },
        { value: '1000', label: '1,000 Blocks (~5 MT Truckload)', unitLabel: 'Blocks' },
        { value: '2000', label: '2,000 Blocks (~10 MT Lorry Consignment)', unitLabel: 'Blocks' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Blocks' },
      ];

    default:
      return [
        { value: '500', label: '500 Units', unitLabel: 'Units' },
        { value: '1000', label: '1,000 Units', unitLabel: 'Units' },
        { value: '2500', label: '2,500 Units', unitLabel: 'Units' },
        { value: '5000', label: '5,000 Units', unitLabel: 'Units' },
        { value: 'custom', label: 'Custom Quantity…', unitLabel: 'Units' },
      ];
  }
}
