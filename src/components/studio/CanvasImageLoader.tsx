import React, { useState, useEffect, useMemo } from 'react';
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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setHasError(false);
    
    const loadImage = async () => {
      try {
        const resolvedImage = await getGarmentImage(garmentId, orientation, color);
        if (mounted) {
          if (resolvedImage) {
            // Validate image before setting
            const testImg = new window.Image();
            testImg.onload = () => {
              if (mounted) {
                setImageSrc(resolvedImage);
                setIsLoading(false);
              }
            };
            testImg.onerror = () => {
              if (mounted) {
                console.warn('Image failed to load:', resolvedImage);
                setImageSrc(fallbackSrc || null);
                setHasError(true);
                setIsLoading(false);
              }
            };
            testImg.src = resolvedImage;
          } else {
            setImageSrc(fallbackSrc || null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.warn('Failed to load garment image:', error);
        if (mounted) {
          setImageSrc(fallbackSrc || null);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    return () => { mounted = false; };
  }, [garmentId, orientation, color, fallbackSrc]);

  if (isLoading) {
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className || ''}`} style={style}>
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading garment...
        </div>
      </div>
    );
  }

  if (!imageSrc) {
    // No image available - render placeholder or children
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className || ''}`} style={style}>
        {children || (
          <div className="text-muted-foreground text-sm">
            {hasError ? 'Failed to load image' : 'No image available'}
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
      onLoad={() => {
        console.log('Garment image loaded successfully:', imageSrc);
        onLoad?.();
      }}
      onError={(e) => {
        console.error('Garment image failed to render:', imageSrc, e);
        setHasError(true);
        setImageSrc(fallbackSrc || null);
        onError?.();
      }}
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