import { Node } from './types';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  canvas: HTMLCanvasElement;
  thumbnail: HTMLCanvasElement;
  locked: boolean;
  nodes: string[]; // Node IDs in this layer
  maskLayer?: string; // ID of layer used as mask
  clipped?: boolean; // If this layer is clipped to the layer below
  group?: string; // ID of parent group
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

export interface LayerGroup {
  id: string;
  name: string;
  layers: string[];
  collapsed: boolean;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
}

export class LayerSystem {
  private layers: Map<string, Layer> = new Map();
  private groups: Map<string, LayerGroup> = new Map();
  private layerOrder: string[] = [];
  private activeLayerId: string | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Create default layer
    this.createLayer('background', 'Background');
    this.setActiveLayer('background');
  }

  createLayer(id: string, name: string): Layer {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = this.canvas.width;
    layerCanvas.height = this.canvas.height;

    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = 64;
    thumbnailCanvas.height = 64;

    const layer: Layer = {
      id,
      name,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      canvas: layerCanvas,
      thumbnail: thumbnailCanvas,
      locked: false,
      nodes: []
    };

    this.layers.set(id, layer);
    this.layerOrder.push(id);
    this.updateThumbnail(layer);
    
    return layer;
  }

  duplicateLayer(id: string): Layer | null {
    const originalLayer = this.layers.get(id);
    if (!originalLayer) return null;

    const newId = `${id}-copy-${Date.now()}`;
    const newLayer = this.createLayer(newId, `${originalLayer.name} Copy`);
    
    // Copy canvas content
    const newCtx = newLayer.canvas.getContext('2d')!;
    newCtx.drawImage(originalLayer.canvas, 0, 0);
    
    // Copy properties
    newLayer.opacity = originalLayer.opacity;
    newLayer.blendMode = originalLayer.blendMode;
    newLayer.visible = originalLayer.visible;
    newLayer.nodes = [...originalLayer.nodes];
    
    this.updateThumbnail(newLayer);
    return newLayer;
  }

  deleteLayer(id: string): boolean {
    if (this.layers.size <= 1) return false; // Can't delete last layer
    
    this.layers.delete(id);
    this.layerOrder = this.layerOrder.filter(layerId => layerId !== id);
    
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layerOrder[this.layerOrder.length - 1] || null;
    }
    
    return true;
  }

  reorderLayer(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.layerOrder.length ||
        toIndex < 0 || toIndex >= this.layerOrder.length) {
      return;
    }
    
    const [movedLayer] = this.layerOrder.splice(fromIndex, 1);
    this.layerOrder.splice(toIndex, 0, movedLayer);
  }

  setActiveLayer(id: string): boolean {
    if (this.layers.has(id)) {
      this.activeLayerId = id;
      return true;
    }
    return false;
  }

  getActiveLayer(): Layer | null {
    return this.activeLayerId ? this.layers.get(this.activeLayerId) || null : null;
  }

  updateLayerProperty(id: string, property: keyof Layer, value: any): void {
    const layer = this.layers.get(id);
    if (!layer) return;
    
    (layer as any)[property] = value;
    
    if (property === 'name' || property === 'visible' || property === 'opacity') {
      this.updateThumbnail(layer);
    }
  }

  mergeLayers(upperLayerId: string, lowerLayerId: string): Layer | null {
    const upperLayer = this.layers.get(upperLayerId);
    const lowerLayer = this.layers.get(lowerLayerId);
    
    if (!upperLayer || !lowerLayer) return null;
    
    // Create merged layer
    const mergedId = `merged-${Date.now()}`;
    const mergedLayer = this.createLayer(mergedId, `${lowerLayer.name} + ${upperLayer.name}`);
    const mergedCtx = mergedLayer.canvas.getContext('2d')!;
    
    // Draw lower layer first
    mergedCtx.globalAlpha = lowerLayer.opacity;
    mergedCtx.globalCompositeOperation = lowerLayer.blendMode as any;
    mergedCtx.drawImage(lowerLayer.canvas, 0, 0);
    
    // Draw upper layer
    mergedCtx.globalAlpha = upperLayer.opacity;
    mergedCtx.globalCompositeOperation = upperLayer.blendMode as any;
    mergedCtx.drawImage(upperLayer.canvas, 0, 0);
    
    // Remove original layers
    this.deleteLayer(upperLayerId);
    this.deleteLayer(lowerLayerId);
    
    this.updateThumbnail(mergedLayer);
    return mergedLayer;
  }

  flattenAllLayers(): Layer {
    const flattenedId = 'flattened';
    const flattenedLayer = this.createLayer(flattenedId, 'Flattened');
    
    this.renderComposite(flattenedLayer.canvas);
    this.updateThumbnail(flattenedLayer);
    
    // Clear all other layers
    const oldLayers = [...this.layerOrder];
    oldLayers.forEach(id => {
      if (id !== flattenedId) {
        this.deleteLayer(id);
      }
    });
    
    return flattenedLayer;
  }

  // Render all layers into a composite canvas
  renderComposite(targetCanvas?: HTMLCanvasElement): HTMLCanvasElement {
    const canvas = targetCanvas || this.canvas;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render layers in order (bottom to top)
    this.layerOrder.forEach(layerId => {
      const layer = this.layers.get(layerId);
      if (!layer || !layer.visible) return;
      
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as any;
      
      // Apply clipping mask if present
      if (layer.maskLayer) {
        const maskLayer = this.layers.get(layer.maskLayer);
        if (maskLayer) {
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(maskLayer.canvas, 0, 0);
        }
      }
      
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    });
    
    return canvas;
  }

  // Generate thumbnail for layer
  private updateThumbnail(layer: Layer): void {
    const thumbCtx = layer.thumbnail.getContext('2d')!;
    thumbCtx.clearRect(0, 0, 64, 64);
    
    // Scale down layer canvas to thumbnail size
    const scaleX = 64 / layer.canvas.width;
    const scaleY = 64 / layer.canvas.height;
    const scale = Math.min(scaleX, scaleY);
    
    const drawWidth = layer.canvas.width * scale;
    const drawHeight = layer.canvas.height * scale;
    const offsetX = (64 - drawWidth) / 2;
    const offsetY = (64 - drawHeight) / 2;
    
    thumbCtx.drawImage(
      layer.canvas, 
      offsetX, offsetY, 
      drawWidth, drawHeight
    );
  }

  // Get all layers in render order
  getLayersInOrder(): Layer[] {
    return this.layerOrder.map(id => this.layers.get(id)!).filter(Boolean);
  }

  // Get layer by ID
  getLayer(id: string): Layer | null {
    return this.layers.get(id) || null;
  }

  // Apply layer mask
  applyMask(layerId: string, maskLayerId: string): void {
    const layer = this.layers.get(layerId);
    const maskLayer = this.layers.get(maskLayerId);
    
    if (!layer || !maskLayer) return;
    
    const layerCtx = layer.canvas.getContext('2d')!;
    layerCtx.save();
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(maskLayer.canvas, 0, 0);
    layerCtx.restore();
    
    this.updateThumbnail(layer);
  }

  // Create layer group
  createGroup(id: string, name: string, layerIds: string[]): LayerGroup {
    const group: LayerGroup = {
      id,
      name,
      layers: layerIds,
      collapsed: false,
      visible: true,
      opacity: 1,
      blendMode: 'normal'
    };
    
    this.groups.set(id, group);
    
    // Update layer group references
    layerIds.forEach(layerId => {
      const layer = this.layers.get(layerId);
      if (layer) {
        layer.group = id;
      }
    });
    
    return group;
  }

  // Export layer as image
  exportLayer(id: string, format: 'png' | 'jpeg' = 'png'): string {
    const layer = this.layers.get(id);
    if (!layer) return '';
    
    return layer.canvas.toDataURL(`image/${format}`);
  }

  // Import image to new layer
  importImage(imageUrl: string, name: string): Promise<Layer> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const layerId = `imported-${Date.now()}`;
        const layer = this.createLayer(layerId, name);
        const ctx = layer.canvas.getContext('2d')!;
        
        // Draw image centered and scaled to fit
        const scaleX = layer.canvas.width / img.width;
        const scaleY = layer.canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
        
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (layer.canvas.width - drawWidth) / 2;
        const offsetY = (layer.canvas.height - drawHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        this.updateThumbnail(layer);
        
        resolve(layer);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  // Clean up resources
  dispose(): void {
    this.layers.clear();
    this.groups.clear();
    this.layerOrder = [];
    this.activeLayerId = null;
  }
}