import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    creator?: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    sizes?: string[];
    colors?: string[];
    isLiked?: boolean;
  };
  viewMode?: 'grid' | 'list';
  onQuickView?: (product: any) => void;
  className?: string;
}

export function EnhancedProductCard({
  product,
  viewMode = 'grid',
  onQuickView,
  className,
}: EnhancedProductCardProps) {
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addItem({
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size: product.sizes?.[0] || 'M',
        color: product.colors?.[0] || 'Black',
      });

      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save items to your wishlist',
          variant: 'destructive',
        });
        return;
      }

      setIsLiked(!isLiked);
      
      if (!isLiked) {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .upsert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) throw error;

        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been saved to your wishlist`,
        });
      } else {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;

        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist`,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setIsLiked(!isLiked); // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}>
        <CardContent className="p-0">
          <div className="flex h-40 sm:h-48">
            {/* Product Image */}
            <div className="w-40 sm:w-48 flex-shrink-0 relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Quick actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleLike}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-foreground"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isLiked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 p-4 flex justify-between">
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                  {product.creator && (
                    <p className="text-sm text-muted-foreground">by {product.creator}</p>
                  )}
                </div>
                
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    {product.reviewCount && (
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                  {product.sizes?.slice(0, 3).map((size) => (
                    <Badge key={size} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                {onQuickView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickView(product)}
                    className="min-h-[44px]"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Quick View
                  </Button>
                )}
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="min-h-[44px] bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 group ${className}`}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleLike}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-foreground"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isLiked ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            </div>
            
            {onQuickView && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onQuickView(product)}
                  className="bg-white/90 hover:bg-white text-foreground"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Quick View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            {product.creator && (
              <p className="text-sm text-muted-foreground">by {product.creator}</p>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              {product.reviewCount && (
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg min-h-[44px] min-w-[44px]"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}