import React, { useMemo } from 'react';
import { MarketProductCard } from './MarketProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductWithDetails } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface OptimizedProductGridViewProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (product: ProductWithDetails) => void;
  onAddToCart: (product: ProductWithDetails) => void;
  onShare: (product: ProductWithDetails) => void;
  isSaved: (id: string) => boolean;
  className?: string;
}

export function OptimizedProductGridView({
  products,
  isLoading,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
  isSaved,
  className,
}: OptimizedProductGridViewProps) {
  // Optimized grid classes with proper responsive breakpoints
  const gridClasses = useMemo(() => {
    return cn(
      // Base responsive grid with optimized gaps
      "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
      // Mobile-first gap scaling
      "gap-2 sm:gap-3 lg:gap-4",
      // Bottom padding for navigation clearance
      "pb-20 sm:pb-6",
      // Smooth scroll behavior
      "scroll-smooth",
      className
    );
  }, [className]);

  // Loading state with skeleton grid
  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl text-muted-foreground">📦</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your search terms or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {products.map((product, index) => (
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