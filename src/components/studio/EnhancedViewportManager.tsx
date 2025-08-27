import { create } from 'zustand';
import { useStudioStore } from '../../lib/studio/store';

interface ViewportManagerState {
  showBoundingBox: boolean;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  gridType: 'lines' | 'dots';
  rulerUnits: 'pixels' | 'inches' | 'cm';
  
  // Actions
  toggleBoundingBox: () => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  setGridType: (type: 'lines' | 'dots') => void;
  setRulerUnits: (units: 'pixels' | 'inches' | 'cm') => void;
  resetViewport: () => void;
  
  // Advanced grid functions
  snapPointToGrid: (x: number, y: number) => { x: number; y: number };
  getGridLines: (canvasWidth: number, canvasHeight: number, zoom: number, panOffset: { x: number; y: number }) => Array<any>;
}

export const useViewportManager = create<ViewportManagerState>((set, get) => ({
  showBoundingBox: false,
  showGrid: true,
  showRulers: false,
  snapToGrid: true,
  gridSize: 20,
  gridType: 'lines',
  rulerUnits: 'pixels',

  toggleBoundingBox: () => set(state => ({ 
    showBoundingBox: !state.showBoundingBox 
  })),

  toggleGrid: () => {
    const newShowGrid = !get().showGrid;
    set({ showGrid: newShowGrid });
    // Sync with studio store
    useStudioStore.getState().updateCanvas({ showGrid: newShowGrid });
  },

  toggleRulers: () => {
    const newShowRulers = !get().showRulers;
    set({ showRulers: newShowRulers });
    // Sync with studio store
    useStudioStore.getState().updateCanvas({ showRulers: newShowRulers });
  },

  toggleSnap: () => {
    const newSnapToGrid = !get().snapToGrid;
    set({ snapToGrid: newSnapToGrid });
    // Sync with studio store snap
    useStudioStore.getState().toggleSnap();
  },

  setGridSize: (size: number) => set({ gridSize: size }),

  setGridType: (type: 'lines' | 'dots') => set({ gridType: type }),

  setRulerUnits: (units: 'pixels' | 'inches' | 'cm') => set({ rulerUnits: units }),

  // Snap functionality
  snapPointToGrid: (x: number, y: number) => {
    const { snapToGrid, gridSize } = get();
    if (!snapToGrid) return { x, y };
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  },

  // Grid calculations for rendering
  getGridLines: (canvasWidth: number, canvasHeight: number, zoom: number, panOffset: { x: number; y: number }) => {
    const { gridSize, gridType } = get();
    const adjustedGridSize = gridSize * zoom;
    const lines = [];
    
    // Calculate visible area
    const startX = Math.floor(-panOffset.x / adjustedGridSize) * adjustedGridSize + panOffset.x;
    const startY = Math.floor(-panOffset.y / adjustedGridSize) * adjustedGridSize + panOffset.y;
    
    if (gridType === 'lines') {
      // Vertical lines
      for (let x = startX; x < canvasWidth + adjustedGridSize; x += adjustedGridSize) {
        if (x >= 0) {
          lines.push({
            type: 'vertical' as const,
            position: x,
            length: canvasHeight,
          });
        }
      }
      
      // Horizontal lines
      for (let y = startY; y < canvasHeight + adjustedGridSize; y += adjustedGridSize) {
        if (y >= 0) {
          lines.push({
            type: 'horizontal' as const,
            position: y,
            length: canvasWidth,
          });
        }
      }
    } else {
      // Grid dots
      for (let x = startX; x < canvasWidth + adjustedGridSize; x += adjustedGridSize) {
        for (let y = startY; y < canvasHeight + adjustedGridSize; y += adjustedGridSize) {
          if (x >= 0 && y >= 0) {
            lines.push({
              type: 'dot' as const,
              x,
              y,
            });
          }
        }
      }
    }
    
    return lines;
  },

  resetViewport: () => set({
    showBoundingBox: false,
    showGrid: true,
    showRulers: false,
    snapToGrid: true,
    gridSize: 20,
    gridType: 'lines',
    rulerUnits: 'pixels',
  }),
}));