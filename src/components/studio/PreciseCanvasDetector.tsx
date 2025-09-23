import React, { useEffect, useRef, useCallback } from 'react';

interface CanvasBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface PreciseCanvasDetectorProps {
  containerRef: React.RefObject<HTMLElement>;
  onBoundsChange?: (bounds: CanvasBounds | null) => void;
  onPointerEnter?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent, isInCanvas: boolean) => void;
  children?: React.ReactNode;
}

export const PreciseCanvasDetector: React.FC<PreciseCanvasDetectorProps> = ({
  containerRef,
  onBoundsChange,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  children
}) => {
  const boundsRef = useRef<CanvasBounds | null>(null);
  const isInCanvasRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Get precise canvas boundaries
  const updateCanvasBounds = useCallback(() => {
    if (!containerRef.current) {
      boundsRef.current = null;
      onBoundsChange?.(null);
      return;
    }

    // Find the actual drawable canvas area
    const canvasElement = containerRef.current.querySelector('canvas');
    const targetElement = canvasElement || containerRef.current;
    
    const rect = targetElement.getBoundingClientRect();
    const bounds: CanvasBounds = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    };

    boundsRef.current = bounds;
    onBoundsChange?.(bounds);
  }, [containerRef, onBoundsChange]);

  // Debounced bounds update for performance
  const debouncedUpdateBounds = useCallback(() => {
    clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(updateCanvasBounds, 16); // ~60fps
  }, [updateCanvasBounds]);

  // Check if point is within canvas
  const isPointInCanvas = useCallback((clientX: number, clientY: number): boolean => {
    const bounds = boundsRef.current;
    if (!bounds) return false;
    
    return (
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom
    );
  }, []);

  // Handle pointer movement
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const inCanvas = isPointInCanvas(e.clientX, e.clientY);
    const wasInCanvas = isInCanvasRef.current;
    
    // Update state
    isInCanvasRef.current = inCanvas;
    
    // Trigger callbacks
    onPointerMove?.(e, inCanvas);
    
    // Handle enter/leave events
    if (inCanvas && !wasInCanvas) {
      onPointerEnter?.(e);
    } else if (!inCanvas && wasInCanvas) {
      onPointerLeave?.(e);
    }
  }, [isPointInCanvas, onPointerMove, onPointerEnter, onPointerLeave]);

  // Set up resize observer for canvas bounds
  useEffect(() => {
    const resizeObserver = new ResizeObserver(debouncedUpdateBounds);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      
      // Also observe the canvas element if it exists
      const canvasElement = containerRef.current.querySelector('canvas');
      if (canvasElement) {
        resizeObserver.observe(canvasElement);
      }
    }
    
    // Initial bounds calculation
    updateCanvasBounds();
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(updateTimeoutRef.current);
    };
  }, [containerRef, debouncedUpdateBounds, updateCanvasBounds]);

  // Set up scroll listener for bounds updates
  useEffect(() => {
    const handleScroll = debouncedUpdateBounds;
    
    document.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedUpdateBounds]);

  // Set up pointer event listeners
  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  return <>{children}</>;
};

// Hook for using canvas detection
export const useCanvasDetection = (containerRef: React.RefObject<HTMLElement>) => {
  const [bounds, setBounds] = React.useState<CanvasBounds | null>(null);
  const [isInCanvas, setIsInCanvas] = React.useState(false);
  
  const handleBoundsChange = React.useCallback((newBounds: CanvasBounds | null) => {
    setBounds(newBounds);
  }, []);
  
  const handlePointerEnter = React.useCallback(() => {
    setIsInCanvas(true);
  }, []);
  
  const handlePointerLeave = React.useCallback(() => {
    setIsInCanvas(false);
  }, []);
  
  const handlePointerMove = React.useCallback((e: PointerEvent, inCanvas: boolean) => {
    setIsInCanvas(inCanvas);
  }, []);
  
  return {
    bounds,
    isInCanvas,
    PreciseCanvasDetector: React.useMemo(() => (props: Omit<PreciseCanvasDetectorProps, 'containerRef' | 'onBoundsChange' | 'onPointerEnter' | 'onPointerLeave' | 'onPointerMove'>) => (
      <PreciseCanvasDetector
        containerRef={containerRef}
        onBoundsChange={handleBoundsChange}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        {...props}
      />
    ), [containerRef, handleBoundsChange, handlePointerEnter, handlePointerLeave, handlePointerMove])
  };
};