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
  onQuickView: (id: string) => void;
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
    <div className="space-y-4">
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
            viewMode="list"
          />
        </Link>
      ))}
    </div>
  );
}