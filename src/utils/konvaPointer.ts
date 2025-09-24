import Konva from 'konva';

export interface SmartPointerEvent {
  x: number;
  y: number;
  pressure?: number;
  pointerType?: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

export interface BrushConfig {
  onStrokeStart?: (point: SmartPointerEvent) => void;
  onStrokeMove?: (point: SmartPointerEvent) => void;
  onStrokeEnd?: (point: SmartPointerEvent) => void;
  preventPanning?: boolean;
}

/**
 * Get accurate pointer position accounting for CSS transforms, zoom, and pan
 */
export function getSmartPointer(stage: Konva.Stage): SmartPointerEvent | null {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;

  // Get the stage's current transform
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  
  // Transform the pointer position to stage coordinates
  const transformedPoint = transform.point(pointer);
  
  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
    pressure: 1, // Default pressure, can be enhanced with pointer events
  };
}

/**
 * Detect input type for better touch/stylus handling
 */
export function detectInputType(event: PointerEvent): 'mouse' | 'touch' | 'pen' {
  if (event.pointerType === 'pen') return 'pen';
  if (event.pointerType === 'touch') return 'touch';
  return 'mouse';
}

/**
 * Attach unified brush handling to a Konva stage
 */
export function attachBrush(
  stage: Konva.Stage, 
  layer: Konva.Layer, 
  config: BrushConfig = {}
): () => void {
  let isDrawing = false;
  let currentPointerId: number | null = null;

  const handlePointerDown = (e: PointerEvent) => {
    // Prevent multiple pointers from interfering
    if (isDrawing && currentPointerId !== null && e.pointerId !== currentPointerId) {
      return;
    }

    const smartPointer = getSmartPointer(stage);
    if (!smartPointer) return;

    isDrawing = true;
    currentPointerId = e.pointerId;

    // Capture the pointer to ensure we get all events
    stage.container().setPointerCapture(e.pointerId);

    // Prevent panning if configured
    if (config.preventPanning) {
      e.preventDefault();
      e.stopPropagation();
    }

    const enhancedPointer: SmartPointerEvent = {
      ...smartPointer,
      pressure: e.pressure || 1,
      pointerType: e.pointerType,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    };

    config.onStrokeStart?.(enhancedPointer);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing || e.pointerId !== currentPointerId) return;

    const smartPointer = getSmartPointer(stage);
    if (!smartPointer) return;

    if (config.preventPanning) {
      e.preventDefault();
      e.stopPropagation();
    }

    const enhancedPointer: SmartPointerEvent = {
      ...smartPointer,
      pressure: e.pressure || 1,
      pointerType: e.pointerType,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    };

    config.onStrokeMove?.(enhancedPointer);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDrawing || e.pointerId !== currentPointerId) return;

    const smartPointer = getSmartPointer(stage);
    if (smartPointer) {
      const enhancedPointer: SmartPointerEvent = {
        ...smartPointer,
        pressure: e.pressure || 1,
        pointerType: e.pointerType,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
      };

      config.onStrokeEnd?.(enhancedPointer);
    }

    isDrawing = false;
    currentPointerId = null;

    // Release pointer capture
    try {
      stage.container().releasePointerCapture(e.pointerId);
    } catch (error) {
      // Ignore errors from releasing pointer capture
    }
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (e.pointerId === currentPointerId) {
      isDrawing = false;
      currentPointerId = null;
    }
  };

  // Attach event listeners
  const container = stage.container();
  container.addEventListener('pointerdown', handlePointerDown);
  container.addEventListener('pointermove', handlePointerMove);
  container.addEventListener('pointerup', handlePointerUp);
  container.addEventListener('pointercancel', handlePointerCancel);
  container.addEventListener('pointerleave', handlePointerUp);

  // Set touch-action to prevent default touch behaviors
  container.style.touchAction = 'none';

  // Return cleanup function
  return () => {
    container.removeEventListener('pointerdown', handlePointerDown);
    container.removeEventListener('pointermove', handlePointerMove);
    container.removeEventListener('pointerup', handlePointerUp);
    container.removeEventListener('pointercancel', handlePointerCancel);
    container.removeEventListener('pointerleave', handlePointerUp);
    container.style.touchAction = 'auto';
  };
}

/**
 * Enhanced pointer utilities for complex interactions
 */
export class PointerManager {
  private stage: Konva.Stage;
  private activePointers = new Map<number, SmartPointerEvent>();

  constructor(stage: Konva.Stage) {
    this.stage = stage;
  }

  getActivePointers(): SmartPointerEvent[] {
    return Array.from(this.activePointers.values());
  }

  getPointerCount(): number {
    return this.activePointers.size;
  }

  isMultiTouch(): boolean {
    return this.activePointers.size > 1;
  }

  addPointer(pointerId: number, event: SmartPointerEvent): void {
    this.activePointers.set(pointerId, event);
  }

  updatePointer(pointerId: number, event: SmartPointerEvent): void {
    if (this.activePointers.has(pointerId)) {
      this.activePointers.set(pointerId, event);
    }
  }

  removePointer(pointerId: number): void {
    this.activePointers.delete(pointerId);
  }

  clear(): void {
    this.activePointers.clear();
  }
}