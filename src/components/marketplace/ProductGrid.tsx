import { useState, useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductCardError } from './ProductCardError';
import { SearchErrorBoundary } from './SearchErrorBoundary';
import { StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  designs: StudioGarmentData[];
  viewMode: 'grid' | 'list';
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  skeletonCount?: number;
  isSaved: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  onSave: (designId: string) => void;
  onQuickView: (design: StudioGarmentData) => void;
  onOpenInStudio: (design: StudioGarmentData) => void;
  onAddToCart?: (design: StudioGarmentData) => void;
  onShare?: (design: StudioGarmentData) => void;
  className?: string;
}

export function ProductGrid({
  designs,
  viewMode,
  isLoading = false,
  hasError = false,
  onRetry,
  skeletonCount = 12,
  isSaved,
  isUnlocked,
  onSave,
  onQuickView,
  onOpenInStudio,
  onAddToCart,
  onShare,
  className
}: ProductGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (designId: string) => {
    setImageErrors(prev => new Set(prev).add(designId));
  };

  const handleRetryImage = (designId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(designId);
      return newSet;
    });
  };

  const gridClasses = useMemo(() => {
    if (viewMode === 'list') {
      return "space-y-3 sm:space-y-4";
    }
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6";
  }, [viewMode]);

  // Error boundary for the entire grid
  if (hasError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="font-semibold text-destructive mb-2">Failed to load products</h3>
        <p className="text-muted-foreground mb-4">
          Something went wrong while loading the product grid.
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <SearchErrorBoundary>
      <div className={cn(gridClasses, className)}>
        {isLoading ? (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} viewMode={viewMode} />
          ))
        ) : (
          designs.map((design) => {
            const hasImageError = imageErrors.has(design.id);
            
            if (hasImageError) {
              return (
                <ProductCardError
                  key={design.id}
                  title="Image failed to load"
                  message="Click to retry"
                  onRetry={() => handleRetryImage(design.id)}
                  viewMode={viewMode}
                />
              );
            }

            return (
              <ProductCard
                key={design.id}
                design={design}
                viewMode={viewMode}
                isSaved={isSaved(design.id)}
                isUnlocked={isUnlocked(design.id)}
                onSave={onSave}
                onQuickView={onQuickView}
                onOpenInStudio={onOpenInStudio}
                onAddToCart={onAddToCart}
                onShare={onShare}
                hasError={hasImageError}
                onRetry={() => handleRetryImage(design.id)}
              />
            );
          })
        )}
      </div>
    </SearchErrorBoundary>
  );
}