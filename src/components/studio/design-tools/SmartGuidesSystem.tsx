import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Node } from '@/lib/studio/types';

interface SmartGuidesSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panOffset: { x: number; y: number };
}

interface Guide {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
  label: string;
  color: string;
}

export const SmartGuidesSystem = ({ 
  canvasWidth, 
  canvasHeight, 
  zoom, 
  panOffset 
}: SmartGuidesSystemProps) => {
  const { doc } = useStudioStore();
  const { canvas, nodes, selectedIds } = doc;

  if (!canvas.showGuides) return null;

  // Generate smart guides based on selected nodes and canvas
  const generateSmartGuides = (): Guide[] => {
    const guides: Guide[] = [];
    
    // Canvas center guides
    guides.push({
      id: 'canvas-center-v',
      type: 'vertical',
      position: canvasWidth / 2,
      label: 'Center',
      color: 'hsl(var(--primary))'
    });
    
    guides.push({
      id: 'canvas-center-h',
      type: 'horizontal',
      position: canvasHeight / 2,
      label: 'Middle',
      color: 'hsl(var(--primary))'
    });

    // Golden ratio guides
    const goldenRatio = 1.618;
    const goldenX1 = canvasWidth / goldenRatio;
    const goldenX2 = canvasWidth - goldenX1;
    const goldenY1 = canvasHeight / goldenRatio;
    const goldenY2 = canvasHeight - goldenY1;

    guides.push(
      {
        id: 'golden-v1',
        type: 'vertical',
        position: goldenX1,
        label: 'Golden Ratio',
        color: 'hsl(var(--secondary))'
      },
      {
        id: 'golden-v2',
        type: 'vertical',
        position: goldenX2,
        label: 'Golden Ratio',
        color: 'hsl(var(--secondary))'
      },
      {
        id: 'golden-h1',
        type: 'horizontal',
        position: goldenY1,
        label: 'Golden Ratio',
        color: 'hsl(var(--secondary))'
      },
      {
        id: 'golden-h2',
        type: 'horizontal',
        position: goldenY2,
        label: 'Golden Ratio',
        color: 'hsl(var(--secondary))'
      }
    );

    // Rule of thirds guides
    const thirdX1 = canvasWidth / 3;
    const thirdX2 = (canvasWidth * 2) / 3;
    const thirdY1 = canvasHeight / 3;
    const thirdY2 = (canvasHeight * 2) / 3;

    guides.push(
      {
        id: 'thirds-v1',
        type: 'vertical',
        position: thirdX1,
        label: 'Rule of Thirds',
        color: 'hsl(var(--accent))'
      },
      {
        id: 'thirds-v2',
        type: 'vertical',
        position: thirdX2,
        label: 'Rule of Thirds',
        color: 'hsl(var(--accent))'
      },
      {
        id: 'thirds-h1',
        type: 'horizontal',
        position: thirdY1,
        label: 'Rule of Thirds',
        color: 'hsl(var(--accent))'
      },
      {
        id: 'thirds-h2',
        type: 'horizontal',
        position: thirdY2,
        label: 'Rule of Thirds',
        color: 'hsl(var(--accent))'
      }
    );

    // Alignment guides based on existing nodes
    if (selectedIds.length > 0) {
      const selectedNodes = nodes.filter(node => selectedIds.includes(node.id));
      const otherNodes = nodes.filter(node => !selectedIds.includes(node.id));

      selectedNodes.forEach(selectedNode => {
        otherNodes.forEach(otherNode => {
          // Vertical alignment guides
          if (Math.abs(selectedNode.x - otherNode.x) < 5) {
            guides.push({
              id: `align-left-${selectedNode.id}-${otherNode.id}`,
              type: 'vertical',
              position: otherNode.x,
              label: 'Align Left',
              color: 'hsl(var(--destructive))'
            });
          }
          
          if (Math.abs((selectedNode.x + selectedNode.width) - (otherNode.x + otherNode.width)) < 5) {
            guides.push({
              id: `align-right-${selectedNode.id}-${otherNode.id}`,
              type: 'vertical',
              position: otherNode.x + otherNode.width,
              label: 'Align Right',
              color: 'hsl(var(--destructive))'
            });
          }
          
          if (Math.abs((selectedNode.x + selectedNode.width / 2) - (otherNode.x + otherNode.width / 2)) < 5) {
            guides.push({
              id: `align-center-v-${selectedNode.id}-${otherNode.id}`,
              type: 'vertical',
              position: otherNode.x + otherNode.width / 2,
              label: 'Align Center',
              color: 'hsl(var(--destructive))'
            });
          }

          // Horizontal alignment guides
          if (Math.abs(selectedNode.y - otherNode.y) < 5) {
            guides.push({
              id: `align-top-${selectedNode.id}-${otherNode.id}`,
              type: 'horizontal',
              position: otherNode.y,
              label: 'Align Top',
              color: 'hsl(var(--destructive))'
            });
          }
          
          if (Math.abs((selectedNode.y + selectedNode.height) - (otherNode.y + otherNode.height)) < 5) {
            guides.push({
              id: `align-bottom-${selectedNode.id}-${otherNode.id}`,
              type: 'horizontal',
              position: otherNode.y + otherNode.height,
              label: 'Align Bottom',
              color: 'hsl(var(--destructive))'
            });
          }
          
          if (Math.abs((selectedNode.y + selectedNode.height / 2) - (otherNode.y + otherNode.height / 2)) < 5) {
            guides.push({
              id: `align-center-h-${selectedNode.id}-${otherNode.id}`,
              type: 'horizontal',
              position: otherNode.y + otherNode.height / 2,
              label: 'Align Middle',
              color: 'hsl(var(--destructive))'
            });
          }
        });
      });
    }

    return guides;
  };

  const guides = generateSmartGuides();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {guides.map(guide => (
        <div key={guide.id}>
          {guide.type === 'vertical' ? (
            <>
              <div
                className="absolute top-0 bottom-0 w-px opacity-60"
                style={{
                  left: guide.position + panOffset.x,
                  backgroundColor: guide.color,
                  boxShadow: `0 0 3px ${guide.color}`,
                }}
              />
              <div
                className="absolute text-xs px-1 py-0.5 rounded text-white text-center whitespace-nowrap"
                style={{
                  left: guide.position + panOffset.x,
                  top: 10,
                  backgroundColor: guide.color,
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  opacity: zoom > 0.5 ? 1 : 0
                }}
              >
                {guide.label}
              </div>
            </>
          ) : (
            <>
              <div
                className="absolute left-0 right-0 h-px opacity-60"
                style={{
                  top: guide.position + panOffset.y,
                  backgroundColor: guide.color,
                  boxShadow: `0 0 3px ${guide.color}`,
                }}
              />
              <div
                className="absolute text-xs px-1 py-0.5 rounded text-white whitespace-nowrap"
                style={{
                  left: 10,
                  top: guide.position + panOffset.y,
                  backgroundColor: guide.color,
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  opacity: zoom > 0.5 ? 1 : 0
                }}
              >
                {guide.label}
              </div>
            </>
          )}
        </div>
      ))}
      
      {/* Snap indicators */}
      {selectedIds.length > 0 && (
        <div className="absolute inset-0">
          {/* Magnetic snap visual feedback would go here */}
        </div>
      )}
    </div>
  );
};