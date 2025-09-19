import { Vec2 } from './types';

export interface GestureEvent {
  type: 'tap' | 'pinch' | 'swipe' | 'scrub';
  fingers: number;
  position?: Vec2;
  scale?: number;
  rotation?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  velocity?: number;
  distance?: number;
}

export interface GestureHandlerOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onClearLayer?: () => void;
  onToggleUI?: () => void;
  onContextMenu?: (position: Vec2) => void;
  onZoom?: (scale: number, center: Vec2) => void;
  onPan?: (offset: Vec2) => void;
  onRotate?: (angle: number, center: Vec2) => void;
  enableHaptics?: boolean;
}

export class GestureHandler {
  private touches: Map<number, Touch> = new Map();
  private gestureStartTime = 0;
  private lastTapTime = 0;
  private tapCount = 0;
  private initialDistance = 0;
  private initialAngle = 0;
  private initialScale = 1;
  private isGesturing = false;
  private hapticEnabled = false;

  constructor(
    private element: HTMLElement,
    private options: GestureHandlerOptions = {}
  ) {
    this.hapticEnabled = options.enableHaptics ?? true;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Mouse events for desktop compatibility
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Prevent default touch behaviors
    this.element.addEventListener('gesturestart', (e) => e.preventDefault());
    this.element.addEventListener('gesturechange', (e) => e.preventDefault());
    this.element.addEventListener('gestureend', (e) => e.preventDefault());
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    const now = performance.now();
    this.gestureStartTime = now;

    // Store touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.set(touch.identifier, touch);
    }

    const touchCount = this.touches.size;

    if (touchCount === 1) {
      // Single touch - potential tap or start of drawing
      this.handlePotentialTap(event.changedTouches[0], now);
    } else if (touchCount === 2) {
      // Two finger gesture
      this.isGesturing = true;
      this.initializeTwoFingerGesture();
    } else if (touchCount >= 3) {
      // Multi-finger gesture
      this.isGesturing = true;
      this.triggerHaptic('light');
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    // Update stored touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.set(touch.identifier, touch);
    }

    const touchCount = this.touches.size;

    if (touchCount === 2 && this.isGesturing) {
      this.handleTwoFingerGesture();
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const now = performance.now();
    const gestureTime = now - this.gestureStartTime;
    const touchCount = this.touches.size;

    // Remove ended touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }

    if (this.touches.size === 0) {
      // All touches ended
      if (this.isGesturing) {
        this.isGesturing = false;
      } else {
        // Handle tap gestures
        this.handleTapGesture(touchCount, gestureTime);
      }
    }
  }

  private handlePotentialTap(touch: Touch, timestamp: number): void {
    const timeSinceLastTap = timestamp - this.lastTapTime;
    
    if (timeSinceLastTap < 300) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }
    
