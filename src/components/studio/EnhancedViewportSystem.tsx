import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '../../lib/studio/store';
import { useAdvancedViewport } from '../../hooks/useAdvancedViewport';
import { PrecisionRulers } from './PrecisionRulers';
import { SmartSnapSystem } from './SmartSnapSystem';
import { AdvancedAlignmentTools } from './AdvancedAlignmentTools';
import { CanvasGrid } from './CanvasGrid';
import { AlignmentGuides } from './AlignmentGuides';

interface EnhancedViewportSystemProps {
  children: React.ReactNode;
  className?: string;
}

export const EnhancedViewportSystem: React.FC<EnhancedViewportSystemProps> = ({
  children,
  className
}) => {
  const { 
    doc, 
    zoom, 
    panOffset
  } = useStudioStore();

  const {
    viewportState,
    updateViewportState,
    handleMouseMove,
    alignNodes,
    distributeNodes
  } = useAdvancedViewport();

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: MouseEvent) => handleMouseMove(e);
    
    container.addEventListener('mousemove', handleMove);
    return () => container.removeEventListener('mousemove', handleMove);
  }, [handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Precision Rulers */}
      <PrecisionRulers
        zoom={zoom}
        panOffset={panOffset}
        showRulers={viewportState.showRulers}
        unit={viewportState.unit}
        canvasWidth={doc.canvas.width}
        canvasHeight={doc.canvas.height}
        mousePosition={viewportState.mousePosition}
      />

      {/* Viewport Content */}
      <div 
        className="absolute inset-0"
        style={{ 
          marginTop: viewportState.showRulers ? '24px' : '0',
          marginLeft: viewportState.showRulers ? '24px' : '0'
        }}
      >
        {/* Canvas Grid */}
        <CanvasGrid
          zoom={zoom}
          panOffset={panOffset}
          showGrid={viewportState.showGrid}
          gridSize={viewportState.gridSize}
        />

        {/* Alignment Guides */}
        <AlignmentGuides
          nodes={doc.nodes}
          selectedIds={doc.selectedIds}
        />

        {/* Smart Snap System */}
        <SmartSnapSystem
          nodes={doc.nodes}
          selectedIds={doc.selectedIds}
          draggedNode={viewportState.draggedNode}
          snapEnabled={viewportState.snapEnabled}
          snapTolerance={viewportState.snapTolerance}
          canvasWidth={doc.canvas.width}
          canvasHeight={doc.canvas.height}
          zoom={zoom}
          panOffset={panOffset}
        />

        {/* Main Content */}
        {children}
      </div>

      {/* Floating Alignment Tools */}
      {selectedNodes.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <AdvancedAlignmentTools
            selectedNodes={selectedNodes}
            onAlign={alignNodes}
            onDistribute={distributeNodes}
          />
        </div>
      )}

      {/* Viewport Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex flex-col gap-2 p-3 bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Grid: {viewportState.gridSize}{viewportState.unit}</span>
            <span>•</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
          
          {viewportState.mousePosition && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>X: {Math.round(viewportState.mousePosition.x)}{viewportState.unit}</span>
              <span>Y: {Math.round(viewportState.mousePosition.y)}{viewportState.unit}</span>
            </div>
          )}

          {selectedNodes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {selectedNodes.length} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};