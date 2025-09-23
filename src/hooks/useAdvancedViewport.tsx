import { useState, useCallback, useRef } from 'react';
import { useStudioStore } from '../lib/studio/store';
import { Node } from '../lib/studio/types';

interface ViewportState {
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  snapEnabled: boolean;
  snapTolerance: number;
  gridSize: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  mousePosition?: { x: number; y: number };
  isDragging: boolean;
  draggedNode?: Node;
}

export const useAdvancedViewport = () => {
  const { 
    doc, 
    zoom, 
    panOffset, 
    updateNode,
    selectNode,
    clearSelection 
  } = useStudioStore();

  const [viewportState, setViewportState] = useState<ViewportState>({
    showGrid: true,
    showRulers: true,
    showGuides: true,
    snapEnabled: true,
    snapTolerance: 10,
    gridSize: 20,
    unit: 'px',
    isDragging: false
  });

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const updateViewportState = useCallback((updates: Partial<ViewportState>) => {
    setViewportState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    
    setViewportState(prev => ({
      ...prev,
      mousePosition: { x, y }
    }));
  }, [zoom, panOffset]);

  const snapToGrid = useCallback((position: number, gridSize: number): number => {
    if (!viewportState.snapEnabled) return position;
    return Math.round(position / gridSize) * gridSize;
  }, [viewportState.snapEnabled]);

  const snapToGuides = useCallback((node: Node, tolerance: number = viewportState.snapTolerance): { x: number; y: number } => {
    if (!viewportState.snapEnabled) return { x: node.x, y: node.y };

    let snappedX = node.x;
    let snappedY = node.y;

    // Canvas bounds snapping
    const canvasWidth = doc.canvas.width;
    const canvasHeight = doc.canvas.height;

    // Snap to canvas edges
    if (Math.abs(node.x) <= tolerance) snappedX = 0;
    if (Math.abs(node.x + node.width - canvasWidth) <= tolerance) snappedX = canvasWidth - node.width;
    if (Math.abs(node.y) <= tolerance) snappedY = 0;
    if (Math.abs(node.y + node.height - canvasHeight) <= tolerance) snappedY = canvasHeight - node.height;

    // Snap to canvas center
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    if (Math.abs(node.x + node.width / 2 - centerX) <= tolerance) {
      snappedX = centerX - node.width / 2;
    }
    if (Math.abs(node.y + node.height / 2 - centerY) <= tolerance) {
      snappedY = centerY - node.height / 2;
    }

    // Snap to other nodes
    const otherNodes = doc.nodes.filter(n => n.id !== node.id && !doc.selectedIds.includes(n.id));
    
    otherNodes.forEach(otherNode => {
      // Horizontal alignment
      if (Math.abs(node.x - otherNode.x) <= tolerance) snappedX = otherNode.x;
      if (Math.abs(node.x + node.width - otherNode.x - otherNode.width) <= tolerance) {
        snappedX = otherNode.x + otherNode.width - node.width;
      }
      if (Math.abs(node.x + node.width / 2 - otherNode.x - otherNode.width / 2) <= tolerance) {
        snappedX = otherNode.x + otherNode.width / 2 - node.width / 2;
      }

      // Vertical alignment
      if (Math.abs(node.y - otherNode.y) <= tolerance) snappedY = otherNode.y;
      if (Math.abs(node.y + node.height - otherNode.y - otherNode.height) <= tolerance) {
        snappedY = otherNode.y + otherNode.height - node.height;
      }
      if (Math.abs(node.y + node.height / 2 - otherNode.y - otherNode.height / 2) <= tolerance) {
        snappedY = otherNode.y + otherNode.height / 2 - node.height / 2;
      }
    });

    return { x: snappedX, y: snappedY };
  }, [viewportState.snapEnabled, viewportState.snapTolerance, doc.canvas, doc.nodes, doc.selectedIds]);

  const alignNodes = useCallback((type: string) => {
    const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
    if (selectedNodes.length < 2 && !type.includes('canvas')) return;

    const canvasWidth = doc.canvas.width;
    const canvasHeight = doc.canvas.height;

    selectedNodes.forEach(node => {
      let updates: Partial<Node> = {};

      switch (type) {
        case 'left':
          const leftmost = Math.min(...selectedNodes.map(n => n.x));
          updates.x = leftmost;
          break;
        case 'center':
          const centerX = selectedNodes.reduce((sum, n) => sum + n.x + n.width / 2, 0) / selectedNodes.length;
          updates.x = centerX - node.width / 2;
          break;
        case 'right':
          const rightmost = Math.max(...selectedNodes.map(n => n.x + n.width));
          updates.x = rightmost - node.width;
          break;
        case 'top':
          const topmost = Math.min(...selectedNodes.map(n => n.y));
          updates.y = topmost;
          break;
        case 'middle':
          const centerY = selectedNodes.reduce((sum, n) => sum + n.y + n.height / 2, 0) / selectedNodes.length;
          updates.y = centerY - node.height / 2;
          break;
        case 'bottom':
          const bottommost = Math.max(...selectedNodes.map(n => n.y + n.height));
          updates.y = bottommost - node.height;
          break;
        case 'canvas-center-x':
          updates.x = canvasWidth / 2 - node.width / 2;
          break;
        case 'canvas-center-y':
          updates.y = canvasHeight / 2 - node.height / 2;
          break;
      }

      updateNode(node.id, updates);
    });
  }, [doc.nodes, doc.selectedIds, doc.canvas, updateNode]);

  const distributeNodes = useCallback((type: string) => {
    const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
    if (selectedNodes.length < 3) return;

    const sortedNodes = [...selectedNodes];

    switch (type) {
      case 'horizontal':
        sortedNodes.sort((a, b) => a.x - b.x);
        const totalWidth = sortedNodes[sortedNodes.length - 1].x + sortedNodes[sortedNodes.length - 1].width - sortedNodes[0].x;
        const spacing = (totalWidth - sortedNodes.reduce((sum, n) => sum + n.width, 0)) / (sortedNodes.length - 1);
        
        let currentX = sortedNodes[0].x + sortedNodes[0].width;
        for (let i = 1; i < sortedNodes.length - 1; i++) {
          updateNode(sortedNodes[i].id, { x: currentX + spacing });
          currentX += sortedNodes[i].width + spacing;
        }
        break;

      case 'vertical':
        sortedNodes.sort((a, b) => a.y - b.y);
        const totalHeight = sortedNodes[sortedNodes.length - 1].y + sortedNodes[sortedNodes.length - 1].height - sortedNodes[0].y;
        const vSpacing = (totalHeight - sortedNodes.reduce((sum, n) => sum + n.height, 0)) / (sortedNodes.length - 1);
        
        let currentY = sortedNodes[0].y + sortedNodes[0].height;
        for (let i = 1; i < sortedNodes.length - 1; i++) {
          updateNode(sortedNodes[i].id, { y: currentY + vSpacing });
          currentY += sortedNodes[i].height + vSpacing;
        }
        break;
    }
  }, [doc.nodes, doc.selectedIds, updateNode]);

  return {
    viewportState,
    updateViewportState,
    handleMouseMove,
    snapToGrid,
    snapToGuides,
    alignNodes,
    distributeNodes
  };
};