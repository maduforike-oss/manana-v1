import { Square, Circle, Triangle, Star, Minus } from 'lucide-react';
import { BaseDesignTool, ToolConfig, PointerEvent, CanvasCoordinates } from './types';
import { useStudioStore } from '@/lib/studio/store';
import { ShapeNode } from '@/lib/studio/types';
import { generateId } from '@/lib/utils';

export interface ShapeSettings {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  radius?: number;
  points?: number;
}

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'line';

export class ShapeTool extends BaseDesignTool {
  readonly config: ToolConfig;
  private shapeType: ShapeType;

  constructor(shapeType: ShapeType, initialSettings: Partial<ShapeSettings> = {}) {
    const defaultSettings: ShapeSettings = {
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2,
      opacity: 1,
      radius: shapeType === 'rect' ? 8 : undefined,
      points: shapeType === 'star' ? 5 : undefined,
      ...initialSettings
    };

    super(defaultSettings);
    this.shapeType = shapeType;

    const iconMap = {
      rect: Square,
      circle: Circle,
      triangle: Triangle,
      star: Star,
      line: Minus
    };

    const nameMap = {
      rect: 'Rectangle',
      circle: 'Circle',
      triangle: 'Triangle',
      star: 'Star',
      line: 'Line'
    };

    this.config = {
      id: shapeType,
      name: nameMap[shapeType],
      icon: iconMap[shapeType],
      shortcut: shapeType === 'rect' ? 'R' : shapeType === 'circle' ? 'C' : undefined,
      description: `Add ${nameMap[shapeType].toLowerCase()} shapes`,
      cursor: 'crosshair',
      preventPanning: false
    };
  }

  activate(): void {
    console.log(`${this.config.name} tool activated`);
    this.setupEventHandlers();
  }

  deactivate(): void {
    console.log(`${this.config.name} tool deactivated`);
  }

  private setupEventHandlers(): void {
    this.setEventHandlers({
      onPointerDown: this.handlePointerDown.bind(this)
    });
  }

  private handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    this.createShapeNode(coords.world);
  }

  private createShapeNode(position: { x: number; y: number }): void {
    const store = useStudioStore.getState();
    const settings = this.getSettings() as ShapeSettings;

    // Default size based on shape type
    const defaultSize = this.shapeType === 'line' ? { width: 100, height: 0 } : { width: 100, height: 100 };

    const shapeNode: ShapeNode = {
      id: generateId(),
      type: 'shape',
      name: `${this.config.name} Shape`,
      x: position.x - defaultSize.width / 2,
      y: position.y - defaultSize.height / 2,
      width: defaultSize.width,
      height: defaultSize.height,
      rotation: 0,
      opacity: settings.opacity,
      shape: this.shapeType,
      fill: { type: 'solid', color: settings.fill },
      stroke: { color: settings.stroke, width: settings.strokeWidth },
      radius: settings.radius,
      points: settings.points
    };

    store.addNode(shapeNode);
    store.selectNode(shapeNode.id);
    store.saveSnapshot();

    // Switch back to select tool after creating shape
    const { toolManager } = require('./ToolManager');
    toolManager.activateTool('select');
  }

  renderSettings(): React.ReactNode {
    // This will be implemented when we create the unified shape properties panel
    return null;
  }
}