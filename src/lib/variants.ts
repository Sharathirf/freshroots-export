// Multi-pack size variants configuration for agricultural commodities

export interface ProductVariant {
  packSize: string;
  label: string;
  price: number;
  weightKg: number;
  unitOfMeasure: string;
  title: string;
  isDefault?: boolean;
}

export const PRODUCT_VARIANTS: Record<string, ProductVariant[]> = {
  // Pure Desi Cow Ghee (Traditional Bilona): 500 ml @ ₹480 and 1 Litre @ ₹900
  'DAI-GHE-BIL-01L': [
    {
      packSize: '500 ml Glass Jar',
      label: '500 ml @ ₹480',
      price: 480,
      weightKg: 0.5,
      unitOfMeasure: '500 ml Glass Jar',
      title: 'Farm-Fresh Pure Desi Cow Ghee (500 ml Glass Jar)',
      isDefault: false
    },
    {
      packSize: '1 Litre Glass Jar',
      label: '1 Litre @ ₹900',
      price: 900,
      weightKg: 1.0,
      unitOfMeasure: '1 Litre Glass Jar',
      title: 'Farm-Fresh Pure Desi Cow Ghee (1 Litre Glass Jar)',
      isDefault: true
    }
  ],

  // GI-Certified Tiptur Ball Copra: 15 kg @ ₹5,250, 25 kg @ ₹8,750, 30 kg @ ₹10,500
  'COP-BAL-BOX-15K': [
    {
      packSize: '15 kg Master Box',
      label: '15 kg Box @ ₹5,250',
      price: 5250,
      weightKg: 15.0,
      unitOfMeasure: '15 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (15 kg Box)',
      isDefault: true
    },
    {
      packSize: '25 kg Master Box',
      label: '25 kg Box @ ₹8,750',
      price: 8750,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (25 kg Box)',
      isDefault: false
    },
    {
      packSize: '30 kg Master Box',
      label: '30 kg Box @ ₹10,500',
      price: 10500,
      weightKg: 30.0,
      unitOfMeasure: '30 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (30 kg Box)',
      isDefault: false
    }
  ],

  // Pure Karnataka Ragi Millet: 5 kg @ ₹600, 10 kg @ ₹1,200, 25 kg @ ₹3,000
  'MIL-RAG-ORG-05K': [
    {
      packSize: '5 kg Pack',
      label: '5 kg Pack @ ₹600',
      price: 600,
      weightKg: 5.0,
      unitOfMeasure: '5 kg Pack',
      title: 'Pure Karnataka Ragi Millet (5 kg Pack)',
      isDefault: true
    },
    {
      packSize: '10 kg Pack',
      label: '10 kg Pack @ ₹1,200',
      price: 1200,
      weightKg: 10.0,
      unitOfMeasure: '10 kg Pack',
      title: 'Pure Karnataka Ragi Millet (10 kg Pack)',
      isDefault: false
    },
    {
      packSize: '25 kg Bag',
      label: '25 kg Bag @ ₹3,000',
      price: 3000,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Bag',
      title: 'Pure Karnataka Ragi Millet (25 kg Bag)',
      isDefault: false
    }
  ]
};

export function getProductVariants(sku: string): ProductVariant[] | null {
  return PRODUCT_VARIANTS[sku] || null;
}

export function getDefaultVariant(sku: string): ProductVariant | null {
  const variants = PRODUCT_VARIANTS[sku];
  if (!variants || variants.length === 0) return null;
  return variants.find((v) => v.isDefault) || variants[0];
}

export function findMatchingVariant(
  sku: string,
  requestedPrice?: number,
  requestedUnit?: string
): ProductVariant | null {
  const variants = PRODUCT_VARIANTS[sku];
  if (!variants) return null;

  if (requestedPrice !== undefined && requestedPrice > 0) {
    const match = variants.find((v) => v.price === Number(requestedPrice));
    if (match) return match;
  }

  if (requestedUnit) {
    const unitLower = requestedUnit.toLowerCase();
    const match = variants.find(
      (v) =>
        v.packSize.toLowerCase().includes(unitLower) ||
        unitLower.includes(v.packSize.toLowerCase().slice(0, 5)) ||
        (unitLower.includes('500') && v.packSize.includes('500')) ||
        (unitLower.includes('1 l') && v.packSize.includes('1 L')) ||
        (unitLower.includes('15') && v.packSize.includes('15')) ||
        (unitLower.includes('25') && v.packSize.includes('25')) ||
        (unitLower.includes('30') && v.packSize.includes('30')) ||
        (unitLower.includes('5') && v.packSize.includes('5 kg')) ||
        (unitLower.includes('10') && v.packSize.includes('10 kg'))
    );
    if (match) return match;
  }

  return null;
}
