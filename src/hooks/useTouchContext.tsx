import { useState, useEffect, useCallback, useRef } from 'react';

export type TouchContext = 'scroll' | 'draw' | 'zoom' | 'idle';

interface TouchContextState {
  context: TouchContext;
  isDrawing: boolean;
  touchCount: number;
  gestureVelocity: { x: number; y: number };
}

interface UseTouchContextOptions {
  drawingThreshold?: number;
  gestureTimeout?: number;
  velocityThreshold?: number;
}

export const useTouchContext = ({
  drawingThreshold = 5,
  gestureTimeout = 300,
  velocityThreshold = 0.5
}: UseTouchContextOptions = {}) => {
  const [contextState, setContextState] = useState<TouchContextState>({
    context: 'idle',
    isDrawing: false,
    touchCount: 0,
    gestureVelocity: { x: 0, y: 0 }
  });

  const lastTouchTime = useRef<number>(0);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const resetContext = useCallback(() => {
    setContextState(prev => ({
      ...prev,
      context: 'idle',
      isDrawing: false,
      touchCount: 0,
      gestureVelocity: { x: 0, y: 0 }
    }));
    startPosition.current = null;
    lastPosition.current = null;
    velocityRef.current = { x: 0, y: 0 };
  }, []);

  const updateContext = useCallback((newContext: TouchContext) => {
    setContextState(prev => ({
      ...prev,
      context: newContext
    }));
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const now = Date.now();
    const touches = event.touches;
    const touch = touches[0];

    setContextState(prev => ({
      ...prev,
      touchCount: touches.length
    }));

    if (touches.length === 1) {
      startPosition.current = { x: touch.clientX, y: touch.clientY };
      lastPosition.current = { x: touch.clientX, y: touch.clientY };
      lastTouchTime.current = now;
    } else if (touches.length === 2) {
      updateContext('zoom');
    }
  }, [updateContext]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const now = Date.now();
    const touches = event.touches;
    const touch = touches[0];

    if (touches.length === 1 && startPosition.current && lastPosition.current) {
      const deltaX = touch.clientX - startPosition.current.x;
      const deltaY = touch.clientY - startPosition.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Calculate velocity
      const deltaTime = now - lastTouchTime.current;
      if (deltaTime > 0) {
        velocityRef.current = {
          x: (touch.clientX - lastPosition.current.x) / deltaTime,
          y: (touch.clientY - lastPosition.current.y) / deltaTime
        };
      }

      // Determine context based on movement
      if (distance > drawingThreshold) {
        const velocity = Math.sqrt(
          velocityRef.current.x * velocityRef.current.x + 
          velocityRef.current.y * velocityRef.current.y
        );

        if (velocity < velocityThreshold) {
          // Slow, deliberate movement - likely drawing
          setContextState(prev => ({
            ...prev,
            context: 'draw',
            isDrawing: true,
            gestureVelocity: velocityRef.current
          }));
        } else {
          // Fast movement - likely scrolling/panning
          updateContext('scroll');
        }
      }

      lastPosition.current = { x: touch.clientX, y: touch.clientY };
      lastTouchTime.current = now;
    }
  }, [drawingThreshold, velocityThreshold, updateContext]);

  const handleTouchEnd = useCallback(() => {
    // Reset context after a delay to allow for gesture completion
    setTimeout(resetContext, gestureTimeout);
  }, [resetContext, gestureTimeout]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...contextState,
    updateContext,
    resetContext
  };
};