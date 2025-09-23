import React from 'react';
import { Node } from '../../lib/studio/types';

interface SmartSnapSystemProps {
  nodes: Node[];
  selectedIds: string[];
  draggedNode?: Node;
  snapEnabled: boolean;
  snapTolerance: number;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panOffset: { x: number; y: number };
}

interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  label?: string;
  color: string;
  source: 'canvas' | 'node' | 'grid';
}

export const SmartSnapSystem: React.FC<SmartSnapSystemProps> = ({
  nodes,
  selectedIds,
  draggedNode,
  snapEnabled,
  snapTolerance,
  canvasWidth,
  canvasHeight,
  zoom,
  panOffset
}) => {
  if (!snapEnabled || !draggedNode) return null;

  const guides: SnapGuide[] = [];
  const otherNodes = nodes.filter(node => 
    !selectedIds.includes(node.id) && node.id !== draggedNode.id
  );

  // Canvas edge guides
  guides.push(
    { type: 'vertical', position: 0, label: 'Left Edge', color: 'hsl(var(--primary))', source: 'canvas' },
    { type: 'vertical', position: canvasWidth, label: 'Right Edge', color: 'hsl(var(--primary))', source: 'canvas' },
    { type: 'horizontal', position: 0, label: 'Top Edge', color: 'hsl(var(--primary))', source: 'canvas' },
    { type: 'horizontal', position: canvasHeight, label: 'Bottom Edge', color: 'hsl(var(--primary))', source: 'canvas' }
  );

  // Canvas center guides
  guides.push(
    { type: 'vertical', position: canvasWidth / 2, label: 'Center X', color: 'hsl(var(--accent))', source: 'canvas' },
    { type: 'horizontal', position: canvasHeight / 2, label: 'Center Y', color: 'hsl(var(--accent))', source: 'canvas' }
  );

  // Node alignment guides
  otherNodes.forEach(node => {
    const nodeLeft = node.x;
    const nodeRight = node.x + node.width;
    const nodeCenterX = node.x + node.width / 2;
    const nodeTop = node.y;
    const nodeBottom = node.y + node.height;
    const nodeCenterY = node.y + node.height / 2;

    // Vertical alignment points
    guides.push(
      { type: 'vertical', position: nodeLeft, color: 'hsl(var(--muted-foreground))', source: 'node' },
      { type: 'vertical', position: nodeRight, color: 'hsl(var(--muted-foreground))', source: 'node' },
      { type: 'vertical', position: nodeCenterX, color: 'hsl(var(--muted-foreground))', source: 'node' }
    );

    // Horizontal alignment points
    guides.push(
      { type: 'horizontal', position: nodeTop, color: 'hsl(var(--muted-foreground))', source: 'node' },
      { type: 'horizontal', position: nodeBottom, color: 'hsl(var(--muted-foreground))', source: 'node' },
      { type: 'horizontal', position: nodeCenterY, color: 'hsl(var(--muted-foreground))', source: 'node' }
    );
  });

  // Filter guides within snap tolerance
  const draggedLeft = draggedNode.x;
  const draggedRight = draggedNode.x + draggedNode.width;
  const draggedCenterX = draggedNode.x + draggedNode.width / 2;
  const draggedTop = draggedNode.y;
  const draggedBottom = draggedNode.y + draggedNode.height;
  const draggedCenterY = draggedNode.y + draggedNode.height / 2;

  const activeGuides = guides.filter(guide => {
    if (guide.type === 'vertical') {
      return Math.abs(guide.position - draggedLeft) <= snapTolerance ||
             Math.abs(guide.position - draggedRight) <= snapTolerance ||
             Math.abs(guide.position - draggedCenterX) <= snapTolerance;
    } else {
      return Math.abs(guide.position - draggedTop) <= snapTolerance ||
             Math.abs(guide.position - draggedBottom) <= snapTolerance ||
             Math.abs(guide.position - draggedCenterY) <= snapTolerance;
    }
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {activeGuides.map((guide, index) => (
        <div key={index} className="absolute">
          {guide.type === 'vertical' ? (
            <div
              className="w-px h-full animate-in fade-in duration-150"
              style={{
                left: (guide.position * zoom) + panOffset.x,
                backgroundColor: guide.color,
                boxShadow: `0 0 4px ${guide.color}`,
              }}
            />
          ) : (
            <div
              className="h-px w-full animate-in fade-in duration-150"
              style={{
                top: (guide.position * zoom) + panOffset.y,
                backgroundColor: guide.color,
                boxShadow: `0 0 4px ${guide.color}`,
              }}
            />
          )}
          
          {guide.label && (
            <div
              className="absolute text-xs px-2 py-1 bg-background/90 border rounded-md shadow-sm backdrop-blur-sm"
              style={{
                color: guide.color,
                [guide.type === 'vertical' ? 'left' : 'top']: guide.type === 'vertical' 
                  ? ((guide.position * zoom) + panOffset.x + 8) 
                  : ((guide.position * zoom) + panOffset.y + 8),
                [guide.type === 'vertical' ? 'top' : 'left']: guide.type === 'vertical' ? '8px' : '8px'
              }}
            >
              {guide.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};