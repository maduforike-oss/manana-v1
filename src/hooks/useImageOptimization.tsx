import { useState, useCallback } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg';
  fallback?: string;
}

export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());

  const getOptimizedImageUrl = useCallback(
    (src: string, options: ImageOptimizationOptions = {}) => {
      const { quality = 80, format = 'webp', fallback } = options;
      
      // Check if browser supports modern formats
      const supportsWebP = typeof Image !== 'undefined';
      if (supportsWebP) {
        const img = new Image();
        img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      }
      
      if (src.startsWith('http') || src.startsWith('/')) {
        // For external or absolute URLs, return as-is or with fallback
        if (format === 'webp' && !supportsWebP && fallback) {
          return fallback;
        }
        return src;
      }
      
      // For local images, apply optimization
      const extension = format === 'avif' ? '.avif' : format === 'webp' ? '.webp' : '.jpg';
      const optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, extension);
      
      return optimizedSrc;
    },
    []
  );

  const preloadImage = useCallback((src: string) => {
    if (loadedImages.has(src)) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [loadedImages]);

  const isImageLoaded = useCallback(
    (src: string) => loadedImages.has(src),
    [loadedImages]
  );

  return {
    getOptimizedImageUrl,
    preloadImage,
    isImageLoaded,
  };
};