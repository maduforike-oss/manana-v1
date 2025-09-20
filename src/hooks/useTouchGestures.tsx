import { useEffect, useRef, useCallback } from 'react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

interface GestureState {
  touches: Map<number, TouchPoint>;
  lastGesture: string | null;
  isDrawing: boolean;
  isPalmRejected: boolean;
}

interface UseTouchGesturesOptions {
  onSingleTouch?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
  onTwoFingerTap?: () => void;
  onThreeFingerTap?: () => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }) => void;
  enablePalmRejection?: boolean;
  minPressureThreshold?: number;
}

export const useTouchGestures = (
  elementRef: React.RefObject<HTMLElement>,
  options: UseTouchGesturesOptions = {}
) => {
  const gestureState = useRef<GestureState>({
    touches: new Map(),
    lastGesture: null,
    isDrawing: false,
    isPalmRejected: false
  });

  const {
    onSingleTouch,
    onTouchMove,
    onTouchEnd,
    onTwoFingerTap,
    onThreeFingerTap,
    onPinch,
    onPan,
    enablePalmRejection = true,
    minPressureThreshold = 0.1
  } = options;

  // Detect if touch is from stylus/Apple Pencil
  const isStylusTouch = useCallback((touch: Touch): boolean => {
    // Check for stylus-specific properties
    return (
      (touch as any).touchType === 'stylus' ||
      (touch as any).force > 0 ||
      (touch as any).pressure > 0 ||
      (touch.radiusX < 5 && touch.radiusY < 5) // Small contact area indicates stylus
    );
  }, []);

  // Palm rejection logic
  const isPalmTouch = useCallback((touch: Touch): boolean => {
    if (!enablePalmRejection) return false;
    
    // Large contact area suggests palm
    const contactArea = Math.PI * touch.radiusX * touch.radiusY;
    const isLargeTouch = contactArea > 200;
    
    // Multiple simultaneous touches with one large touch suggests palm
    const currentTouches = gestureState.current.touches.size;
    
    return isLargeTouch && currentTouches > 0;
  }, [enablePalmRejection]);

  // Convert touch to TouchPoint
  const touchToPoint = useCallback((touch: Touch): TouchPoint => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
    pressure: (touch as any).force || (touch as any).pressure || 1,
    timestamp: Date.now()
  }), []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      // Skip palm touches
      if (isPalmTouch(touch)) {
        gestureState.current.isPalmRejected = true;
        return;
      }

      const point = touchToPoint(touch);
      gestureState.current.touches.set(touch.identifier, point);

      // Handle single touch for drawing
      if (gestureState.current.touches.size === 1 && isStylusTouch(touch)) {
        gestureState.current.isDrawing = true;
        onSingleTouch?.(point);
      }
    });
  }, [isPalmTouch, touchToPoint, isStylusTouch, onSingleTouch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const existingTouch = gestureState.current.touches.get(touch.identifier);
      if (!existingTouch || gestureState.current.isPalmRejected) return;

      const point = touchToPoint(touch);
      gestureState.current.touches.set(touch.identifier, point);

      // Handle drawing for single stylus touch
      if (gestureState.current.touches.size === 1 && gestureState.current.isDrawing) {
        onTouchMove?.(point);
      }
      
      // Handle two-finger gestures (pan/pinch)
      else if (gestureState.current.touches.size === 2) {
        const touches = Array.from(gestureState.current.touches.values());
        const [touch1, touch2] = touches;
        
        // Calculate gesture data
        const centerX = (touch1.x + touch2.x) / 2;
        const centerY = (touch1.y + touch2.y) / 2;
        const distance = Math.sqrt(
          Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
        );
        
        // Store initial distance for pinch detection
        if (!gestureState.current.lastGesture) {
          gestureState.current.lastGesture = `pinch_${distance}`;
        } else if (gestureState.current.lastGesture.startsWith('pinch_')) {
          const initialDistance = parseFloat(gestureState.current.lastGesture.split('_')[1]);
          const scale = distance / initialDistance;
          onPinch?.(scale, { x: centerX, y: centerY });
        }
      }
    });
  }, [touchToPoint, onTouchMove, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const point = gestureState.current.touches.get(touch.identifier);
      if (point) {
        onTouchEnd?.(point);
        gestureState.current.touches.delete(touch.identifier);
      }
    });

    // Handle tap gestures
    if (gestureState.current.touches.size === 0) {
      const touchCount = e.changedTouches.length;
      
      if (touchCount === 2) {
        onTwoFingerTap?.();
      } else if (touchCount === 3) {
        onThreeFingerTap?.();
      }
      
      // Reset state
      gestureState.current.isDrawing = false;
      gestureState.current.isPalmRejected = false;
      gestureState.current.lastGesture = null;
    }
  }, [onTouchEnd, onTwoFingerTap, onThreeFingerTap]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use passive: false to allow preventDefault
    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isDrawing: gestureState.current.isDrawing,
    touchCount: gestureState.current.touches.size,
    isPalmRejected: gestureState.current.isPalmRejected
  };
};