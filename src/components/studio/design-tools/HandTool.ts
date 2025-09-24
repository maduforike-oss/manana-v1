import { Hand } from 'lucide-react';
import { BaseDesignTool, ToolConfig, PointerEvent, CanvasCoordinates } from './types';

export class HandTool extends BaseDesignTool {
  readonly config: ToolConfig = {
    id: 'hand',
    name: 'Pan Canvas',
    icon: Hand,
    shortcut: 'H',
    description: 'Pan and navigate the canvas',
    cursor: 'grab',
    preventPanning: false // Hand tool actually enables panning
  };

  private isPanning = false;
  private lastPanPosition: { x: number; y: number } | null = null;

  activate(): void {
    console.log('Hand tool activated');
    this.setupEventHandlers();
  }

  deactivate(): void {
    console.log('Hand tool deactivated');
    this.isPanning = false;
    this.lastPanPosition = null;
  }

  private setupEventHandlers(): void {
    this.setEventHandlers({
      onPointerDown: this.handlePointerDown.bind(this),
      onPointerMove: this.handlePointerMove.bind(this),
      onPointerUp: this.handlePointerUp.bind(this)
    });
  }

  private handlePointerDown(e: PointerEvent, coords: CanvasCoordinates): void {
    this.isPanning = true;
    this.lastPanPosition = coords.screen;
    
    // Change cursor to grabbing
    document.body.style.cursor = 'grabbing';
  }

  private async handlePointerMove(e: PointerEvent, coords: CanvasCoordinates): Promise<void> {
    if (!this.isPanning || !this.lastPanPosition) return;

    const deltaX = coords.screen.x - this.lastPanPosition.x;
    const deltaY = coords.screen.y - this.lastPanPosition.y;

    // Update pan offset through store
    const { useStudioStore } = await import('@/lib/studio/store');
    const store = useStudioStore.getState();
    
    store.setPanOffset({
      x: store.panOffset.x + deltaX,
      y: store.panOffset.y + deltaY
    });

    this.lastPanPosition = coords.screen;
  }

  private handlePointerUp(e: PointerEvent, coords: CanvasCoordinates): void {
    this.isPanning = false;
    this.lastPanPosition = null;
    
    // Reset cursor
    document.body.style.cursor = '';
  }
}