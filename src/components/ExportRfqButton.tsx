'use client';

import React, { useState } from 'react';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';
import { CATALOG_PRODUCTS } from '@/lib/catalog';
import { Product } from '@/types';

interface ExportRfqButtonProps {
  label?: string;
  defaultProduct?: string;
  defaultCountry?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ExportRfqButton({
  label = 'Request Commercial Export Quote',
  defaultProduct,
  defaultCountry,
  className = 'px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition',
  children,
}: ExportRfqButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Cast catalog items into Product shape for RFQ modal
  const products: Product[] = CATALOG_PRODUCTS.map((p) => ({
    ...p,
    price: Number(p.retail_price_inr),
    category: p.category as any,
    unit: p.unit_of_measure,
    images: [p.image_url],
  })) as any;

  const matchedProduct = defaultProduct
    ? products.find(
        (p) =>
          p.title.toLowerCase().includes(defaultProduct.toLowerCase()) ||
          p.sku.toLowerCase().includes(defaultProduct.toLowerCase())
      ) || null
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children || label}
      </button>

      <WholesaleRFQModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        products={products}
        selectedProduct={matchedProduct}
        initialCountry={defaultCountry}
      />
    </>
  );
}
