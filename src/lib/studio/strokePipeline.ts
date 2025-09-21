import { Vec2 } from './types';

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
  tilt?: { x: number; y: number };
  twist?: number;
}

export interface LiveStroke {
  id: string;
  points: StrokePoint[];
  brush: {
    size: number;
    color: string;
    opacity: number;
    hardness: number;
    type: string;
  };
  isComplete: boolean;
}

export class StrokePipeline {
  private currentStroke: LiveStroke | null = null;
  private previewCanvas: HTMLCanvasElement;
  private previewCtx: CanvasRenderingContext2D;
  private smoothingBuffer: StrokePoint[] = [];
  private lastPoint: StrokePoint | null = null;

  constructor(previewCanvas: HTMLCanvasElement) {
    this.previewCanvas = previewCanvas;
    this.previewCtx = previewCanvas.getContext('2d')!;
  }

  startStroke(point: Vec2, pressure: number = 1, brush: LiveStroke['brush']): string {
    const strokePoint: StrokePoint = {
      x: point.x,
      y: point.y,
      pressure,
      timestamp: Date.now()
    };

    this.currentStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      points: [strokePoint],
      brush,
      isComplete: false
    };

    this.smoothingBuffer = [strokePoint];
    this.lastPoint = strokePoint;
    this.clearPreview();
    
    return this.currentStroke.id;
  }

  addPoint(point: Vec2, pressure: number = 1): boolean {
    if (!this.currentStroke) return false;

    const strokePoint: StrokePoint = {
      x: point.x,
      y: point.y,
      pressure,
      timestamp: Date.now()
    };

    // Distance-based spacing to prevent too many points
    if (this.lastPoint) {
      const distance = Math.sqrt(
        Math.pow(strokePoint.x - this.lastPoint.x, 2) +
        Math.pow(strokePoint.y - this.lastPoint.y, 2)
      );
      
      if (distance < 2) return false; // Skip if too close
    }

    this.smoothingBuffer.push(strokePoint);
    
    // Keep smoothing buffer to 3 points for Catmull-Rom smoothing
    if (this.smoothingBuffer.length > 3) {
      this.smoothingBuffer.shift();
    }

    // Apply smoothing and add to stroke
    const smoothedPoint = this.smoothingBuffer.length >= 3 ? 
      this.applyCatmullRomSmoothing() : strokePoint;
    
    this.currentStroke.points.push(smoothedPoint);
    this.lastPoint = smoothedPoint;
    
    // Update live preview
    this.updatePreview();
    
    return true;
  }

  private applyCatmullRomSmoothing(): StrokePoint {
    if (this.smoothingBuffer.length < 3) {
      return this.smoothingBuffer[this.smoothingBuffer.length - 1];
    }

    const [p0, p1, p2] = this.smoothingBuffer;
    const t = 0.5; // Interpolation factor

    return {
      x: 0.5 * ((-p0.x + 3 * p1.x - 3 * p2.x) * t * t * t +
                 (2 * p0.x - 5 * p1.x + 4 * p2.x) * t * t +
                 (-p0.x + p2.x) * t + 2 * p1.x),
      y: 0.5 * ((-p0.y + 3 * p1.y - 3 * p2.y) * t * t * t +
                 (2 * p0.y - 5 * p1.y + 4 * p2.y) * t * t +
                 (-p0.y + p2.y) * t + 2 * p1.y),
      pressure: p1.pressure,
      timestamp: p1.timestamp
    };
  }

  endStroke(): LiveStroke | null {
    if (!this.currentStroke) return null;

    this.currentStroke.isComplete = true;
    const completedStroke = this.currentStroke;
    
    // Clear preview and reset state
    this.clearPreview();
    this.currentStroke = null;
    this.smoothingBuffer = [];
    this.lastPoint = null;
    
    return completedStroke;
  }

  private updatePreview(): void {
    if (!this.currentStroke) return;

    this.clearPreview();
    this.renderStrokeToCanvas(this.currentStroke, this.previewCtx);
  }

  private clearPreview(): void {
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
  }

  rasterizeStroke(stroke: LiveStroke, targetCanvas: HTMLCanvasElement): void {
    const ctx = targetCanvas.getContext('2d')!;
    this.renderStrokeToCanvas(stroke, ctx);
  }

  private renderStrokeToCanvas(stroke: LiveStroke, ctx: CanvasRenderingContext2D): void {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = stroke.brush.opacity;
    ctx.strokeStyle = stroke.brush.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // Variable width stroke based on pressure
    ctx.beginPath();
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const point = stroke.points[i];
      const nextPoint = stroke.points[i + 1];
      
      const width = stroke.brush.size * point.pressure;
      ctx.lineWidth = width;
      
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      }
      
      // Use quadratic curve for smooth lines
      const cpx = (point.x + nextPoint.x) / 2;
      const cpy = (point.y + nextPoint.y) / 2;
      ctx.quadraticCurveTo(point.x, point.y, cpx, cpy);
    }
    
    ctx.stroke();
    ctx.restore();
  }

  getCurrentStroke(): LiveStroke | null {
    return this.currentStroke;
  }

  getPreviewCanvas(): HTMLCanvasElement {
    return this.previewCanvas;
  }
}

export const createStrokePipeline = (width: number, height: number): StrokePipeline => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return new StrokePipeline(canvas);
};
