import React, { useMemo, useCallback } from 'react';
import { Layer } from 'react-konva';
import { Node } from '../../../lib/studio/types';
import { NodeRenderer } from './NodeRenderer';

interface VirtualCanvasProps {
  nodes: Node[];
  selectedIds: string[];
  layoutMetrics: {
    printBaseX: number;
    printBaseY: number;
    scaleX: number;
    scaleY: number;
  };
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
  activeTool: string;
  snapEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  onSelectNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node>) => void;
}

// Virtual rendering for performance - only render visible nodes
export const VirtualCanvas = React.memo<VirtualCanvasProps>(({
  nodes,
  selectedIds,
  layoutMetrics,
  viewport,
  activeTool,
  snapEnabled,
  snapToGrid,
  gridSize,
  onSelectNode,
  onUpdateNode
}) => {
  // Calculate visible bounds with padding for smooth scrolling
  const visibleBounds = useMemo(() => {
    const padding = 200; // Extra render area for smooth scrolling
    return {
      left: (viewport.x - padding) / viewport.zoom,
      top: (viewport.y - padding) / viewport.zoom,
      right: (viewport.x + viewport.width + padding) / viewport.zoom,
      bottom: (viewport.y + viewport.height + padding) / viewport.zoom
    };
  }, [viewport]);

  // Filter visible nodes with spatial indexing
  const visibleNodes = useMemo(() => {
    const { printBaseX, printBaseY, scaleX, scaleY } = layoutMetrics;
    
    return nodes.filter(node => {
      const nodeScreenX = printBaseX + node.x * scaleX;
      const nodeScreenY = printBaseY + node.y * scaleY;
      const nodeScreenRight = nodeScreenX + node.width * scaleX;
      const nodeScreenBottom = nodeScreenY + node.height * scaleY;

      return !(
        nodeScreenRight < visibleBounds.left ||
        nodeScreenX > visibleBounds.right ||
        nodeScreenBottom < visibleBounds.top ||
        nodeScreenY > visibleBounds.bottom
      );
    });
  }, [nodes, layoutMetrics, visibleBounds]);

  // Memoized node selection check
  const isNodeSelected = useCallback((nodeId: string) => {
    return selectedIds.includes(nodeId);
  }, [selectedIds]);

  return (
    <Layer>
      {visibleNodes.map(node => (
        <NodeRenderer
          key={node.id}
          node={node}
          isSelected={isNodeSelected(node.id)}
          layoutMetrics={layoutMetrics}
          activeTool={activeTool}
          snapEnabled={snapEnabled}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          zoom={viewport.zoom}
          onSelect={onSelectNode}
          onUpdate={onUpdateNode}
        />
      ))}
    </Layer>
  );
});

VirtualCanvas.displayName = 'VirtualCanvas';