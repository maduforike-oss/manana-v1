import { create } from 'zustand';
import { useStudioStore } from '../../lib/studio/store';

interface ViewportManagerState {
  showBoundingBox: boolean;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  
  // Actions
  toggleBoundingBox: () => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  resetViewport: () => void;
}

export const useViewportManager = create<ViewportManagerState>((set, get) => ({
  showBoundingBox: false,
  showGrid: true,
  showRulers: false,
  snapToGrid: true,
  gridSize: 20,

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

  resetViewport: () => set({
    showBoundingBox: false,
    showGrid: true,
    showRulers: false,
    snapToGrid: true,
    gridSize: 20,
  }),
}));