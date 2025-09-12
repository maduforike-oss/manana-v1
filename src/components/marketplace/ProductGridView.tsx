import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Product } from '@/lib/api/products';

interface ProductGridViewProps {
  products: Product[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onShare: (product: Product) => void;
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
        <ProductCard
          key={product.id}
          design={{
            id: product.id,
            name: product.name,
            thumbSrc: `/api/placeholder/300/400`,
            price: product.base_price,
            creator: "Unknown",
            tags: [],
            garmentId: 'tshirt',
            orientation: 'front' as const,
            fabric: 'cotton',
            baseColor: 'light' as const,
            printArea: { width: 250, height: 300 },
            availableOrientations: ['front'],
            rating: 0,
            featured: false,
            dpi: 300,
            safeArea: { x: 25, y: 25, w: 200, h: 250 },
            mmToPx: 3.779,
            studioReady: [],
            likes: 0,
            views: 0,
            downloads: 0,
            avatar: '',
            shippingDays: '3-5 days',
          }}
          isSaved={isSaved(product.id)}
          isUnlocked={true}
          onSave={() => onSave(product.id)}
          onQuickView={(design) => onQuickView(design.id)}
          onOpenInStudio={() => {}}
          onAddToCart={(design) => onAddToCart(product)}
          onShare={(design) => onShare(product)}
        />
      ))}
    </div>
  );
}