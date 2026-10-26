'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import WholesaleRFQModal from '@/components/WholesaleRFQModal';

interface CategoryProductGridProps {
  products: Product[];
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOpenRFQ = (product: Product) => {
    setSelectedProduct(product);
    setIsRFQOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectForRFQ={handleOpenRFQ}
          />
        ))}
      </div>

      <WholesaleRFQModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        products={products}
        selectedProduct={selectedProduct}
      />
    </>
  );
}
