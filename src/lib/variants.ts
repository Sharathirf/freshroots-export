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
  // Pure Desi Cow Ghee (Traditional Bilona): 500 ml @ ₹530 and 1 Litre @ ₹980 (incl. 2% payment platform charge, 100% Free Doorstep Delivery)
  'DAI-GHE-BIL-01L': [
    {
      packSize: '500 ml Glass Jar',
      label: '500 ml @ ₹530',
      price: 530,
      weightKg: 0.5,
      unitOfMeasure: '500 ml Glass Jar',
      title: 'Farm-Fresh Pure Desi Cow Ghee (500 ml Glass Jar)',
      isDefault: false
    },
    {
      packSize: '1 Litre Glass Jar',
      label: '1 Litre @ ₹980',
      price: 980,
      weightKg: 1.0,
      unitOfMeasure: '1 Litre Glass Jar',
      title: 'Farm-Fresh Pure Desi Cow Ghee (1 Litre Glass Jar)',
      isDefault: true
    }
  ],

  // GI-Certified Tiptur Ball Copra: 15 kg @ ₹5,508, 25 kg @ ₹9,180, 30 kg @ ₹11,016 (incl. 2% payment platform charge, Free Delivery)
  'COP-BAL-BOX-15K': [
    {
      packSize: '15 kg Master Box',
      label: '15 kg Box @ ₹5,508',
      price: 5508,
      weightKg: 15.0,
      unitOfMeasure: '15 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (15 kg Box)',
      isDefault: true
    },
    {
      packSize: '25 kg Master Box',
      label: '25 kg Box @ ₹9,180',
      price: 9180,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (25 kg Box)',
      isDefault: false
    },
    {
      packSize: '30 kg Master Box',
      label: '30 kg Box @ ₹11,016',
      price: 11016,
      weightKg: 30.0,
      unitOfMeasure: '30 kg Master Box',
      title: 'GI-Certified Tiptur Ball Copra (30 kg Box)',
      isDefault: false
    }
  ],

  // Pure Karnataka Ragi Millet: 5 kg @ ₹663, 10 kg @ ₹1,306, 25 kg @ ₹3,213 (incl. 2% payment platform charge, Free Delivery)
  'MIL-RAG-ORG-05K': [
    {
      packSize: '5 kg Pack',
      label: '5 kg Pack @ ₹663',
      price: 663,
      weightKg: 5.0,
      unitOfMeasure: '5 kg Pack',
      title: 'Pure Karnataka Ragi Millet (5 kg Pack)',
      isDefault: true
    },
    {
      packSize: '10 kg Pack',
      label: '10 kg Pack @ ₹1,306',
      price: 1306,
      weightKg: 10.0,
      unitOfMeasure: '10 kg Pack',
      title: 'Pure Karnataka Ragi Millet (10 kg Pack)',
      isDefault: false
    },
    {
      packSize: '25 kg Bag',
      label: '25 kg Bag @ ₹3,213',
      price: 3213,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Bag',
      title: 'Pure Karnataka Ragi Millet (25 kg Bag)',
      isDefault: false
    }
  ],

  // Stone-Ground Ragi Flour: 5 kg Bag (Min) @ ₹385, 10 kg Family Pack @ ₹750, 25 kg Sack @ ₹1,750
  'FLR-RAG-STN-05K': [
    {
      packSize: '5 kg Bag',
      label: '5 kg Bag @ ₹385 (Min)',
      price: 385,
      weightKg: 5.0,
      unitOfMeasure: '5 kg Bag',
      title: 'Stone-Ground Ragi Flour (5 kg Bag)',
      isDefault: true
    },
    {
      packSize: '10 kg Family Pack',
      label: '10 kg Pack @ ₹750',
      price: 750,
      weightKg: 10.0,
      unitOfMeasure: '10 kg Pack',
      title: 'Stone-Ground Ragi Flour (10 kg Pack)',
      isDefault: false
    },
    {
      packSize: '25 kg Sack',
      label: '25 kg Sack @ ₹1,750',
      price: 1750,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Sack',
      title: 'Stone-Ground Ragi Flour (25 kg Sack)',
      isDefault: false
    }
  ],

  // Pure Rice Flour (Akki Hittu): 5 kg Bag (Min) @ ₹365, 10 kg Family Pack @ ₹710, 25 kg Sack @ ₹1,650
  'FLR-RIC-STN-05K': [
    {
      packSize: '5 kg Bag',
      label: '5 kg Bag @ ₹365 (Min)',
      price: 365,
      weightKg: 5.0,
      unitOfMeasure: '5 kg Bag',
      title: 'Pure Rice Flour (Akki Hittu 5 kg Bag)',
      isDefault: true
    },
    {
      packSize: '10 kg Family Pack',
      label: '10 kg Pack @ ₹710',
      price: 710,
      weightKg: 10.0,
      unitOfMeasure: '10 kg Pack',
      title: 'Pure Rice Flour (Akki Hittu 10 kg Pack)',
      isDefault: false
    },
    {
      packSize: '25 kg Sack',
      label: '25 kg Sack @ ₹1,650',
      price: 1650,
      weightKg: 25.0,
      unitOfMeasure: '25 kg Sack',
      title: 'Pure Rice Flour (Akki Hittu 25 kg Sack)',
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
