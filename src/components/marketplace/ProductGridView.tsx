import React from 'react';
import { Link } from 'react-router-dom';
import { MarketProductCard } from './MarketProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductWithDetails } from '@/lib/api/products';

interface ProductGridViewProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (product: ProductWithDetails) => void;
  onAddToCart: (product: ProductWithDetails) => void;
  onShare: (product: ProductWithDetails) => void;
  isSaved: (id: string) => boolean;
}

export function ProductGridView({
  products,
  isLoading,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
  isSaved,
}: ProductGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 pb-20 scroll-content-safe">
      {products.map((product) => (
        <MarketProductCard
          key={product.id}
          product={product}
          isSaved={isSaved(product.id)}
          onSave={onSave}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          onShare={onShare}
          viewMode="grid"
        />
      ))}
    </div>
  );
}