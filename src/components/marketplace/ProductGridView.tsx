import React from 'react';
import { Link } from 'react-router-dom';
import { MarketProductCard } from './MarketProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductWithDetails } from '@/lib/api/products';

interface ProductGridViewProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (id: string) => void;
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <Link 
          to={`/product/${product.slug || product.id}`} 
          key={product.id} 
          className="block group"
        >
          <MarketProductCard
            product={product}
            isSaved={isSaved(product.id)}
            onSave={() => onSave(product.id)}
            onQuickView={(product) => onQuickView(product.id)}
            onAddToCart={(product) => onAddToCart(product)}
            onShare={(product) => onShare(product)}
          />
        </Link>
      ))}
    </div>
  );
}