import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Share2, Eye } from 'lucide-react';
import { Product } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductListViewProps {
  products: Product[];
  isLoading: boolean;
  onSave: (id: string) => void;
  onQuickView: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onShare: (product: Product) => void;
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
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Product Image */}
              <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src="/api/placeholder/96/96"
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by Unknown Creator
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-bold text-primary">
                      ${product.base_price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {product.status}
                  </Badge>
                  {/* Add more badges based on product data */}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onQuickView(product.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Quick View
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToCart(product)}
                    className="flex-1 sm:flex-none"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSave(product.id)}
                    className={cn(
                      "flex-shrink-0",
                      isSaved(product.id) && "text-red-500 hover:text-red-600"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isSaved(product.id) && "fill-current"
                      )}
                    />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onShare(product)}
                    className="flex-shrink-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}