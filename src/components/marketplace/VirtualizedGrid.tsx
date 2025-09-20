import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';

interface VirtualizedGridProps {
  items: StudioGarmentData[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onSave: (designId: string) => void;
  onQuickView: (design: StudioGarmentData) => void;
  onOpenInStudio: (design: StudioGarmentData) => void;
  onAddToCart: (design: StudioGarmentData) => void;
  onShare: (design: StudioGarmentData) => void;
  isSaved: (designId: string) => boolean;
  isUnlocked: (designId: string) => boolean;
}

export const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  viewMode,
  isLoading,
  ...handlers
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);
  const [scrollTop, setScrollTop] = useState(0);

  const itemHeight = viewMode === 'grid' ? 350 : 200;
  const itemsPerRow = viewMode === 'grid' ? 4 : 1;
  const rows = Math.ceil(items.length / itemsPerRow);

  const { visibleStartIndex, visibleEndIndex, totalHeight, offsetY } = useVirtualScroll(
    rows,
    { itemHeight, containerHeight, overscan: 2 }
  );

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleItems = useMemo(() => {
    const start = visibleStartIndex * itemsPerRow;
    const end = Math.min((visibleEndIndex + 1) * itemsPerRow, items.length);
    return items.slice(start, end);
  }, [items, visibleStartIndex, visibleEndIndex, itemsPerRow]);

  if (isLoading) {
    return (
      <div className={cn(
        "gap-6",
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "space-y-4"
      )}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto modern-scroll will-change-scroll"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            willChange: 'transform',
          }}
          className={cn(
            "gap-6",
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "space-y-4"
          )}
        >
          {visibleItems.map((design) => (
            <ProductCard
              key={design.id}
              design={design}
              viewMode={viewMode}
              isSaved={handlers.isSaved(design.id)}
              isUnlocked={handlers.isUnlocked(design.id)}
              onSave={handlers.onSave}
              onQuickView={handlers.onQuickView}
              onOpenInStudio={handlers.onOpenInStudio}
              onAddToCart={handlers.onAddToCart}
              onShare={handlers.onShare}
            />
          ))}
        </div>
      </div>
    </div>
  );
};