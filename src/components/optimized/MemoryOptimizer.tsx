import { useEffect } from 'react';

// Memory cleanup utilities
export const useMemoryOptimizer = () => {
  useEffect(() => {
    const cleanup = () => {
      // Force garbage collection in development
      if (process.env.NODE_ENV === 'development' && (window as any).gc) {
        (window as any).gc();
      }
      
      // Clear any remaining timeouts or intervals - simplified approach
      if (typeof window !== 'undefined') {
        // Clear image cache and force cleanup
        const imageElements = document.querySelectorAll('img');
        imageElements.forEach(img => {
          if (!img.closest('[data-keep-cache]')) {
            img.removeAttribute('src');
          }
        });
      }
      
      // Clear cached images if memory is low
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB threshold
          console.warn('High memory usage detected, clearing image cache');
          // Clear image cache if available
          if ('caches' in window) {
            caches.delete('images');
          }
        }
      }
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // Periodic cleanup every 5 minutes
    const intervalId = setInterval(cleanup, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      clearInterval(intervalId);
    };
  }, []);
};

// Image cache management
export const createImageCache = () => {
  const cache = new Map<string, HTMLImageElement>();
  const maxCacheSize = 50; // Maximum number of images to cache

  return {
    get: (src: string) => cache.get(src),
    set: (src: string, img: HTMLImageElement) => {
      if (cache.size >= maxCacheSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(src, img);
    },
    clear: () => cache.clear(),
    size: () => cache.size
  };
};

// Debounced resize observer for performance
export const createDebouncedResizeObserver = (
  callback: (entries: ResizeObserverEntry[]) => void,
  delay = 100
) => {
  let timeout: NodeJS.Timeout;
  
  return new ResizeObserver((entries) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(entries), delay);
  });
};