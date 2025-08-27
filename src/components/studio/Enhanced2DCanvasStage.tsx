import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image, Line, Star, RegularPolygon } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';
import { getGarmentById } from '@/lib/studio/garments';
import { Canvas3D } from './Canvas3D';
import { Canvas3DControls } from './Canvas3DControls';
import { Node, TextNode, ShapeNode } from '../../lib/studio/types';
import { AdvancedSelectionTools } from './AdvancedSelectionTools';
import { CanvasGrid } from './CanvasGrid';
import { CanvasRulers } from './CanvasRulers';
import { useViewportManager } from './EnhancedViewportManager';
import { AlignmentGuides } from './AlignmentGuides';
import { Enhanced2DMockup } from './Enhanced2DMockup';
import { ColorSelector } from './ColorSelector';
import { SelectionBoundingBox } from './SelectionBoundingBox';

export const Enhanced2DCanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const { 
    doc, 
    zoom, 
    panOffset, 
    clearSelection, 
    selectNode, 
    selectMany,
    activeTool, 
    is3DMode,
    updateNode,
    snapEnabled 
  } = useStudioStore();
  
  const { showGrid, showRulers, showBoundingBox, snapToGrid, gridSize } = useViewportManager();

  // Enhanced image loading with color support
  useEffect(() => {
    // For t-shirts, we use our new enhanced mockup system
    if (doc.canvas.garmentType === 't-shirt') {
      setGarmentImage(null); // Let Enhanced2DMockup handle the display
      return;
    }
    
    // For other garments, keep existing behavior
    const garmentType = doc.canvas.garmentType || 't-shirt';
    const garment = getGarmentById(garmentType);
    
    if (garment) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setGarmentImage(img);
      img.onerror = () => console.error('Failed to load garment image');
      img.src = garment.images.front;
    }
  }, [doc.canvas.garmentType, doc.canvas.garmentColor]);

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

  // Enhanced selection with marquee tool
  const handleStageMouseDown = useCallback((e: any) => {
    if (activeTool === 'select' && e.target === e.target.getStage()) {
      const pos = e.target.getStage().getPointerPosition();
      setDragStart(pos);
      setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  }, [activeTool]);

  const handleStageMouseMove = useCallback((e: any) => {
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

  const handleStageMouseUp = useCallback((e: any) => {
    if (selectionBox && dragStart) {
      // Find nodes within selection box
      const stage = e.target.getStage();
      const selectedIds: string[] = [];
      
      doc.nodes.forEach(node => {
        const nodeCenter = getNodeScreenPosition(node);
        if (
          nodeCenter.x >= selectionBox.x &&
          nodeCenter.x <= selectionBox.x + selectionBox.width &&
          nodeCenter.y >= selectionBox.y &&
          nodeCenter.y <= selectionBox.y + selectionBox.height
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
  }, [selectionBox, dragStart, doc.nodes, selectMany, clearSelection]);

  // Handle stage click for tool interactions
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // Convert node coordinates to screen position
  const getNodeScreenPosition = (node: Node) => {
    const garmentWidth = 400;
    const garmentHeight = 500;
    const printAreaX = garmentWidth * 0.25;
    const printAreaY = garmentHeight * 0.3;
    const printAreaWidth = garmentWidth * 0.5;
    const printAreaHeight = garmentHeight * 0.4;
    
    const printBaseX = stageSize.width / 2 - garmentWidth / 2 + printAreaX;
    const printBaseY = stageSize.height / 2 - garmentHeight / 2 + printAreaY;
    const scaleX = printAreaWidth / doc.canvas.width;
    const scaleY = printAreaHeight / doc.canvas.height;

    return {
      x: printBaseX + (node.x + node.width / 2) * scaleX,
      y: printBaseY + (node.y + node.height / 2) * scaleY
    };
  };

  // Enhanced node rendering with advanced styling
  const renderNode = (node: Node) => {
    const isSelected = doc.selectedIds.includes(node.id);
    const garmentWidth = 400;
    const garmentHeight = 500;
    const printAreaX = garmentWidth * 0.25;
    const printAreaY = garmentHeight * 0.3;
    const printAreaWidth = garmentWidth * 0.5;
    const printAreaHeight = garmentHeight * 0.4;
    
    const printBaseX = stageSize.width / 2 - garmentWidth / 2 + printAreaX;
    const printBaseY = stageSize.height / 2 - garmentHeight / 2 + printAreaY;
    const scaleX = printAreaWidth / doc.canvas.width;
    const scaleY = printAreaHeight / doc.canvas.height;

    const commonProps = {
      key: node.id,
      x: printBaseX + node.x * scaleX,
      y: printBaseY + node.y * scaleY,
      rotation: node.rotation,
      opacity: node.opacity,
      draggable: activeTool === 'select',
      onClick: () => selectNode(node.id),
      onDragEnd: (e: any) => {
        const newX = (e.target.x() - printBaseX) / scaleX;
        const newY = (e.target.y() - printBaseY) / scaleY;
        
        // Snap to grid if enabled
        const snappedX = (snapEnabled && snapToGrid) ? Math.round(newX / gridSize) * gridSize : newX;
        const snappedY = (snapEnabled && snapToGrid) ? Math.round(newY / gridSize) * gridSize : newY;
        
        updateNode(node.id, { x: snappedX, y: snappedY });
      },
      stroke: isSelected ? 'hsl(var(--primary))' : undefined,
      strokeWidth: isSelected ? 2 / zoom : 0,
      shadowColor: isSelected ? 'hsl(var(--primary))' : undefined,
      shadowBlur: isSelected ? 10 : 0,
      shadowOpacity: isSelected ? 0.3 : 0,
    };

    switch (node.type) {
      case 'shape':
        const shapeNode = node as ShapeNode;
        const shapeProps = {
          ...commonProps,
          fill: shapeNode.fill.type === 'solid' ? shapeNode.fill.color : 'transparent',
          strokeEnabled: !!shapeNode.stroke,
          stroke: isSelected ? 'hsl(var(--primary))' : shapeNode.stroke?.color,
          strokeWidth: isSelected ? 3 / zoom : (shapeNode.stroke?.width || 0) / zoom,
        };

        switch (shapeNode.shape) {
          case 'rect':
            return (
              <Rect
                {...shapeProps}
                width={shapeNode.width * scaleX}
                height={shapeNode.height * scaleY}
                cornerRadius={shapeNode.radius || 0}
              />
            );
          case 'circle':
            return (
              <Circle
                {...shapeProps}
                x={commonProps.x + (shapeNode.width * scaleX) / 2}
                y={commonProps.y + (shapeNode.height * scaleY) / 2}
                radius={Math.min(shapeNode.width * scaleX, shapeNode.height * scaleY) / 2}
              />
            );
          case 'triangle':
            return (
              <RegularPolygon
                {...shapeProps}
                x={commonProps.x + (shapeNode.width * scaleX) / 2}
                y={commonProps.y + (shapeNode.height * scaleY) / 2}
                sides={3}
                radius={Math.min(shapeNode.width * scaleX, shapeNode.height * scaleY) / 2}
              />
            );
          case 'star':
            return (
              <Star
                {...shapeProps}
                x={commonProps.x + (shapeNode.width * scaleX) / 2}
                y={commonProps.y + (shapeNode.height * scaleY) / 2}
                numPoints={shapeNode.points || 5}
                innerRadius={Math.min(shapeNode.width * scaleX, shapeNode.height * scaleY) / 4}
                outerRadius={Math.min(shapeNode.width * scaleX, shapeNode.height * scaleY) / 2}
              />
            );
          case 'line':
            return (
              <Line
                {...shapeProps}
                points={[0, 0, shapeNode.width * scaleX, shapeNode.height * scaleY]}
                strokeWidth={(shapeNode.stroke?.width || 2) / zoom}
              />
            );
        }
        break;

      case 'text':
        const textNode = node as TextNode;
        return (
          <Text
            {...commonProps}
            text={textNode.text}
            fontSize={textNode.fontSize * Math.min(scaleX, scaleY)}
            fontFamily={textNode.fontFamily}
            fontStyle={textNode.fontWeight > 500 ? 'bold' : 'normal'}
            fill={textNode.fill.type === 'solid' ? textNode.fill.color : 'black'}
            width={textNode.width * scaleX}
            height={textNode.height * scaleY}
            align={textNode.align}
            letterSpacing={textNode.letterSpacing}
            lineHeight={textNode.lineHeight}
          />
        );

      case 'image':
        // Enhanced image rendering will be implemented with the image tools
        return null;
    }

    return null;
  };

  // 3D mode rendering
  if (is3DMode) {
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
      />
      
      {/* Advanced Selection Tools */}
      <AdvancedSelectionTools />
      
      {/* Enhanced Mockup Background for T-Shirts */}
      {doc.canvas.garmentType === 't-shirt' && (
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
          {doc.canvas.garmentType !== 't-shirt' && garmentImage && (
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
          
          {/* Render Nodes */}
          {doc.nodes.map(renderNode)}
          
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
            getNodeScreenPosition={getNodeScreenPosition}
            onNodeUpdate={updateNode}
          />
          
          {/* Alignment Guides */}
          <AlignmentGuides 
            nodes={doc.nodes}
            selectedIds={doc.selectedIds}
          />
        </Layer>
      </Stage>
    </div>
  );
};
