import { useState } from 'react';
import { Heart, Eye, Star, ShoppingCart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProductWithDetails } from '@/lib/api/products';
import { WishlistButton } from './WishlistButton';
import { getPrimaryImageUrl } from '@/lib/market/images';
import { useToggleFavorite } from '@/hooks/useProducts';

interface MarketProductCardProps {
  product: ProductWithDetails;
  isSaved: boolean;
  onSave: (productId: string) => void;
  onQuickView: (product: ProductWithDetails) => void;
  onAddToCart: (product: ProductWithDetails) => void;
  onShare: (product: ProductWithDetails) => void;
  viewMode?: 'grid' | 'list';
}

export function MarketProductCard({
  product,
  isSaved,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
  viewMode = 'grid',
}: MarketProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const toggleFavorite = useToggleFavorite();

  // Get the primary image URL using utility (no mock fallbacks)
  const imageUrl = getPrimaryImageUrl(product);
  const imageAlt = product.images?.[0]?.alt_text || product.name;

  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite.mutateAsync(product.id);
      onSave(product.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/30 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex h-28 sm:h-32 md:h-36">
            {/* Image */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0">
              {imageUrl && !imageError ? (
                <>
                  {!imageLoaded && (
                    <Skeleton className="absolute inset-0 rounded-l-lg" />
                  )}
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className={cn(
                      "w-full h-full object-cover rounded-l-lg transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                </>
              ) : (
                <div 
                  className="w-full h-full bg-muted rounded-l-lg flex items-center justify-center"
                  aria-label={`${product.name} image unavailable`}
                >
                  <span className="text-xs text-muted-foreground text-center p-2">Image unavailable</span>
                </div>
              )}
              
              {/* Featured Badge */}
              {product.status === 'active' && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  Active
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-4 flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          S
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Store</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">${product.base_price}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 sm:gap-2 ml-2 sm:ml-4">
                <Button
                  onClick={handleFavoriteToggle}
                  variant="outline"
                  size="sm"
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isSaved}
                  className={cn("h-8 w-8 p-0", isSaved && "bg-primary/10 border-primary text-primary")}
                >
                  <Heart className={cn("h-3 w-3", isSaved && "fill-current")} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickView(product)}
                  className="h-8 w-8 p-0"
                  aria-label="Quick view product"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product)}
                  className="h-8 px-3 bg-primary hover:bg-primary/90"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/30 bg-background/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Image Container */}
        <div 
          className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden cursor-pointer"
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
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div 
              className="w-full h-full bg-muted flex items-center justify-center"
              aria-label={`${product.name} image unavailable`}
            >
              <span className="text-sm text-muted-foreground text-center p-4">Image unavailable</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          
          {/* Status Badge */}
          {product.status === 'active' && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium shadow-lg">
              New
            </Badge>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <WishlistButton
                productId={product.id}
                variant="secondary"
                size="sm"
                className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-lg border border-border/30 backdrop-blur-sm"
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-lg border border-border/30 backdrop-blur-sm"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(product);
                }}
                className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-lg border border-border/30 backdrop-blur-sm"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 
                className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 cursor-pointer text-xs sm:text-sm leading-tight"
                onClick={() => window.location.href = `/product/${product.slug || product.id}`}
              >
                {product.name}
              </h3>
              <span className="text-sm sm:text-lg font-bold text-primary">${product.base_price}</span>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  S
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Store</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

          {/* Category */}
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          )}

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Action Button */}
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 rounded-lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}