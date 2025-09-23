import { Tool } from '@/lib/studio/types';
import { Node } from '@/lib/studio/types';

export interface PointerEvent {
  x: number;
  y: number;
  pressure?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

export interface CanvasCoordinates {
  screen: { x: number; y: number };
  canvas: { x: number; y: number };
  world: { x: number; y: number };
}

export interface ToolState {
  isActive: boolean;
  isDrawing?: boolean;
  settings: Record<string, any>;
}

export interface ToolConfig {
  id: Tool;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  description?: string;
  cursor?: string;
  preventPanning?: boolean;
}

export interface ToolEventHandlers {
  onPointerDown?: (e: PointerEvent, coords: CanvasCoordinates) => void;
  onPointerMove?: (e: PointerEvent, coords: CanvasCoordinates) => void;
  onPointerUp?: (e: PointerEvent, coords: CanvasCoordinates) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}

export abstract class BaseDesignTool {
  abstract readonly config: ToolConfig;
  public state: ToolState;
  public eventHandlers: ToolEventHandlers = {};

  constructor(initialSettings: Record<string, any> = {}) {
    this.state = {
      isActive: false,
      settings: initialSettings
    };
  }

  // Lifecycle methods
  abstract activate(): void;
  abstract deactivate(): void;
  
  // State management
  updateSettings(newSettings: Partial<Record<string, any>>): void {
    this.state.settings = { ...this.state.settings, ...newSettings };
  }

  getSettings(): Record<string, any> {
    return this.state.settings;
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  // Event handling
  setEventHandlers(handlers: ToolEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Optional render method for tool-specific overlays
  render?(): React.ReactNode;

  // Optional settings panel
  renderSettings?(): React.ReactNode;
}

export interface ToolRegistry {
  [key: string]: () => BaseDesignTool;
}