import React, { useMemo } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { getGarmentImage, getAllGarmentImages } from '@/lib/studio/imageMapping';

interface CanvasImageLoaderProps {
  garmentId: string;
  orientation?: 'front' | 'back' | 'left' | 'right';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  children?: React.ReactNode;
}

/**
 * Smart image loader that automatically resolves garment images from:
 * 1. Custom uploaded images (highest priority)
 * 2. Static garment assets
 * 3. Mockup images for canvas use
 * 4. Fallback image
 */
export const CanvasImageLoader: React.FC<CanvasImageLoaderProps> = ({
  garmentId,
  orientation = 'front',
  color = 'white',
  className,
  style,
  onLoad,
  onError,
  fallbackSrc,
  children,
}) => {
  const imageSrc = useMemo(() => {
    const resolvedImage = getGarmentImage(garmentId, orientation, color);
    return resolvedImage || fallbackSrc;
  }, [garmentId, orientation, color, fallbackSrc]);

  if (!imageSrc) {
    // No image available - render placeholder or children
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className || ''}`} style={style}>
        {children || (
          <div className="text-muted-foreground text-sm">
            No image available
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={`${garmentId} ${orientation} view`}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

/**
 * Hook to get all available images for a garment
 */
export const useGarmentImages = (garmentId: string) => {
  return useMemo(() => {
    return getAllGarmentImages(garmentId);
  }, [garmentId]);
};

/**
 * Hook to get a specific garment image
 */
export const useGarmentImage = (garmentId: string, orientation: 'front' | 'back' | 'left' | 'right' = 'front', color: string = 'white') => {
  return useMemo(() => {
    return getGarmentImage(garmentId, orientation, color);
  }, [garmentId, orientation, color]);
};