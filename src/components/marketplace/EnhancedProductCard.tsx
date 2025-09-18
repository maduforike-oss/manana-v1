import { useState } from 'react';
import { Heart, Eye, Star, User, ShoppingCart, Share2, Lock, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EnhancedMarketCard } from '@/lib/api/product-management';

interface EnhancedProductCardProps {
  product: EnhancedMarketCard;
  isSaved?: boolean;
  onSave?: (productId: string) => void;
  onQuickView?: (product: EnhancedMarketCard) => void;
  onAddToCart?: (product: EnhancedMarketCard) => void;
  onShare?: (product: EnhancedMarketCard) => void;
  onCreatorClick?: (creatorId: string) => void;
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
}

export function EnhancedProductCard({
  product,
  isSaved = false,
  onSave,
  onQuickView,
  onAddToCart,
  onShare,
  onCreatorClick,
  viewMode = 'grid',
  isLoading = false,
}: EnhancedProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const price = (product.price_cents / 100).toFixed(2);

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.creator_id && onCreatorClick) {
      onCreatorClick(product.creator_id);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="w-full aspect-[3/4]" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/30 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex h-32">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              {!imageLoaded && !imageError && (
                <Skeleton className="absolute inset-0 rounded-l-lg" />
              )}
              <img
                src={product.primary_image || '/placeholder.svg'}
                alt={product.title}
                className={cn(
                  "w-full h-full object-cover rounded-l-lg transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Badges */}
              {product.has_badge_new && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  New
                </Badge>
              )}
              {product.has_badge_trending && (
                <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                  Trending
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 
                      className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 cursor-pointer"
                      onClick={() => onQuickView?.(product)}
                    >
                      {product.title}
                    </h3>
                    
                    {/* Creator Info */}
                    {product.creator_username && (
                      <div 
                        className="flex items-center gap-2 mt-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={handleCreatorClick}
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={product.creator_avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {product.creator_display_name?.[0] || product.creator_username?.[0] || <User className="h-2 w-2" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {product.creator_display_name || product.creator_username}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-primary">${price}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.avg_rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{product.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{product.favorites.toLocaleString()}</span>
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                {onSave && (
                  <Button
                    onClick={() => onSave(product.product_id)}
                    variant="outline"
                    size="sm"
                    className={cn("h-8 w-8 p-0", isSaved && "bg-primary/10 border-primary text-primary")}
                  >
                    <Heart className={cn("h-3 w-3", isSaved && "fill-current")} />
                  </Button>
                )}
                {onQuickView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickView(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                {onAddToCart && (
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(product)}
                    className="h-8 px-3"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </Button>
                )}
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
          className="relative aspect-[3/4] overflow-hidden cursor-pointer"
          onClick={() => onQuickView?.(product)}
        >
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0" />
          )}
          <img
            src={product.primary_image || '/placeholder.svg'}
            alt={product.title}
            loading="lazy"
            className={cn(
              "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.has_badge_new && (
              <Badge className="bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                New
              </Badge>
            )}
            {product.has_badge_trending && (
              <Badge className="bg-orange-500 text-white text-xs font-medium shadow-lg">
                Trending
              </Badge>
            )}
            {product.has_badge_low_stock && (
              <Badge variant="destructive" className="text-xs font-medium shadow-lg">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              {onSave && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave(product.product_id);
                  }}
                  className={cn(
                    "h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg",
                    isSaved && "bg-primary text-primary-foreground"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
              )}
              
              {onAddToCart && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}

              {onShare && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(product);
                  }}
                  className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 
                className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 cursor-pointer text-sm leading-tight"
                onClick={() => onQuickView?.(product)}
              >
                {product.title}
              </h3>
              <span className="text-lg font-bold text-primary ml-2">${price}</span>
            </div>

            {/* Creator Info */}
            {product.creator_username && (
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={handleCreatorClick}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={product.creator_avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {product.creator_display_name?.[0] || product.creator_username?.[0] || <User className="h-2 w-2" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate">
                  {product.creator_display_name || product.creator_username}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.avg_rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{product.views > 1000 ? `${Math.floor(product.views/1000)}k` : product.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{product.favorites > 1000 ? `${Math.floor(product.favorites/1000)}k` : product.favorites}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onQuickView?.(product)}
            className="w-full bg-primary hover:bg-primary/90 text-sm h-9 rounded-lg"
          >
            <Palette className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}