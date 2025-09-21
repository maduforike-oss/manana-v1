import { useCallback, useEffect, useRef } from 'react';
import { CanvasMode } from './useCanvasFocus';

interface PointerRoutingConfig {
  shouldCapture: boolean;
  mode: CanvasMode;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
}

export const usePointerRouting = ({
  shouldCapture,
  mode,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: PointerRoutingConfig) => {
  const elementRef = useRef<HTMLElement>(null);
  const isCapturingRef = useRef(false);

  // Detect stylus vs finger
  const detectInputType = useCallback((e: PointerEvent) => {
    const isStylus = e.pointerType === 'pen' || 
                    (e.pressure > 0 && e.pointerType === 'touch' && e.width < 10);
    const isFinger = e.pointerType === 'touch' && !isStylus;
    const isMouse = e.pointerType === 'mouse';
    
    return { isStylus, isFinger, isMouse };
  }, []);

  // Handle pointer down
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!shouldCapture) return;
    
    const { isStylus, isFinger } = detectInputType(e);
    
    // Stylus always draws, fingers only for pan/zoom in draw mode
    if (mode === 'draw') {
      if (isStylus) {
        e.preventDefault();
        e.stopPropagation();
        isCapturingRef.current = true;
        onPointerDown?.(e);
      } else if (isFinger && e.isPrimary) {
        // Allow two-finger gestures for pan/zoom
        const touches = document.querySelectorAll('[data-pointer-id]').length;
        if (touches < 2) {
          e.preventDefault();
          e.stopPropagation();
          isCapturingRef.current = true;
          onPointerDown?.(e);
        }
      }
    } else if (mode === 'transform' || mode === 'text') {
      e.preventDefault();
      e.stopPropagation();
      isCapturingRef.current = true;
      onPointerDown?.(e);
    }
  }, [shouldCapture, mode, detectInputType, onPointerDown]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (isCapturingRef.current && shouldCapture) {
      e.preventDefault();
      e.stopPropagation();
      onPointerMove?.(e);
    }
  }, [shouldCapture, onPointerMove]);

  // Handle pointer up
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (isCapturingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isCapturingRef.current = false;
      onPointerUp?.(e);
    }
  }, [onPointerUp]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Configure touch-action based on capture state
    element.style.touchAction = shouldCapture ? 'none' : 'auto';

    if (shouldCapture) {
      // Use non-passive listeners when capturing
      element.addEventListener('pointerdown', handlePointerDown, { passive: false });
      element.addEventListener('pointermove', handlePointerMove, { passive: false });
      element.addEventListener('pointerup', handlePointerUp, { passive: false });
      element.addEventListener('pointercancel', handlePointerUp, { passive: false });
    } else {
      // Use passive listeners when not capturing
      element.addEventListener('pointerdown', handlePointerDown, { passive: true });
    }

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [shouldCapture, handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    elementRef,
    isCapturing: isCapturingRef.current
  };
};