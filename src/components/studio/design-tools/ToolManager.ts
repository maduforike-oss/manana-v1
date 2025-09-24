import { Tool } from '@/lib/studio/types';
import { performanceMonitor } from './PerformanceMonitor';
import { BaseDesignTool, ToolRegistry, CanvasCoordinates, PointerEvent } from './types';
import { SelectTool } from './SelectTool';
import { BrushTool } from './BrushTool';
import { HandTool } from './HandTool';
import { TextTool } from './TextTool';
import { ShapeTool } from './ShapeTool';
import { ImageTool } from './ImageTool';

export class ToolManager {
  private tools: Map<Tool, BaseDesignTool> = new Map();
  private activeTool: BaseDesignTool | null = null;
  private currentToolId: Tool = 'select';

  constructor() {
    this.initializeTools();
  }

  private initializeTools(): void {
    // Register all available tools
    const toolRegistry: ToolRegistry = {
      'select': () => new SelectTool(),
      'hand': () => new HandTool(),
      'brush': () => new BrushTool(),
      'eraser': () => new BrushTool({ isEraser: true }),
      'text': () => new TextTool(),
      'rect': () => new ShapeTool('rect'),
      'circle': () => new ShapeTool('circle'),
      'triangle': () => new ShapeTool('triangle'),
      'star': () => new ShapeTool('star'),
      'line': () => new ShapeTool('line'),
      'image': () => new ImageTool(),
    };

    // Initialize tools
    Object.entries(toolRegistry).forEach(([id, factory]) => {
      this.tools.set(id as Tool, factory());
    });

    // Set default tool
    this.activateTool('select');
  }

  activateTool(toolId: Tool): boolean {
    if (this.currentToolId === toolId) return true;

    const tool = this.tools.get(toolId);
    if (!tool) {
      console.warn(`Tool ${toolId} not found`);
      return false;
    }

    // Track performance
    const endTracking = performanceMonitor.trackToolSwitch(this.currentToolId, toolId);

    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool.state.isActive = false;
    }

    // Activate new tool
    this.activeTool = tool;
    this.currentToolId = toolId;
    this.activeTool.state.isActive = true;
    this.activeTool.activate();

    // End performance tracking
    endTracking();

    return true;
  }

  getCurrentTool(): BaseDesignTool | null {
    return this.activeTool;
  }

  getCurrentToolId(): Tool {
    return this.currentToolId;
  }

  getTool(toolId: Tool): BaseDesignTool | undefined {
    return this.tools.get(toolId);
  }

  getAllTools(): BaseDesignTool[] {
    return Array.from(this.tools.values());
  }

  // Event delegation
  handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    this.activeTool?.eventHandlers.onPointerDown?.(e, coords);
  }

  handlePointerMove(e: PointerEvent, coords: CanvasCoordinates): void {
    this.activeTool?.eventHandlers.onPointerMove?.(e, coords);
  }

  handlePointerUp(e: PointerEvent, coords: CanvasCoordinates): void {
    this.activeTool?.eventHandlers.onPointerUp?.(e, coords);
  }

  // Raw event delegation for brush tool alignment
  handleRawPointerDown(e: any): void {
    this.activeTool?.eventHandlers.onRawPointerDown?.(e);
  }

  handleRawPointerMove(e: any): void {
    this.activeTool?.eventHandlers.onRawPointerMove?.(e);
  }

  handleRawPointerUp(e: any): void {
    this.activeTool?.eventHandlers.onRawPointerUp?.(e);
  }

  handleKeyDown(e: KeyboardEvent): void {
    this.activeTool?.eventHandlers.onKeyDown?.(e);
  }

  handleKeyUp(e: KeyboardEvent): void {
    this.activeTool?.eventHandlers.onKeyUp?.(e);
  }

  // Get current cursor for canvas
  getCurrentCursor(): string {
    return this.activeTool?.config.cursor || 'default';
  }

  // Check if current tool should prevent panning
  shouldPreventPanning(): boolean {
    return this.activeTool?.config.preventPanning || false;
  }

  // Update tool settings
  updateToolSettings(toolId: Tool, settings: Record<string, any>): void {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.updateSettings(settings);
    }
  }

  // Get tool settings
  getToolSettings(toolId: Tool): Record<string, any> {
    const tool = this.tools.get(toolId);
    return tool?.getSettings() || {};
  }
}

// Singleton instance
export const toolManager = new ToolManager();