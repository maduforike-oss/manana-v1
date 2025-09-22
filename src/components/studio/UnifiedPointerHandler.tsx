import React, { useEffect, useRef, useCallback } from 'react';
import { useUnifiedCoordinates } from './UnifiedCoordinateSystem';
import { useUnifiedCursor } from './UnifiedCursorSystem';

interface UnifiedPointerHandlerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onPointerEvent?: (event: PointerEvent, type: 'down' | 'move' | 'up') => void;
}

export const UnifiedPointerHandler: React.FC<UnifiedPointerHandlerProps> = ({ 
  containerRef, 
  onPointerEvent 
}) => {
  const { updateCanvasRect } = useUnifiedCoordinates();
  const { updateCursorPosition, setInputType, showCursor, hideCursor } = useUnifiedCursor();
  const isTrackingRef = useRef(false);

  // Detect input type from pointer event
  const detectInputType = useCallback((e: PointerEvent): 'mouse' | 'pen' | 'touch' => {
    if (e.pointerType === 'pen') return 'pen';
    if (e.pointerType === 'touch') return 'touch';
    return 'mouse';
  }, []);

  // Update canvas rect when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateRect = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateCanvasRect(rect);
      }
    };

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(containerRef.current);
    updateRect(); // Initial update

    return () => resizeObserver.disconnect();
  }, [containerRef, updateCanvasRect]);

  // Unified pointer event handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const inputType = detectInputType(e);
      setInputType(inputType);
      updateCursorPosition(e.clientX, e.clientY);
      
      if (isTrackingRef.current) {
        onPointerEvent?.(e, 'move');
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isTrackingRef.current = true;
      const inputType = detectInputType(e);
      setInputType(inputType);
      onPointerEvent?.(e, 'down');
    };

    const handlePointerUp = (e: PointerEvent) => {
      isTrackingRef.current = false;
      onPointerEvent?.(e, 'up');
    };

    const handlePointerEnter = (e: PointerEvent) => {
      // Update canvas rect immediately on enter for precise boundary detection
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateCanvasRect(rect);
      }
      
      const inputType = detectInputType(e);
      if (inputType !== 'touch') { // Don't show cursor for touch
        showCursor();
      }
    };

    const handlePointerLeave = () => {
      hideCursor();
      isTrackingRef.current = false;
    };

    // Add event listeners with proper options
    container.addEventListener('pointermove', handlePointerMove, { passive: false });
    container.addEventListener('pointerdown', handlePointerDown, { passive: false });
    container.addEventListener('pointerup', handlePointerUp, { passive: false });
    container.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // Prevent default touch behaviors for drawing
    const handleTouchStart = (e: TouchEvent) => {
      if (isTrackingRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTrackingRef.current) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef, onPointerEvent, detectInputType, setInputType, updateCursorPosition, showCursor, hideCursor]);

  return null; // This component doesn't render anything
};