import { useState } from 'react';
import { Heart, Eye, Star, Download, Palette, ShoppingCart, Share2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { StudioGarmentData } from '@/lib/studio/marketData';

interface ProductCardProps {
  design: StudioGarmentData;
  isSaved: boolean;
  isUnlocked: boolean;
  onSave: (designId: string) => void;
  onQuickView: (design: StudioGarmentData) => void;
  onOpenInStudio: (design: StudioGarmentData) => void;
  onAddToCart?: (design: StudioGarmentData) => void;
  onShare?: (design: StudioGarmentData) => void;
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

const COLOR_SWATCHES = [
  { id: 'black', color: 'hsl(var(--background))', name: 'Black', thumbSrc: '/garments/tshirt-black-front.png' },
  { id: 'white', color: 'hsl(var(--background))', name: 'White', thumbSrc: '/garments/tshirt-white-front.png' },
  { id: 'navy', color: 'hsl(217 91% 60%)', name: 'Navy', thumbSrc: '/garments/polo-navy-front.png' },
  { id: 'gray', color: 'hsl(var(--muted))', name: 'Gray', thumbSrc: '/garments/crewneck-heather-front.png' },
];

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL'];

export function ProductCard({
  design,
  isSaved,
  isUnlocked,
  onSave,
  onQuickView,
  onOpenInStudio,
  onAddToCart,
  onShare,
  viewMode = 'grid',
  isLoading = false,
  hasError = false,
  onRetry
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [showSwatches, setShowSwatches] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Mock stock status - in real app this would come from API
  const isOutOfStock = Math.random() < 0.05; // 5% chance out of stock

  // Handle color swatch click - changes the actual product image
  const handleColorChange = (swatch: typeof COLOR_SWATCHES[0]) => {
    setSelectedColor(swatch);
    setImageLoaded(false);
    setImageError(false);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/30 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex h-28 sm:h-32 md:h-36">{/* Responsive height */}
            {/* Image */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0">{/* Responsive image size */}
              {!imageLoaded && (
                <Skeleton className="absolute inset-0 rounded-l-lg" />
              )}
              <img
                src={design.thumbSrc}
                alt={design.name}
                className={cn(
                  "w-full h-full object-cover rounded-l-lg transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Featured Badge */}
              {design.featured && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-4 flex justify-between">{/* Responsive padding */}
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {design.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {design.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{design.creator}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">${design.price}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{design.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{design.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{design.likes.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {design.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 sm:gap-2 ml-2 sm:ml-4">{/* Smaller gaps on mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSave(design.id)}
                  className={cn("h-7 w-7 sm:h-8 sm:w-8 p-0 touch:h-11 touch:w-11", isSaved && "bg-primary/10 border-primary text-primary")}
                >
                  <Heart className={cn("h-3 w-3", isSaved && "fill-current")} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickView(design)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch:h-11 touch:w-11"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onOpenInStudio(design)}
                  className="h-7 sm:h-8 px-2 sm:px-3 bg-primary hover:bg-primary/90 touch:h-11 touch:px-4"
                >
                  {isUnlocked ? <Palette className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
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
          onClick={() => onQuickView(design)}
          onMouseEnter={() => setShowSwatches(true)}
          onMouseLeave={() => setShowSwatches(false)}
        >
          {!imageLoaded && (
            <Skeleton className="absolute inset-0" />
          )}
          <img
            src={design.thumbSrc}
            alt={design.name}
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
          
          {/* Featured Badge */}
          {design.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium shadow-lg">
              Featured
            </Badge>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(design.id);
                }}
                className={cn(
                  "h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg",
                  isSaved && "bg-primary text-primary-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
              </Button>
              
              {onAddToCart && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(design);
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
                    onShare(design);
                  }}
                  className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Color Swatches */}
          {showSwatches && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {COLOR_SWATCHES.slice(0, 4).map((swatch) => (
                <div
                  key={swatch.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(swatch);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-sm",
                    selectedColor.id === swatch.id 
                      ? "border-white scale-110" 
                      : "border-white/70 hover:border-white"
                  )}
                  style={{ backgroundColor: swatch.color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">{/* Responsive padding and spacing */}
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 
                className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 cursor-pointer text-xs sm:text-sm leading-tight"
                onClick={() => onQuickView(design)}
              >
                {design.name}
              </h3>
              <span className="text-sm sm:text-lg font-bold text-primary">${design.price}</span>{/* Responsive price */}
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">{/* Responsive avatar */}
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {design.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">{design.creator}</span>{/* Responsive text */}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{design.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{design.views > 1000 ? `${Math.floor(design.views/1000)}k` : design.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{design.likes > 1000 ? `${Math.floor(design.likes/1000)}k` : design.likes}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {design.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {design.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{design.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Size Selection */}
          {showSwatches && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Size:</span>
              <div className="flex gap-1">
                {SIZE_OPTIONS.slice(0, 4).map((size) => (
                  <Badge
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={cn(
                      "text-xs cursor-pointer transition-all duration-200 h-6 w-7 flex items-center justify-center p-0",
                      selectedSize === size 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:border-primary/50"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onOpenInStudio(design)}
            className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 rounded-lg touch:h-12"
          >
            {isUnlocked ? (
              <>
                <Palette className="h-4 w-4 mr-2" />
                Customize
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Buy to Customize
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}