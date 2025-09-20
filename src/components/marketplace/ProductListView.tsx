import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Share2, Eye } from 'lucide-react';
import { ProductWithDetails } from '@/lib/api/products';
import { MarketProductCard } from './MarketProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProductListViewProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (product: ProductWithDetails) => void;
  onAddToCart: (product: ProductWithDetails) => void;
  onShare: (product: ProductWithDetails) => void;
  isSaved: (id: string) => boolean;
}

export function ProductListView({
  products,
  isLoading,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
  isSaved,
}: ProductListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 sm:pb-6 scroll-content-safe">
      {products.map((product) => (
        <MarketProductCard
          key={product.id}
          product={product}
          isSaved={isSaved(product.id)}
          onSave={onSave}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          onShare={onShare}
          viewMode="list"
        />
      ))}
    </div>
  );
}