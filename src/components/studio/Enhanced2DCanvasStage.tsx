import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Image } from 'react-konva';
import { useStudioSelectors, useStudioActions, useViewport } from '../../lib/studio/storeSelectors';
import { getGarmentById } from '@/lib/studio/garments';
import { Canvas3D } from './Canvas3D';
import { Canvas3DControls } from './Canvas3DControls';
import { AdvancedSelectionTools } from './AdvancedSelectionTools';
import { CanvasGrid } from './CanvasGrid';
import { CanvasRulers } from './CanvasRulers';
import { useViewportManager } from './EnhancedViewportManager';
import { AlignmentGuides } from './AlignmentGuides';
import { Enhanced2DMockup } from './Enhanced2DMockup';
import { ColorSelector } from './ColorSelector';
import { SelectionBoundingBox } from './SelectionBoundingBox';
import { VirtualCanvas } from './optimized/VirtualCanvas';

export const Enhanced2DCanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Optimized selectors
  const { doc, selectedNodes, hasSelection, canvasMetrics, viewportState } = useStudioSelectors();
  const { selectNode, selectMany, clearSelection, updateNode } = useStudioActions();
  const { zoom, panOffset } = useViewport();
  const activeTool = 'select'; // Will be properly connected later
  const snapEnabled = false; // Will be properly connected later
  
  const { showGrid, showRulers, showBoundingBox, snapToGrid, gridSize, rulerUnits } = useViewportManager();

  // Enhanced image loading with color support
  useEffect(() => {
    // For t-shirts, we use our new enhanced mockup system
    if (canvasMetrics.garmentType === 't-shirt') {
      setGarmentImage(null); // Let Enhanced2DMockup handle the display
      return;
    }
    
    // For other garments, keep existing behavior
    const garmentType = canvasMetrics.garmentType || 't-shirt';
    const garment = getGarmentById(garmentType);
    
    if (garment) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setGarmentImage(img);
      img.onerror = () => console.error('Failed to load garment image');
      img.src = garment.images.front;
    }
  }, [canvasMetrics.garmentType, canvasMetrics.garmentColor]);

  // Enhanced stage sizing with responsive design
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setStageSize({ width: clientWidth, height: clientHeight });
        }
      }
    };

    const observer = new ResizeObserver(updateStageSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized layout calculations
  const layoutMetrics = useMemo(() => {
    const garmentWidth = 400;
    const garmentHeight = 500;
    const printAreaX = garmentWidth * 0.25;
    const printAreaY = garmentHeight * 0.3;
    const printAreaWidth = garmentWidth * 0.5;
    const printAreaHeight = garmentHeight * 0.4;
    
    const printBaseX = stageSize.width / 2 - garmentWidth / 2 + printAreaX;
    const printBaseY = stageSize.height / 2 - garmentHeight / 2 + printAreaY;
    const scaleX = printAreaWidth / canvasMetrics.width;
    const scaleY = printAreaHeight / canvasMetrics.height;

    return { printBaseX, printBaseY, scaleX, scaleY };
  }, [stageSize.width, stageSize.height, canvasMetrics.width, canvasMetrics.height]);

  // Viewport for virtual rendering
  const viewport = useMemo(() => ({
    x: panOffset.x,
    y: panOffset.y,
    width: stageSize.width,
    height: stageSize.height,
    zoom
  }), [panOffset, stageSize, zoom]);

  // Enhanced selection with marquee tool
  const handleStageMouseDown = React.useCallback((e: any) => {
    if (activeTool === 'select' && e.target === e.target.getStage()) {
      const pos = e.target.getStage().getPointerPosition();
      setDragStart(pos);
      setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  }, [activeTool]);

  const handleStageMouseMove = React.useCallback((e: any) => {
    if (dragStart && selectionBox) {
      const pos = e.target.getStage().getPointerPosition();
      setSelectionBox({
        x: Math.min(dragStart.x, pos.x),
        y: Math.min(dragStart.y, pos.y),
        width: Math.abs(pos.x - dragStart.x),
        height: Math.abs(pos.y - dragStart.y)
      });
    }
  }, [dragStart, selectionBox]);

  const handleStageMouseUp = React.useCallback((e: any) => {
    if (selectionBox && dragStart) {
      // Find nodes within selection box - simplified for performance
      const selectedIds: string[] = [];
      
      doc.nodes.forEach(node => {
        const { printBaseX, printBaseY, scaleX, scaleY } = layoutMetrics;
        const nodeX = printBaseX + node.x * scaleX;
        const nodeY = printBaseY + node.y * scaleY;
        
        if (
          nodeX >= selectionBox.x &&
          nodeX <= selectionBox.x + selectionBox.width &&
          nodeY >= selectionBox.y &&
          nodeY <= selectionBox.y + selectionBox.height
        ) {
          selectedIds.push(node.id);
        }
      });

      if (selectedIds.length > 0) {
        selectMany(selectedIds);
      } else {
        clearSelection();
      }
    }
    
    setDragStart(null);
    setSelectionBox(null);
  }, [selectionBox, dragStart, doc.nodes, layoutMetrics, selectMany, clearSelection]);

  // Handle stage click for tool interactions
  const handleStageClick = React.useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // 3D mode rendering
  if (viewportState.is3DMode) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-background">
        <Canvas3D />
        <Canvas3DControls />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
      {/* Rulers */}
      <CanvasRulers
        zoom={zoom}
        panOffset={panOffset}
        showRulers={showRulers}
        canvasWidth={stageSize.width}
        canvasHeight={stageSize.height}
        units={rulerUnits}
      />
      
      {/* Advanced Selection Tools */}
      <AdvancedSelectionTools />
      
      {/* Enhanced Mockup Background for T-Shirts */}
      {canvasMetrics.garmentType === 't-shirt' && (
        <div className="absolute inset-0 z-0">
          <Enhanced2DMockup />
        </div>
      )}
      
      {/* Main Canvas */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        className="cursor-crosshair relative z-10"
      >
        <Layer>
          {/* Grid */}
          <CanvasGrid
            zoom={zoom}
            panOffset={panOffset}
            showGrid={showGrid}
            gridSize={gridSize}
          />
          
          {/* Garment Background for non-t-shirt items */}
          {canvasMetrics.garmentType !== 't-shirt' && garmentImage && (
            <Image
              image={garmentImage}
              x={stageSize.width / 2 - 200}
              y={stageSize.height / 2 - 250}
              width={400}
              height={500}
              opacity={0.3}
              listening={false}
            />
          )}
          
          {/* Virtual Canvas for Performance */}
          <VirtualCanvas
            nodes={doc.nodes}
            selectedIds={doc.selectedIds}
            layoutMetrics={layoutMetrics}
            viewport={viewport}
            activeTool={activeTool}
            snapEnabled={snapEnabled}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            onSelectNode={selectNode}
            onUpdateNode={updateNode}
          />
          
          {/* Selection Box */}
          {selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(74, 144, 226, 0.1)"
              stroke="rgba(74, 144, 226, 0.8)"
              strokeWidth={1}
              dash={[5, 5]}
              listening={false}
            />
          )}
          
          {/* Selection Bounding Box */}
          <SelectionBoundingBox
            nodes={doc.nodes}
            selectedIds={doc.selectedIds}
            showBoundingBox={showBoundingBox}
            scale={zoom}
            getNodeScreenPosition={(node) => {
              const { printBaseX, printBaseY, scaleX, scaleY } = layoutMetrics;
              return {
                x: printBaseX + (node.x + node.width / 2) * scaleX,
                y: printBaseY + (node.y + node.height / 2) * scaleY
              };
            }}
            onNodeUpdate={updateNode}
          />
          
        </Layer>
      </Stage>

      {/* Alignment Guides */}
      <AlignmentGuides 
        nodes={doc.nodes}
        selectedIds={doc.selectedIds}
      />
    </div>
  );
};
