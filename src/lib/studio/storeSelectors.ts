import { useStudioStore } from './store';
import { useMemo } from 'react';

// Individual selectors for stable references - prevent re-render loops
export const useDoc = () => useStudioStore(state => state.doc);
export const useActiveTool = () => useStudioStore(state => state.activeTool);
export const useSnapEnabled = () => useStudioStore(state => state.snapEnabled);
export const useZoom = () => useStudioStore(state => state.zoom);
export const usePanOffset = () => useStudioStore(state => state.panOffset);
export const useIs3DMode = () => useStudioStore(state => state.is3DMode);

// Simplified selectors without complex memoization to prevent circular deps
export const useStudioSelectors = () => {
  const doc = useStudioStore(state => state.doc);
  const activeTool = useStudioStore(state => state.activeTool);
  const snapEnabled = useStudioStore(state => state.snapEnabled);
  const zoom = useStudioStore(state => state.zoom);
  const panOffset = useStudioStore(state => state.panOffset);
  const is3DMode = useStudioStore(state => state.is3DMode);
  
  // Simple derived values without useMemo to prevent circular deps
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  const hasSelection = doc.selectedIds.length > 0;
  
  const canvasMetrics = {
    garmentType: doc.canvas.garmentType,
    garmentColor: doc.canvas.garmentColor,
    width: doc.canvas.width,
    height: doc.canvas.height,
    background: doc.canvas.background
  };

  const viewportState = {
    zoom,
    panOffset,
    is3DMode
  };

  return {
    // Base state
    doc,
    activeTool,
    snapEnabled,
    
    // Computed state
    selectedNodes,
    hasSelection,
    canvasMetrics,
    viewportState,
    
    // Performance stats
    nodeCount: doc.nodes.length,
    selectedCount: doc.selectedIds.length
  };
};

// Specific selectors for performance-critical components
export const useCanvasNodes = () => useStudioStore(state => state.doc.nodes);
export const useSelectedIds = () => useStudioStore(state => state.doc.selectedIds);
export const useViewport = () => {
  const zoom = useStudioStore(state => state.zoom);
  const panOffset = useStudioStore(state => state.panOffset);
  return { zoom, panOffset };
};
export const useCanvasConfig = () => useStudioStore(state => state.doc.canvas);

// Individual action selectors for stable references
export const useSelectNode = () => useStudioStore(state => state.selectNode);
export const useSelectMany = () => useStudioStore(state => state.selectMany);
export const useClearSelection = () => useStudioStore(state => state.clearSelection);
export const useUpdateNode = () => useStudioStore(state => state.updateNode);
export const useAddNode = () => useStudioStore(state => state.addNode);
export const useRemoveNode = () => useStudioStore(state => state.removeNode);
export const useSetActiveTool = () => useStudioStore(state => state.setActiveTool);
export const useSetZoom = () => useStudioStore(state => state.setZoom);
export const useSetPanOffset = () => useStudioStore(state => state.setPanOffset);
export const useToggle3DMode = () => useStudioStore(state => state.toggle3DMode);
export const useUndo = () => useStudioStore(state => state.undo);
export const useRedo = () => useStudioStore(state => state.redo);
export const useUpdateCanvas = () => useStudioStore(state => state.updateCanvas);