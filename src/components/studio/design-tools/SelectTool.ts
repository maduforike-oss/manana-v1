import { MousePointer2 } from 'lucide-react';
import { BaseDesignTool, ToolConfig, PointerEvent, CanvasCoordinates } from './types';
import { useStudioStore } from '@/lib/studio/store';

export class SelectTool extends BaseDesignTool {
  readonly config: ToolConfig = {
    id: 'select',
    name: 'Select & Move',
    icon: MousePointer2,
    shortcut: 'V',
    description: 'Select and transform objects',
    cursor: 'default',
    preventPanning: false
  };

  private isDragging = false;
  private dragStartPos: { x: number; y: number } | null = null;

  activate(): void {
    console.log('Select tool activated');
    this.setupEventHandlers();
  }

  deactivate(): void {
    console.log('Select tool deactivated');
    this.isDragging = false;
    this.dragStartPos = null;
  }

  private setupEventHandlers(): void {
    this.setEventHandlers({
      onPointerDown: this.handlePointerDown.bind(this),
      onPointerMove: this.handlePointerMove.bind(this),
      onPointerUp: this.handlePointerUp.bind(this),
      onKeyDown: this.handleKeyDown.bind(this)
    });
  }

  private handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    this.isDragging = true;
    this.dragStartPos = coords.world;
    
    // If clicking on empty space, clear selection
    // The actual node selection will be handled by Konva's built-in event system
    const store = useStudioStore.getState();
    if (!e.ctrlKey && !e.shiftKey) {
      // Will be handled by canvas click handler for multi-selection logic
    }
  }

  private handlePointerMove(e: PointerEvent, coords: CanvasCoordinates): void {
    if (!this.isDragging || !this.dragStartPos) return;

    // Handle selection rectangle or object dragging
    // This will be integrated with the transformer in the canvas
  }

  private handlePointerUp(e: PointerEvent, coords: CanvasCoordinates): void {
    this.isDragging = false;
    this.dragStartPos = null;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const store = useStudioStore.getState();
    
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        // Delete selected nodes
        store.doc.selectedIds.forEach(id => {
          store.removeNode(id);
        });
        store.clearSelection();
        break;
        
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Select all nodes
          const allIds = store.doc.nodes.map(node => node.id);
          store.selectMany(allIds);
        }
        break;
        
      case 'Escape':
        store.clearSelection();
        break;
    }
  }
}