    this.lastTapTime = timestamp;
  }

  private handleTapGesture(fingerCount: number, gestureTime: number): void {
    if (gestureTime > 500) return; // Too long to be a tap
    
    const tapPosition = this.getTouchCenter();
    
    // Two finger tap = Undo
    if (fingerCount === 2) {
      this.triggerHaptic('medium');
      this.options.onUndo?.();
      return;
    }
    
    // Three finger tap = Redo  
    if (fingerCount === 3) {
      this.triggerHaptic('medium');
      this.options.onRedo?.();
      return;
    }
    
    // Four finger tap = Toggle UI
    if (fingerCount === 4) {
      this.triggerHaptic('heavy');
      this.options.onToggleUI?.();
      return;
    }

    // Handle swipe gestures for 3+ fingers
    if (fingerCount >= 3) {
      setTimeout(() => {
        if (this.isSwipeGesture()) {
          this.handleSwipeGesture(fingerCount);
        }
      }, 50);
    }
  }

  private initializeTwoFingerGesture(): void {
    const touches = Array.from(this.touches.values());
    if (touches.length !== 2) return;

    const [touch1, touch2] = touches;
    
    // Calculate initial distance and angle
    this.initialDistance = this.calculateDistance(touch1, touch2);
    this.initialAngle = this.calculateAngle(touch1, touch2);
    this.initialScale = 1;
  }

  private handleTwoFingerGesture(): void {
    const touches = Array.from(this.touches.values());
    if (touches.length !== 2) return;

    const [touch1, touch2] = touches;
    const currentDistance = this.calculateDistance(touch1, touch2);
    const currentAngle = this.calculateAngle(touch1, touch2);
    
    // Calculate scale (pinch/zoom)
    const scale = currentDistance / this.initialDistance;
    const deltaScale = scale / this.initialScale;
    this.initialScale = scale;
    
    // Calculate rotation
    const deltaAngle = currentAngle - this.initialAngle;
    this.initialAngle = currentAngle;
    
    // Get center point
    const center = this.getTouchCenter();
    
    // Handle zoom
    if (Math.abs(deltaScale - 1) > 0.01) {
      this.options.onZoom?.(deltaScale, center);
    }
    
    // Handle rotation (only if significant)
    if (Math.abs(deltaAngle) > 0.05) {
      this.options.onRotate?.(deltaAngle, center);
    }
  }

  private isSwipeGesture(): boolean {
    const touches = Array.from(this.touches.values());
    if (touches.length === 0) return false;
    
    // Simple swipe detection based on touch movement
    const firstTouch = touches[0];
    const movement = Math.sqrt(
      Math.pow(firstTouch.pageX - firstTouch.pageX, 2) +
      Math.pow(firstTouch.pageY - firstTouch.pageY, 2)
    );
    
    return movement > 50; // Minimum swipe distance
  }

  private handleSwipeGesture(fingerCount: number): void {
    const touches = Array.from(this.touches.values());
    if (touches.length === 0) return;
    
    const direction = this.getSwipeDirection(touches[0]);
    
    if (fingerCount === 3) {
      if (direction === 'down') {
        // Three finger swipe down = Context menu
        this.triggerHaptic('light');
        this.options.onContextMenu?.(this.getTouchCenter());
      } else {
        // Three finger scrub = Clear layer
        this.triggerHaptic('heavy');
        this.options.onClearLayer?.();
      }
    }
  }

  private calculateDistance(touch1: Touch, touch2: Touch): number {
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  }

  private calculateAngle(touch1: Touch, touch2: Touch): number {
    return Math.atan2(
      touch2.pageY - touch1.pageY,
      touch2.pageX - touch1.pageX
    );
  }

  private getTouchCenter(): Vec2 {
    const touches = Array.from(this.touches.values());
    if (touches.length === 0) return { x: 0, y: 0 };
    
    const sumX = touches.reduce((sum, touch) => sum + touch.pageX, 0);
    const sumY = touches.reduce((sum, touch) => sum + touch.pageY, 0);
    
    return {
      x: sumX / touches.length,
      y: sumY / touches.length
    };
  }

  private getSwipeDirection(touch: Touch): 'up' | 'down' | 'left' | 'right' {
    // This is simplified - you'd need to track the initial touch position
    // and compare with current position to determine direction
    return 'down'; // Placeholder
  }

  private triggerHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.hapticEnabled || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: [10],
      medium: [15],
      heavy: [25]
    };
    
    navigator.vibrate(patterns[intensity]);
  }

  // Mouse event handlers for desktop compatibility
  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 2) { // Right click
      event.preventDefault();
      this.options.onContextMenu?.({ x: event.clientX, y: event.clientY });
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle mouse drag for panning when in hand tool mode
  }

  private handleMouseUp(event: MouseEvent): void {
    // Handle mouse release
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const rect = this.element.getBoundingClientRect();
    const center = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const deltaScale = event.deltaY > 0 ? 0.9 : 1.1;
    this.options.onZoom?.(deltaScale, center);
  }

  // Cleanup
  dispose(): void {
    // Remove all event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('wheel', this.handleWheel.bind(this));
  }
}