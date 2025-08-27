import React from 'react';
import { Rect, Circle, Group } from 'react-konva';
import { Node } from '../../lib/studio/types';

interface SelectionBoundingBoxProps {
  nodes: Node[];
  selectedIds: string[];
  showBoundingBox: boolean;
  scale: number;
  getNodeScreenPosition: (node: Node) => { x: number; y: number };
  onNodeUpdate: (id: string, updates: Partial<Node>) => void;
}

export const SelectionBoundingBox = ({
  nodes,
  selectedIds,
  showBoundingBox,
  scale,
  getNodeScreenPosition,
  onNodeUpdate
}: SelectionBoundingBoxProps) => {
  if (!showBoundingBox || selectedIds.length === 0) return null;

  const selectedNodes = nodes.filter(node => selectedIds.includes(node.id));
  
  if (selectedNodes.length === 0) return null;

  // Calculate bounding box for all selected nodes
  const getBounds = () => {
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      const pos = getNodeScreenPosition(node);
      return {
        x: pos.x - (node.width * scale) / 2,
        y: pos.y - (node.height * scale) / 2,
        width: node.width * scale,
        height: node.height * scale
      };
    }

    // Multi-selection bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedNodes.forEach(node => {
      const pos = getNodeScreenPosition(node);
      const left = pos.x - (node.width * scale) / 2;
      const top = pos.y - (node.height * scale) / 2;
      const right = left + node.width * scale;
      const bottom = top + node.height * scale;
      
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const bounds = getBounds();
  const handleSize = 8;

  return (
    <Group>
      {/* Bounding Box Rectangle */}
      <Rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        stroke="hsl(var(--primary))"
        strokeWidth={1}
        dash={[4, 4]}
        fill="transparent"
        listening={false}
      />
      
      {/* Corner Handles */}
      {selectedNodes.length === 1 && (
        <>
          {/* Top-left */}
          <Circle
            x={bounds.x}
            y={bounds.y}
            radius={handleSize / 2}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={1}
            draggable
            onDragMove={(e) => {
              const node = selectedNodes[0];
              const deltaX = e.target.x() - bounds.x;
              const deltaY = e.target.y() - bounds.y;
              onNodeUpdate(node.id, {
                x: node.x + deltaX / scale,
                y: node.y + deltaY / scale,
                width: node.width - deltaX / scale,
                height: node.height - deltaY / scale
              });
            }}
          />
          
          {/* Top-right */}
          <Circle
            x={bounds.x + bounds.width}
            y={bounds.y}
            radius={handleSize / 2}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={1}
            draggable
            onDragMove={(e) => {
              const node = selectedNodes[0];
              const deltaX = e.target.x() - (bounds.x + bounds.width);
              const deltaY = e.target.y() - bounds.y;
              onNodeUpdate(node.id, {
                y: node.y + deltaY / scale,
                width: node.width + deltaX / scale,
                height: node.height - deltaY / scale
              });
            }}
          />
          
          {/* Bottom-left */}
          <Circle
            x={bounds.x}
            y={bounds.y + bounds.height}
            radius={handleSize / 2}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={1}
            draggable
            onDragMove={(e) => {
              const node = selectedNodes[0];
              const deltaX = e.target.x() - bounds.x;
              const deltaY = e.target.y() - (bounds.y + bounds.height);
              onNodeUpdate(node.id, {
                x: node.x + deltaX / scale,
                width: node.width - deltaX / scale,
                height: node.height + deltaY / scale
              });
            }}
          />
          
          {/* Bottom-right */}
          <Circle
            x={bounds.x + bounds.width}
            y={bounds.y + bounds.height}
            radius={handleSize / 2}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={1}
            draggable
            onDragMove={(e) => {
              const node = selectedNodes[0];
              const deltaX = e.target.x() - (bounds.x + bounds.width);
              const deltaY = e.target.y() - (bounds.y + bounds.height);
              onNodeUpdate(node.id, {
                width: node.width + deltaX / scale,
                height: node.height + deltaY / scale
              });
            }}
          />
        </>
      )}
    </Group>
  );
};