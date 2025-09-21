import { Vec2 } from './types';

export interface PrintArea {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  shape: 'rectangle' | 'circle' | 'custom';
  garmentType: string;
  garmentView: 'front' | 'back' | 'sleeve';
}

export interface GarmentMask {
  garmentType: string;
  printAreas: PrintArea[];
  mockupUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export class PrintAreaMaskManager {
  private masks: Map<string, GarmentMask> = new Map();
  private activeMask: GarmentMask | null = null;
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;

  constructor() {
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d')!;
    this.initializeDefaultMasks();
  }

  private initializeDefaultMasks(): void {
    // T-Shirt front mask
    const tshirtMask: GarmentMask = {
      garmentType: 't-shirt',
      printAreas: [
        {
          id: 'front-chest',
          name: 'Front Chest',
          bounds: { x: 150, y: 100, width: 280, height: 380 },
          shape: 'rectangle',
          garmentType: 't-shirt',
          garmentView: 'front'
        }
      ],
      mockupUrl: '/mockups/tshirt_front_light.png',
      dimensions: { width: 580, height: 680 }
    };

    this.masks.set('t-shirt', tshirtMask);
  }

  loadGarmentMask(garmentType: string): Promise<GarmentMask | null> {
    return new Promise((resolve) => {
      const mask = this.masks.get(garmentType);
      if (mask) {
        this.activeMask = mask;
        this.updateMaskCanvas();
        resolve(mask);
      } else {
        // Try to load from API
        this.loadMaskFromAPI(garmentType).then(resolve);
      }
    });
  }

  private async loadMaskFromAPI(garmentType: string): Promise<GarmentMask | null> {
    try {
      // This would be replaced with actual API call
      const response = await fetch(`/api/garments/${garmentType}/mask`);
      if (response.ok) {
        const mask: GarmentMask = await response.json();
        this.masks.set(garmentType, mask);
        this.activeMask = mask;
        this.updateMaskCanvas();
        return mask;
      }
    } catch (error) {
      console.warn('Failed to load garment mask:', error);
    }
    return null;
  }

  private updateMaskCanvas(): void {
    if (!this.activeMask) return;

    const { width, height } = this.activeMask.dimensions;
    this.maskCanvas.width = width;
    this.maskCanvas.height = height;

    // Clear and set up mask
    this.maskCtx.clearRect(0, 0, width, height);
    this.maskCtx.fillStyle = '#000000';
    this.maskCtx.fillRect(0, 0, width, height);

    // Cut out print areas (white = printable)
    this.maskCtx.globalCompositeOperation = 'destination-out';
    this.maskCtx.fillStyle = '#ffffff';

    this.activeMask.printAreas.forEach(area => {
      const { x, y, width: w, height: h } = area.bounds;
      
      if (area.shape === 'rectangle') {
        this.maskCtx.fillRect(x, y, w, h);
      } else if (area.shape === 'circle') {
        this.maskCtx.beginPath();
        this.maskCtx.arc(x + w/2, y + h/2, Math.min(w, h)/2, 0, Math.PI * 2);
        this.maskCtx.fill();
      }
    });

    this.maskCtx.globalCompositeOperation = 'source-over';
  }

  isPointInPrintArea(point: Vec2): boolean {
    if (!this.activeMask) return false;

    return this.activeMask.printAreas.some(area => {
      const { x, y, width, height } = area.bounds;
      
      if (area.shape === 'rectangle') {
        return point.x >= x && point.x <= x + width &&
               point.y >= y && point.y <= y + height;
      } else if (area.shape === 'circle') {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      }
      
      return false;
    });
  }

  clipCanvasToMask(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    if (!this.activeMask) return sourceCanvas;

    const clippedCanvas = document.createElement('canvas');
    clippedCanvas.width = sourceCanvas.width;
    clippedCanvas.height = sourceCanvas.height;
    const ctx = clippedCanvas.getContext('2d')!;

    // Draw source canvas
    ctx.drawImage(sourceCanvas, 0, 0);

    // Apply mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.maskCanvas, 0, 0, clippedCanvas.width, clippedCanvas.height);

    return clippedCanvas;
  }

  getPrintAreaBounds(): PrintArea[] {
    return this.activeMask?.printAreas || [];
  }

  getActiveMask(): GarmentMask | null {
    return this.activeMask;
  }

  renderPrintAreaOutlines(ctx: CanvasRenderingContext2D, strokeStyle: string = '#3b82f6'): void {
    if (!this.activeMask) return;

    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    this.activeMask.printAreas.forEach(area => {
      const { x, y, width, height } = area.bounds;
      
      if (area.shape === 'rectangle') {
        ctx.strokeRect(x, y, width, height);
      } else if (area.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
  }
}