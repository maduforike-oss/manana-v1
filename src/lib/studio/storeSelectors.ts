import { useStudioStore } from './store';
import { useMemo } from 'react';

// Optimized selectors to prevent unnecessary re-renders
export const useStudioSelectors = () => {
  // Base state selectors with stable references
  const doc = useStudioStore(state => state.doc);
  const zoom = useStudioStore(state => state.zoom);
  const panOffset = useStudioStore(state => state.panOffset);
  const activeTool = useStudioStore(state => state.activeTool);
  const is3DMode = useStudioStore(state => state.is3DMode);
  const snapEnabled = useStudioStore(state => state.snapEnabled);

  // Computed selectors for complex derived state
  const selectedNodes = useMemo(() => 
    doc.nodes.filter(node => doc.selectedIds.includes(node.id)),
    [doc.nodes, doc.selectedIds]
  );

  const hasSelection = useMemo(() => 
    doc.selectedIds.length > 0,
    [doc.selectedIds.length]
  );

  const selectionBounds = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }, [selectedNodes]);

  const canvasMetrics = useMemo(() => ({
    garmentType: doc.canvas.garmentType,
    garmentColor: doc.canvas.garmentColor,
    width: doc.canvas.width,
    height: doc.canvas.height,
    background: doc.canvas.background
  }), [doc.canvas]);

  const viewportState = useMemo(() => ({
    zoom,
    panOffset,
    is3DMode
  }), [zoom, panOffset, is3DMode]);

  return {
    // Base state
    doc,
    activeTool,
    snapEnabled,
    
    // Computed state
    selectedNodes,
    hasSelection,
    selectionBounds,
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
export const useViewport = () => useStudioStore(state => ({ 
  zoom: state.zoom, 
  panOffset: state.panOffset 
}));
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