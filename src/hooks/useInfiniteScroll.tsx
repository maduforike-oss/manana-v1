import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const useInfiniteScroll = ({
  threshold = 100,
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollOptions) => {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !isFetching) {
        setIsFetching(true);
        onLoadMore();
      }
    },
    [hasMore, isLoading, isFetching, onLoadMore]
  );

  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      });

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  useEffect(() => {
    if (!isLoading) {
      setIsFetching(false);
    }
  }, [isLoading]);

  return { loadMoreRef };
};