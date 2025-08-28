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

// Action selectors to prevent prop drilling
export const useStudioActions = () => {
  return useStudioStore(state => ({
    // Node actions
    selectNode: state.selectNode,
    selectMany: state.selectMany,
    clearSelection: state.clearSelection,
    updateNode: state.updateNode,
    addNode: state.addNode,
    removeNode: state.removeNode,
    
    // Tool actions
    setActiveTool: state.setActiveTool,
    
    // View actions
    setZoom: state.setZoom,
    setPanOffset: state.setPanOffset,
    toggle3DMode: state.toggle3DMode,
    
    // History actions
    undo: state.undo,
    redo: state.redo,
    
    // Canvas actions
    updateCanvas: state.updateCanvas
  }));
};