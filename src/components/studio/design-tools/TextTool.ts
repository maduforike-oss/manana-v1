import { Type } from 'lucide-react';
import { BaseDesignTool, ToolConfig, PointerEvent, CanvasCoordinates } from './types';
import { useStudioStore } from '@/lib/studio/store';
import { TextNode } from '@/lib/studio/types';
import { generateId } from '@/lib/utils';

export interface TextSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
}

export class TextTool extends BaseDesignTool {
  readonly config: ToolConfig = {
    id: 'text',
    name: 'Add Text',
    icon: Type,
    shortcut: 'T',
    description: 'Add text elements',
    cursor: 'text',
    preventPanning: false
  };

  constructor(initialSettings: Partial<TextSettings> = {}) {
    const defaultSettings: TextSettings = {
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 400,
      color: '#000000',
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      ...initialSettings
    };

    super(defaultSettings);
  }

  activate(): void {
    console.log('Text tool activated');
    this.setupEventHandlers();
  }

  deactivate(): void {
    console.log('Text tool deactivated');
  }

  private setupEventHandlers(): void {
    this.setEventHandlers({
      onPointerDown: this.handlePointerDown.bind(this)
    });
  }

  private handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    this.createTextNode(coords.world);
  }

  private createTextNode(position: { x: number; y: number }): void {
    const store = useStudioStore.getState();
    const settings = this.getSettings() as TextSettings;

    const textNode: TextNode = {
      id: generateId(),
      type: 'text',
      name: 'Text Layer',
      x: position.x,
      y: position.y,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      text: 'Double click to edit',
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      align: settings.align,
      fill: { type: 'solid', color: settings.color }
    };

    store.addNode(textNode);
    store.selectNode(textNode.id);
    store.saveSnapshot();

    // Switch back to select tool after creating text
    const { toolManager } = require('./ToolManager');
    toolManager.activateTool('select');
  }

  renderSettings(): React.ReactNode {
    // This will be implemented when we create the unified text properties panel
    return null;
  }
}