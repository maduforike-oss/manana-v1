import { Vec2 } from './types';

// Brush engine inspired by Procreate
export interface BrushStroke {
  id: string;
  points: BrushPoint[];
  brush: BrushSettings;
  pressure: number[];
  velocity: number[];
  timestamp: number;
  completed: boolean;
}

export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number;
  timestamp: number;
}

export interface BrushSettings {
  type: 'pencil' | 'marker' | 'spray' | 'eraser' | 'texture';
  size: number; // Base size in px
  opacity: number; // 0-1
  flow: number; // 0-1 
  hardness: number; // 0-1
  spacing: number; // 0-1
  pressureSizeMultiplier: number; // How much pressure affects size
  pressureOpacityMultiplier: number; // How much pressure affects opacity
  smoothing: number; // Stroke smoothing 0-1
  texture?: string; // Texture image for brush
  blendMode: BlendMode;
  color: string;
}

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'soft-light' 
  | 'hard-light'
  | 'color-dodge' 
  | 'color-burn' 
  | 'darken' 
  | 'lighten'
  | 'difference' 
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export const BRUSH_PRESETS: Record<string, BrushSettings> = {
  pencil: {
    type: 'pencil',
    size: 3,
    opacity: 0.8,
    flow: 1,
    hardness: 0.9,
    spacing: 0.05,
    pressureSizeMultiplier: 0.5,
    pressureOpacityMultiplier: 0.3,
    smoothing: 0.3,
    blendMode: 'normal',
    color: '#000000'
  },
  marker: {
    type: 'marker',
    size: 15,
    opacity: 0.6,
    flow: 0.8,
    hardness: 0.2,
    spacing: 0.1,
    pressureSizeMultiplier: 0.8,
    pressureOpacityMultiplier: 0.5,
    smoothing: 0.5,
    blendMode: 'multiply',
    color: '#000000'
  },
  spray: {
    type: 'spray',
    size: 25,
    opacity: 0.1,
    flow: 0.3,
    hardness: 0,
    spacing: 0.2,
    pressureSizeMultiplier: 1.0,
    pressureOpacityMultiplier: 0.8,
    smoothing: 0.1,
    blendMode: 'normal',
    color: '#000000'
  },
  eraser: {
    type: 'eraser',
    size: 20,
    opacity: 1,
    flow: 1,
    hardness: 0.8,
    spacing: 0.05,
    pressureSizeMultiplier: 0.3,
    pressureOpacityMultiplier: 0,
    smoothing: 0.2,
    blendMode: 'normal',
    color: 'transparent'
  }
};

export class BrushEngine {
  private currentStroke: BrushStroke | null = null;
  private smoothedPoints: Vec2[] = [];
  private lastTimestamp = 0;
  
  constructor(private settings: BrushSettings = BRUSH_PRESETS.pencil) {}

  updateSettings(settings: Partial<BrushSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  startStroke(point: Vec2, pressure: number = 1): BrushStroke {
    const timestamp = performance.now();
    
    this.currentStroke = {
      id: `stroke-${timestamp}`,
      points: [{
        ...point,
        pressure,
        timestamp
      }],
      brush: { ...this.settings },
      pressure: [pressure],
      velocity: [0],
      timestamp,
      completed: false
    };

    this.smoothedPoints = [point];
    this.lastTimestamp = timestamp;
    
    return this.currentStroke;
  }

  addPoint(point: Vec2, pressure: number = 1): BrushStroke | null {
    if (!this.currentStroke) return null;

    const timestamp = performance.now();
    const deltaTime = Math.max(1, timestamp - this.lastTimestamp);
    
    // Calculate velocity
    const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
    const distance = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );
    const velocity = distance / deltaTime;

    // Apply smoothing
    const smoothedPoint = this.applySmoothingFilter(point);
    
    // Only add point if it's far enough from the last one (spacing)
    const spacing = this.settings.size * this.settings.spacing;
    if (distance >= spacing) {
      this.currentStroke.points.push({
        ...smoothedPoint,
        pressure,
        timestamp
      });
      
      this.currentStroke.pressure.push(pressure);
      this.currentStroke.velocity.push(velocity);
    }

    this.lastTimestamp = timestamp;
    return this.currentStroke;
  }

  endStroke(): BrushStroke | null {
    if (!this.currentStroke) return null;
    
    this.currentStroke.completed = true;
    const stroke = this.currentStroke;
    this.currentStroke = null;
    this.smoothedPoints = [];
    
    return stroke;
  }

  private applySmoothingFilter(point: Vec2): Vec2 {
    if (this.settings.smoothing === 0) return point;
    
    this.smoothedPoints.push(point);
    
    // Keep only recent points for smoothing
    const maxPoints = Math.max(3, Math.floor(this.settings.smoothing * 10));
    if (this.smoothedPoints.length > maxPoints) {
      this.smoothedPoints.shift();
    }
    
    // Apply weighted average smoothing
    let totalWeight = 0;
    let smoothedX = 0;
    let smoothedY = 0;
    
    this.smoothedPoints.forEach((p, i) => {
      const weight = (i + 1) / this.smoothedPoints.length;
      smoothedX += p.x * weight;
      smoothedY += p.y * weight;
      totalWeight += weight;
    });
    
    return {
      x: smoothedX / totalWeight,
      y: smoothedY / totalWeight
    };
  }

  // Render stroke to canvas context
  renderStroke(
    stroke: BrushStroke, 
    ctx: CanvasRenderingContext2D,
    layerBlendMode?: string
  ): void {
    if (stroke.points.length < 2) return;

    ctx.save();
    
    // Set blend mode
    ctx.globalCompositeOperation = layerBlendMode || stroke.brush.blendMode as any;
    
    // Set base properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.brush.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    // Render stroke with variable width and opacity
    for (let i = 1; i < stroke.points.length; i++) {
      const prevPoint = stroke.points[i - 1];
      const currPoint = stroke.points[i];
      const pressure = stroke.pressure[i] || 1;
      const velocity = Math.min(1, stroke.velocity[i] || 0);
      
      // Calculate dynamic size and opacity
      const pressureSize = stroke.brush.size * (1 + (pressure - 1) * stroke.brush.pressureSizeMultiplier);
      const velocitySize = pressureSize * (1 - velocity * 0.3); // Faster = thinner
      const finalSize = Math.max(1, velocitySize);
      
      const pressureOpacity = stroke.brush.opacity * (1 + (pressure - 1) * stroke.brush.pressureOpacityMultiplier);
      const finalOpacity = Math.min(1, Math.max(0.1, pressureOpacity * stroke.brush.flow));
      
      // Set stroke properties
      ctx.lineWidth = finalSize;
      ctx.strokeStyle = stroke.brush.color;
      ctx.globalAlpha = finalOpacity;
      
      // Draw line segment
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      
      if (stroke.brush.hardness < 0.9) {
        // Use quadratic curve for softer brushes
        const midX = (prevPoint.x + currPoint.x) / 2;
        const midY = (prevPoint.y + currPoint.y) / 2;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
      } else {
        // Use straight line for hard brushes
        ctx.lineTo(currPoint.x, currPoint.y);
      }
      
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Create brush cursor
  createCursor(size: number, hardness: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const canvasSize = Math.max(32, size * 2);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d')!;
    const center = canvasSize / 2;
    const radius = size / 2;
    
    // Outer circle
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle for hardness
    if (hardness < 1) {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, radius * hardness, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    return canvas;
  }
}
