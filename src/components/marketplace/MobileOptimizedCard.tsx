import { useState } from 'react';
import { Heart, ShoppingCart, Share2, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProductWithDetails } from '@/lib/api/products';
import { getPrimaryImageUrl } from '@/lib/market/images';

interface MobileOptimizedCardProps {
  product: ProductWithDetails;
  isSaved: boolean;
  onSave: (productId: string) => void;
  onQuickView: (product: ProductWithDetails) => void;
  onAddToCart: (product: ProductWithDetails) => void;
  onShare: (product: ProductWithDetails) => void;
}

export function MobileOptimizedCard({
  product,
  isSaved,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
}: MobileOptimizedCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getPrimaryImageUrl(product);
  const imageAlt = product.images?.[0]?.alt_text || product.name;

  return (
    <Card className={cn(
      "group overflow-hidden border-border/30 bg-card/50 dark:bg-card/50",
      "hover:shadow-xl hover:bg-card/70 dark:hover:bg-card/70",
      "transition-all duration-300 ease-out",
      "product-card"
    )}>
      <CardContent className="p-0">
        {/* Image Container - Perfect square aspect ratio */}
        <div 
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={() => window.location.href = `/product/${product.slug || product.id}`}
        >
          {imageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <Skeleton className="absolute inset-0" />
              )}
              <img
                src={imageUrl}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full h-full object-cover object-center",
                  "transition-all duration-500 ease-out",
                  "group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No image</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-all duration-300" />
          
          {/* Status badge */}
          {product.status === 'active' && (
            <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm">
              New
            </Badge>
          )}

          {/* Mobile-optimized overlay actions */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(product.id);
                }}
                className={cn(
                  "h-12 w-12 p-0 rounded-full touch-manipulation",
                  "bg-background/95 hover:bg-background shadow-lg backdrop-blur-sm",
                  isSaved && "bg-primary/20 border-primary"
                )}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={cn("h-5 w-5", isSaved && "fill-current text-primary")} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="h-12 w-12 p-0 rounded-full bg-background/95 hover:bg-background shadow-lg backdrop-blur-sm touch-manipulation"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-3 space-y-2">
          {/* Product title and price */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-medium text-foreground text-sm line-clamp-2 cursor-pointer flex-1"
              onClick={() => window.location.href = `/product/${product.slug || product.id}`}
            >
              {product.name}
            </h3>
            <span className="text-sm font-bold text-primary flex-shrink-0">
              ${product.base_price}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>4.5</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>124</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>45</span>
            </div>
          </div>

          {/* Category badge */}
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          )}

          {/* Mobile-first CTA button */}
          <Button
            onClick={() => onAddToCart(product)}
            className={cn(
              "w-full bg-primary hover:bg-primary/90 text-sm h-11 rounded-lg touch-manipulation",
              "active:scale-95 transition-transform duration-150"
            )}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}