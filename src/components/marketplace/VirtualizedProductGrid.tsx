import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';

interface VirtualizedProductGridProps {
  designs: StudioGarmentData[];
  isLoading?: boolean;
  isSaved: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  onSave: (designId: string) => void;
  onQuickView: (design: StudioGarmentData) => void;
  onOpenInStudio: (design: StudioGarmentData) => void;
  onAddToCart?: (design: StudioGarmentData) => void;
  onShare?: (design: StudioGarmentData) => void;
  className?: string;
}

const COLS = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
  large: 5,
  xl: 6
};

export function VirtualizedProductGrid({
  designs,
  isLoading = false,
  isSaved,
  isUnlocked,
  onSave,
  onQuickView,
  onOpenInStudio,
  onAddToCart,
  onShare,
  className
}: VirtualizedProductGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate columns based on container width
  const getColumns = useCallback(() => {
    if (typeof window === 'undefined') return COLS.mobile;
    const width = window.innerWidth;
    if (width >= 1536) return COLS.xl;
    if (width >= 1280) return COLS.large;
    if (width >= 1024) return COLS.desktop;
    if (width >= 640) return COLS.tablet;
    return COLS.mobile;
  }, []);

  const columns = getColumns();
  const rows = Math.ceil(designs.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Estimated card height
    overscan: 2
  });

  const items = virtualizer.getVirtualItems();

  // Responsive grid classes
  const gridClasses = useMemo(() => {
    return cn(
      "grid gap-3 sm:gap-4 lg:gap-6",
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    );
  }, []);

  // Fallback to regular grid for small lists
  if (designs.length <= 20) {
    return (
      <div className={cn(gridClasses, className)}>
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          designs.map((design) => (
            <ProductCard
              key={design.id}
              design={design}
              viewMode="grid"
              isSaved={isSaved(design.id)}
              isUnlocked={isUnlocked(design.id)}
              onSave={onSave}
              onQuickView={onQuickView}
              onOpenInStudio={onOpenInStudio}
              onAddToCart={onAddToCart}
              onShare={onShare}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn("h-[80vh] overflow-auto", className)}
      style={{
        scrollBehavior: 'smooth'
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative'
        }}
      >
        {items.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, designs.length);
          const rowDesigns = designs.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className={gridClasses}>
                {rowDesigns.map((design) => (
                  <ProductCard
                    key={design.id}
                    design={design}
                    viewMode="grid"
                    isSaved={isSaved(design.id)}
                    isUnlocked={isUnlocked(design.id)}
                    onSave={onSave}
                    onQuickView={onQuickView}
                    onOpenInStudio={onOpenInStudio}
                    onAddToCart={onAddToCart}
                    onShare={onShare}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}