import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  visibleStartIndex: number;
  visibleEndIndex: number;
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
}

export const useVirtualScroll = (
  itemCount: number,
  { itemHeight, containerHeight, overscan = 5 }: UseVirtualScrollOptions
): VirtualScrollResult => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  const scrollToIndex = useCallback(
    (index: number) => {
      const targetScrollTop = index * itemHeight;
      setScrollTop(targetScrollTop);
    },
    [itemHeight]
  );

  return useMemo(
    () => ({
      visibleStartIndex,
      visibleEndIndex,
      totalHeight,
      offsetY,
      scrollToIndex,
    }),
    [visibleStartIndex, visibleEndIndex, totalHeight, offsetY, scrollToIndex]
  );
};