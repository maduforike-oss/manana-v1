import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onPullToRefresh?: () => void;
  showScrollIndicator?: boolean;
  virtualScrolling?: boolean;
  itemHeight?: number;
  overscan?: number;
}

export const MobileScrollArea = ({
  children,
  className,
  enablePullToRefresh = false,
  onPullToRefresh,
  showScrollIndicator = true,
  virtualScrolling = false,
  itemHeight = 100,
  overscan = 5
}: MobileScrollAreaProps) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(false);
  const [scrollThumbPosition, setScrollThumbPosition] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(0);
  
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const updateScrollIndicator = () => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollableHeight = scrollHeight - clientHeight;
    
    if (scrollableHeight <= 0) {
      setScrollIndicatorVisible(false);
      return;
    }

    setScrollIndicatorVisible(true);
    const thumbHeight = Math.max((clientHeight / scrollHeight) * 100, 10);
    const thumbPosition = (scrollTop / scrollableHeight) * (100 - thumbHeight);
    
    setScrollThumbHeight(thumbHeight);
    setScrollThumbPosition(thumbPosition);
  };

  const handleScroll = () => {
    updateScrollIndicator();
    
    // Auto-hide scroll indicator
    setTimeout(() => {
      setScrollIndicatorVisible(false);
    }, 1000);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!enablePullToRefresh || !scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.current || !enablePullToRefresh) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, 80);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current || !enablePullToRefresh) return;
    
    isPulling.current = false;
    
    if (pullDistance > 60 && onPullToRefresh) {
      setIsRefreshing(true);
      onPullToRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    if (enablePullToRefresh) {
      scrollElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      scrollElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      scrollElement.addEventListener('touchend', handleTouchEnd);
    }

    updateScrollIndicator();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (enablePullToRefresh) {
        scrollElement.removeEventListener('touchstart', handleTouchStart);
        scrollElement.removeEventListener('touchmove', handleTouchMove);
        scrollElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [enablePullToRefresh]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          'overflow-auto',
          isMobile ? 'momentum-scroll touch-momentum' : 'modern-scroll',
          enablePullToRefresh && 'pull-to-refresh',
          className
        )}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Pull to refresh indicator */}
        {enablePullToRefresh && pullDistance > 0 && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 text-sm text-muted-foreground transform -translate-y-full">
            {isRefreshing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </div>
            ) : pullDistance > 60 ? (
              "Release to refresh"
            ) : (
              "Pull to refresh"
            )}
          </div>
        )}
        
        {children}
      </div>

      {/* Custom scroll indicator for mobile */}
      {showScrollIndicator && scrollIndicatorVisible && isMobile && (
        <div className="scroll-indicator visible">
          <div 
            className="scroll-thumb"
            style={{
              height: `${scrollThumbHeight}%`,
              transform: `translateY(${scrollThumbPosition}%)`
            }}
          />
        </div>
      )}
    </div>
  );
};