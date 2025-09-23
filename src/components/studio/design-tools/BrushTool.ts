import { PenTool, Eraser } from 'lucide-react';
import { BaseDesignTool, ToolConfig, PointerEvent, CanvasCoordinates } from './types';
import { BrushEngine, BRUSH_PRESETS, BrushStroke } from '@/lib/studio/brushEngine';
import { useStudioStore } from '@/lib/studio/store';
import { generateId } from '@/lib/utils';

export interface BrushSettings {
  size: number;
  opacity: number;
  color: string;
  hardness: number;
  type: keyof typeof BRUSH_PRESETS;
  isEraser?: boolean;
}

export class BrushTool extends BaseDesignTool {
  readonly config: ToolConfig;
  private brushEngine: BrushEngine | null = null;
  private currentStroke: BrushStroke | null = null;
  private isDrawing = false;

  constructor(initialSettings: Partial<BrushSettings> = {}) {
    const defaultSettings: BrushSettings = {
      size: 10,
      opacity: 1,
      color: '#000000',
      hardness: 0.8,
      type: 'pencil',
      isEraser: false,
      ...initialSettings
    };

    super(defaultSettings);

    this.config = {
      id: defaultSettings.isEraser ? 'eraser' : 'brush',
      name: defaultSettings.isEraser ? 'Eraser Tool' : 'Brush Tool',
      icon: defaultSettings.isEraser ? Eraser : PenTool,
      shortcut: defaultSettings.isEraser ? 'E' : 'B',
      description: defaultSettings.isEraser ? 'Erase content' : 'Draw freehand strokes',
      cursor: 'crosshair',
      preventPanning: true
    };
  }

  activate(): void {
    console.log(`${this.config.name} activated`);
    this.initializeBrushEngine();
    this.setupEventHandlers();
  }

  deactivate(): void {
    console.log(`${this.config.name} deactivated`);
    this.finishCurrentStroke();
    this.brushEngine = null;
  }

  private initializeBrushEngine(): void {
    const settings = this.getSettings() as BrushSettings;
    const presetSettings = BRUSH_PRESETS[settings.type];
    
    this.brushEngine = new BrushEngine({
      ...presetSettings,
      size: settings.size,
      opacity: settings.opacity,
      color: settings.color,
      hardness: settings.hardness
    });
  }

  private setupEventHandlers(): void {
    this.setEventHandlers({
      onPointerDown: this.handlePointerDown.bind(this),
      onPointerMove: this.handlePointerMove.bind(this),
      onPointerUp: this.handlePointerUp.bind(this)
    });
  }

  private handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    if (!this.brushEngine) return;

    this.isDrawing = true;
    this.state.isDrawing = true;
    
    const pressure = e.pressure || 1;
    this.currentStroke = this.brushEngine.startStroke(coords.world, pressure);
  }

  private handlePointerMove(e: PointerEvent, coords: CanvasCoordinates): void {
    if (!this.isDrawing || !this.brushEngine || !this.currentStroke) return;

    const pressure = e.pressure || 1;
    this.brushEngine.addPoint(coords.world, pressure);
  }

  private handlePointerUp(e: PointerEvent, coords: CanvasCoordinates): void {
    if (!this.isDrawing || !this.brushEngine) return;

    this.isDrawing = false;
    this.state.isDrawing = false;
    
    const completedStroke = this.brushEngine.endStroke();
    if (completedStroke) {
      this.createPathNode(completedStroke);
    }
    
    this.currentStroke = null;
  }

  private createPathNode(stroke: BrushStroke): void {
    const store = useStudioStore.getState();
    const settings = this.getSettings() as BrushSettings;
    
    // Convert stroke points to flat array for Konva
    const points = stroke.points.flatMap(p => [p.x, p.y]);
    
    // Calculate bounding box
    const xs = stroke.points.map(p => p.x);
    const ys = stroke.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const pathNode = {
      id: generateId(),
      type: 'path' as const,
      name: settings.isEraser ? 'Eraser Stroke' : 'Brush Stroke',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: stroke.brush.opacity,
      points,
      stroke: {
        color: stroke.brush.color,
        width: stroke.brush.size
      },
      closed: false,
      globalCompositeOperation: settings.isEraser ? 'destination-out' : 'source-over'
    };

    store.addNode(pathNode);
    store.saveSnapshot();
  }

  private finishCurrentStroke(): void {
    if (this.isDrawing && this.brushEngine && this.currentStroke) {
      const completedStroke = this.brushEngine.endStroke();
      if (completedStroke) {
        this.createPathNode(completedStroke);
      }
    }
    
    this.isDrawing = false;
    this.state.isDrawing = false;
    this.currentStroke = null;
  }

  // Get current stroke for live preview
  getCurrentStroke(): BrushStroke | null {
    return this.currentStroke;
  }

  // Override updateSettings to reinitialize brush engine
  updateSettings(newSettings: Partial<BrushSettings>): void {
    super.updateSettings(newSettings);
    if (this.state.isActive) {
      this.initializeBrushEngine();
    }
  }

  renderSettings(): React.ReactNode {
    // This will be implemented when we create the unified brush panel
    return null;
  }
}