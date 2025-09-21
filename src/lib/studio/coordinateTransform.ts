// Unified coordinate transformation utilities for Studio
export interface ViewportState {
  zoom: number;
  panOffset: { x: number; y: number };
  canvasOffset: { x: number; y: number };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Convert screen coordinates to canvas coordinates with proper zoom/pan handling
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  viewport: ViewportState
): Point {
  // Calculate relative position within canvas element
  const relativeX = screenX - canvasRect.left;
  const relativeY = screenY - canvasRect.top;
  
  // Apply inverse viewport transformations
  const canvasX = (relativeX / viewport.zoom) - viewport.panOffset.x;
  const canvasY = (relativeY / viewport.zoom) - viewport.panOffset.y;
  
  return { x: canvasX, y: canvasY };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  canvasRect: DOMRect,
  viewport: ViewportState
): Point {
  // Apply viewport transformations
  const viewportX = (canvasX + viewport.panOffset.x) * viewport.zoom;
  const viewportY = (canvasY + viewport.panOffset.y) * viewport.zoom;
  
  // Add canvas element offset
  const screenX = viewportX + canvasRect.left;
  const screenY = viewportY + canvasRect.top;
  
  return { x: screenX, y: screenY };
}

/**
 * Get high-DPI aware device pixel ratio
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Configure canvas for high-DPI rendering
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  const ratio = getDevicePixelRatio();
  
  // Set actual size in memory (scaled up for high-DPI)
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  
  // Scale canvas back down using CSS
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  // Scale the drawing context so everything draws at the correct size
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(ratio, ratio);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
}

/**
 * Create a precision coordinate mapper for consistent transformations
 */
export class CoordinateMapper {
  private viewport: ViewportState;
  private canvasRect: DOMRect;
  
  constructor(viewport: ViewportState, canvasRect: DOMRect) {
    this.viewport = viewport;
    this.canvasRect = canvasRect;
  }
  
  updateViewport(viewport: ViewportState): void {
    this.viewport = viewport;
  }
  
  updateCanvasRect(rect: DOMRect): void {
    this.canvasRect = rect;
  }
  
  screenToCanvas(screenX: number, screenY: number): Point {
    return screenToCanvas(screenX, screenY, this.canvasRect, this.viewport);
  }
  
  canvasToScreen(canvasX: number, canvasY: number): Point {
    return canvasToScreen(canvasX, canvasY, this.canvasRect, this.viewport);
  }
  
  /**
   * Check if a screen point is within the canvas bounds
   */
  isPointInCanvas(screenX: number, screenY: number): boolean {
    return (
      screenX >= this.canvasRect.left &&
      screenX <= this.canvasRect.right &&
      screenY >= this.canvasRect.top &&
      screenY <= this.canvasRect.bottom
    );
  }
  
  /**
   * Get canvas bounds in screen coordinates
   */
  getCanvasBounds(): DOMRect {
    return this.canvasRect;
  }
}