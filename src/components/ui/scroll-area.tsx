import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  enablePullToRefresh?: boolean;
  onPullToRefresh?: () => void;
  nativeScroll?: boolean;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, enablePullToRefresh, onPullToRefresh, nativeScroll, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);
  const isPulling = React.useRef(false);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (!enablePullToRefresh || !viewportRef.current) return;
    
    const scrollTop = viewportRef.current.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [enablePullToRefresh]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isPulling.current || !enablePullToRefresh) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, 80);
      setPullDistance(distance);
    }
  }, [enablePullToRefresh]);

  const handleTouchEnd = React.useCallback(() => {
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
  }, [pullDistance, enablePullToRefresh, onPullToRefresh]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enablePullToRefresh) return;

    viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd);

    return () => {
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enablePullToRefresh]);

  if (nativeScroll || isMobile) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-auto momentum-scroll touch-momentum",
          enablePullToRefresh && "pull-to-refresh",
          className
        )}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease-out'
        }}
        {...props}
      >
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
        <div ref={viewportRef} className="h-full w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport 
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
