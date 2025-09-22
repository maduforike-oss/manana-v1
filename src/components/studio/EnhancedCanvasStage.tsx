import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image, Line, Star, RegularPolygon } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';
import { getGarmentById } from '@/lib/studio/garments';
import { Canvas3D } from './Canvas3D';
import { Canvas3DControls } from './Canvas3DControls';
import { Node, TextNode, ShapeNode } from '../../lib/studio/types';
import { AdvancedSelectionTools } from './AdvancedSelectionTools';
import { CanvasGrid } from './CanvasGrid';
import { AlignmentGuides } from './AlignmentGuides';
import { Enhanced2DMockup } from './Enhanced2DMockup';
import { ColorSelector } from './ColorSelector';

export const EnhancedCanvasStage = () => {
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

  // Enhanced zoom with smooth transitions
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.1, Math.min(5, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy));
    
    useStudioStore.getState().setZoom(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    useStudioStore.getState().setPanOffset(newPos);
  }, []);

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
        const snappedX = snapEnabled ? Math.round(newX / 10) * 10 : newX;
        const snappedY = snapEnabled ? Math.round(newY / 10) * 10 : newY;
        
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

  // Loading state with professional design
  if (stageSize.width === 0 || stageSize.height === 0) {
    return (
      <div ref={containerRef} className="flex-1 bg-workspace overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Initializing enhanced canvas...</span>
          </div>
          <div className="text-xs text-foreground/60">Professional design tools loading</div>
        </div>
      </div>
    );
  }

  // 3D mode rendering
  if (is3DMode) {
    return (
      <div className="relative w-full h-full">
        <Canvas3D />
        <Canvas3DControls />
      </div>
    );
  }

  const garmentWidth = 400;
  const garmentHeight = 500;

  return (
    <div ref={containerRef} className="flex-1 bg-workspace overflow-hidden relative">
      {/* Enhanced Grid Background */}
      <CanvasGrid 
        zoom={zoom} 
        panOffset={panOffset} 
        showGrid={doc.canvas.showGrid}
        gridSize={doc.canvas.gridSize}
      />
      
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
        onWheel={handleWheel}
        draggable={activeTool === 'hand'}
        onDragEnd={(e) => {
          useStudioStore.getState().setPanOffset({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {/* Enhanced Garment Background */}
          {garmentImage && (
            <Image
              image={garmentImage}
              x={stageSize.width / 2 - garmentWidth / 2}
              y={stageSize.height / 2 - garmentHeight / 2}
              width={garmentWidth}
              height={garmentHeight}
              opacity={0.85}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={20}
              shadowOffset={{ x: 0, y: 10 }}
            />
          )}

          {/* Enhanced Print Area */}
          <Rect
            x={stageSize.width / 2 - garmentWidth / 2 + garmentWidth * 0.25}
            y={stageSize.height / 2 - garmentHeight / 2 + garmentHeight * 0.3}
            width={garmentWidth * 0.5}
            height={garmentHeight * 0.4}
            fill="transparent"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5 / zoom}
            opacity={0.4}
            dash={[8 / zoom, 4 / zoom]}
            cornerRadius={4}
          />

          {/* Render enhanced design nodes */}
          {doc.nodes.map(renderNode)}

          {/* Marquee Selection Box */}
          {selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              dash={[5, 5]}
            />
          )}
        </Layer>
      </Stage>

      {/* Alignment Guides */}
      <AlignmentGuides nodes={doc.nodes} selectedIds={doc.selectedIds} />

      {/* Advanced Selection Tools */}
      <AdvancedSelectionTools />

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-lg border border-border rounded-xl p-3 shadow-xl">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom / 1.2)}
            className="w-8 h-8 rounded-lg bg-background hover:bg-accent text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 border border-border shadow-sm"
            disabled={zoom <= 0.1}
          >
            −
          </button>
          <span className="min-w-[60px] text-center font-medium text-foreground px-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom * 1.2)}
            className="w-8 h-8 rounded-lg bg-background hover:bg-accent text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 border border-border shadow-sm"
            disabled={zoom >= 5}
          >
            +
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => {
              useStudioStore.getState().setZoom(1);
              useStudioStore.getState().setPanOffset({ x: 0, y: 0 });
            }}
            className="px-3 py-1.5 rounded-lg bg-background hover:bg-accent text-foreground text-xs font-medium transition-all duration-200 hover:scale-105 border border-border shadow-sm"
          >
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};