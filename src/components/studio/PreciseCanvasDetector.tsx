import React, { useEffect, useRef, useCallback } from 'react';

interface PreciseCanvasDetectorProps {
  canvasElement: HTMLElement | null;
  onBoundsUpdate: (rect: DOMRect) => void;
  onPointInCanvas: (x: number, y: number, isInCanvas: boolean) => void;
  children?: React.ReactNode;
}

/**
 * Precise canvas boundary detection that tracks the exact drawable area
 * and provides accurate in/out canvas detection for cursor management
 */
export const PreciseCanvasDetector: React.FC<PreciseCanvasDetectorProps> = ({
  canvasElement,
  onBoundsUpdate,
  onPointInCanvas,
  children
}) => {
  const lastBoundsRef = useRef<DOMRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  // Get precise canvas bounds including any padding/borders
  const getPreciseCanvasBounds = useCallback(() => {
    if (!canvasElement) return null;

    const rect = canvasElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(canvasElement);
    
    // Account for borders and padding to get the actual drawable area
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
    
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

    // Calculate the precise drawable area
    const drawableRect = new DOMRect(
      rect.left + borderLeft + paddingLeft,
      rect.top + borderTop + paddingTop,
      rect.width - borderLeft - borderRight - paddingLeft - paddingRight,
      rect.height - borderTop - borderBottom - paddingTop - paddingBottom
    );

    return drawableRect;
  }, [canvasElement]);

  // Check if point is precisely within canvas bounds
  const isPointInPreciseCanvas = useCallback((x: number, y: number): boolean => {
    const bounds = getPreciseCanvasBounds();
    if (!bounds) return false;

    return (
      x >= bounds.left &&
      x <= bounds.left + bounds.width &&
      y >= bounds.top &&
      y <= bounds.top + bounds.height
    );
  }, [getPreciseCanvasBounds]);

  // Update bounds with high frequency for accuracy
  const updateBounds = useCallback(() => {
    const newBounds = getPreciseCanvasBounds();
    if (!newBounds) return;

    // Only update if bounds actually changed to avoid unnecessary re-renders
    const lastBounds = lastBoundsRef.current;
    if (!lastBounds || 
        lastBounds.left !== newBounds.left ||
        lastBounds.top !== newBounds.top ||
        lastBounds.width !== newBounds.width ||
        lastBounds.height !== newBounds.height) {
      
      lastBoundsRef.current = newBounds;
      onBoundsUpdate(newBounds);
    }
  }, [getPreciseCanvasBounds, onBoundsUpdate]);

  // Set up precise mouse tracking for canvas detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isInCanvas = isPointInPreciseCanvas(e.clientX, e.clientY);
      onPointInCanvas(e.clientX, e.clientY, isInCanvas);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isPointInPreciseCanvas, onPointInCanvas]);

  // Set up resize observer for canvas element changes
  useEffect(() => {
    if (!canvasElement) return;

    // Initial bounds update
    updateBounds();

    // Create resize observer for precise tracking
    observerRef.current = new ResizeObserver(() => {
      // Use RAF to debounce rapid resize events
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateBounds);
    });

    observerRef.current.observe(canvasElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [canvasElement, updateBounds]);

  // Also track window resize for viewport changes
  useEffect(() => {
    const handleWindowResize = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateBounds);
    };

    window.addEventListener('resize', handleWindowResize, { passive: true });
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [updateBounds]);

  return <>{children}</>;
};