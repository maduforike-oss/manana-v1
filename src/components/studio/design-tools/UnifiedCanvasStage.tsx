import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, RegularPolygon, Transformer, Image } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { Node, TextNode, ShapeNode, ImageNode, PathNode } from '@/lib/studio/types';
import { getSmartPointerFromEvent, fitStageToContainer } from '@/utils/konvaCoords';
import Konva from 'konva';
import { toolManager } from './ToolManager';
import { BrushTool } from './BrushTool';
import { UnifiedKeyboardHandler } from './UnifiedKeyboardHandler';
import { DesignToolsErrorBoundary } from './DesignToolsErrorBoundary';
import { PrecisionCursorManager } from './PrecisionCursorManager';
import { FloatingBrushControls } from './FloatingBrushControls';
import { EnhancedGrid } from './AdvancedGridSystem';
import { SmartGuidesSystem } from './SmartGuidesSystem';
import { performanceMonitor } from './PerformanceMonitor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CanvasCoordinates {
  screen: { x: number; y: number };
  canvas: { x: number; y: number };
  world: { x: number; y: number };
}

export const UnifiedCanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);

  const { 
    doc, 
    zoom, 
    panOffset, 
    mockup,
    addNode, 
    updateNode, 
    removeNode,
    selectNode,
    clearSelection,
    setZoom,
    setPanOffset,
    setActiveTool,
    saveSnapshot
  } = useStudioStore();

  // Handle window resize with container sync
  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    const onResize = () => {
      fitStageToContainer(stage);
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({ width: clientWidth, height: clientHeight });
      }
    };
    
    const ro = new ResizeObserver(onResize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener("resize", onResize, { passive: true });

    onResize(); // initial

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Enhanced garment loading with caching and permanent visibility
  useEffect(() => {
    const loadGarment = async () => {
      // Always default to t-shirt if no garment type
      const garmentType = doc?.canvas?.garmentType || 't-shirt';
      const garmentColor = doc?.canvas?.garmentColor || 'black';
      
      setIsLoadingGarment(true);
      try {
        const { GARMENT_TYPES } = await import('@/lib/studio/garments');
        let staticGarment = GARMENT_TYPES.find(g => g.id === garmentType);
        
        // Fallback to t-shirt if garment type not found
        if (!staticGarment) {
          console.warn(`Garment type ${garmentType} not found, falling back to t-shirt`);
          staticGarment = GARMENT_TYPES.find(g => g.id === 't-shirt');
        }
        
        if (staticGarment?.images?.front) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            setGarmentImage(img);
            setIsLoadingGarment(false);
          };
          img.onerror = () => {
            console.warn(`Failed to load garment image for ${garmentType}`);
            setGarmentImage(null);
            setIsLoadingGarment(false);
          };
          img.src = staticGarment.images.front;
        } else {
          setGarmentImage(null);
          setIsLoadingGarment(false);
        }
      } catch (error) {
        console.error('Error loading garment:', error);
        setGarmentImage(null);
        setIsLoadingGarment(false);
      }
    };

    // Debounce garment loading to prevent rapid switches
    const timeoutId = setTimeout(loadGarment, 200);
    return () => clearTimeout(timeoutId);
  }, [doc?.canvas?.garmentType, doc?.canvas?.garmentColor]);

  // Auto-fit to screen with permanent garment visibility
  const hasAutoFit = useRef(false);
  const [isLoadingGarment, setIsLoadingGarment] = useState(false);
  
  useEffect(() => {
    if (!stageSize.width || !stageSize.height || !doc?.canvas) return;
    
    // Auto-fit the canvas to screen on first load only
    if (!hasAutoFit.current) {
      const scaleX = stageSize.width / doc.canvas.width;
      const scaleY = stageSize.height / doc.canvas.height;
      const newZoom = Math.min(scaleX, scaleY) * 0.85; // 85% of available space
      
      const newPanOffset = {
        x: (stageSize.width - doc.canvas.width * newZoom) / 2,
        y: (stageSize.height - doc.canvas.height * newZoom) / 2
      };
      
      setZoom(newZoom);
      setPanOffset(newPanOffset);
      hasAutoFit.current = true;
    }
  }, [stageSize, doc?.canvas, setZoom, setPanOffset]);
  // Convert coordinates between different spaces
  const getCoordinates = useCallback((e: any): CanvasCoordinates => {
    const stage = e.target.getStage();
    const smartPointer = getSmartPointerFromEvent(stage, e);
    if (!smartPointer) return { screen: {x:0,y:0}, canvas: {x:0,y:0}, world: {x:0,y:0} };
    
    return {
      screen: { x: smartPointer.x, y: smartPointer.y },
      canvas: { x: smartPointer.x, y: smartPointer.y },
      world: { x: smartPointer.x, y: smartPointer.y } // Already in world coords
    };
  }, []);

  // Grid rendering
  const renderGrid = () => {
    if (!doc.canvas.showGrid) return null;
    
    const gridSize = doc.canvas.gridSize || 20;
    const lines = [];
    
    for (let i = 0; i < stageSize.width / zoom + panOffset.x; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height / zoom]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    for (let i = 0; i < stageSize.height / zoom + panOffset.y; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width / zoom, i]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    return lines;
  };

  // Render design nodes
  const renderNode = (node: Node) => {
    const isSelected = doc.selectedIds.includes(node.id);
    
    const commonProps = {
      id: node.id,
      x: node.x,
      y: node.y,
      rotation: node.rotation || 0,
      opacity: node.opacity || 1,
      draggable: !node.locked && toolManager.getCurrentToolId() === 'select',
      onClick: () => {
        if (toolManager.getCurrentToolId() === 'select') {
          selectNode(node.id);
        }
      },
      onDragEnd: (e: any) => {
        if (toolManager.getCurrentToolId() === 'select') {
          updateNode(node.id, {
            x: e.target.x(),
            y: e.target.y()
          });
          saveSnapshot();
        }
      },
      onTransformEnd: (e: any) => {
        if (toolManager.getCurrentToolId() === 'select') {
          const scaleX = e.target.scaleX();
          const scaleY = e.target.scaleY();
          
          updateNode(node.id, {
            x: e.target.x(),
            y: e.target.y(),
            width: node.width * scaleX,
            height: node.height * scaleY,
            rotation: e.target.rotation()
          });
          
          e.target.scaleX(1);
          e.target.scaleY(1);
          saveSnapshot();
        }
      }
    };

    switch (node.type) {
      case 'text': {
        const textNode = node as TextNode;
        return (
          <Text
            key={node.id}
            {...commonProps}
            text={textNode.text}
            fontSize={textNode.fontSize}
            fontFamily={textNode.fontFamily}
            fill={textNode.fill.type === 'solid' ? textNode.fill.color : '#000000'}
            align={textNode.align}
            width={textNode.width}
            height={textNode.height}
            stroke={isSelected ? '#0066FF' : undefined}
            strokeWidth={isSelected ? 2 : 0}
          />
        );
      }
      
      case 'shape': {
        const shapeNode = node as ShapeNode;
        const fill = shapeNode.fill.type === 'solid' ? shapeNode.fill.color : '#3B82F6';
        const stroke = shapeNode.stroke?.color || '#1E40AF';
        
        switch (shapeNode.shape) {
          case 'rect':
            return (
              <Rect
                key={node.id}
                {...commonProps}
                width={shapeNode.width}
                height={shapeNode.height}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
                cornerRadius={shapeNode.radius || 0}
              />
            );
            
          case 'circle':
            return (
              <Circle
                key={node.id}
                {...commonProps}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'triangle':
          case 'star':
            return (
              <RegularPolygon
                key={node.id}
                {...commonProps}
                sides={shapeNode.shape === 'triangle' ? 3 : (shapeNode.points || 5)}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'line':
            return (
              <Line
                key={node.id}
                {...commonProps}
                points={[0, 0, shapeNode.width, 0]}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
        }
        break;
      }
      
      case 'path': {
        const pathNode = node as PathNode;
        return (
          <Line
            key={node.id}
            {...commonProps}
            points={pathNode.points}
            stroke={pathNode.stroke.color}
            strokeWidth={pathNode.stroke.width}
            lineCap="round"
            lineJoin="round"
            closed={pathNode.closed}
            globalCompositeOperation={(pathNode as any).globalCompositeOperation || 'source-over'}
          />
        );
      }
      
      case 'image': {
        const imageNode = node as ImageNode;
        const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
        
        useEffect(() => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => setKonvaImage(img);
          img.src = imageNode.src;
        }, [imageNode.src]);
        
        if (!konvaImage) return null;
        
        return (
          <Image
            key={node.id}
            {...commonProps}
            image={konvaImage}
            width={imageNode.width}
            height={imageNode.height}
            opacity={imageNode.opacity}
            brightness={imageNode.filters?.brightness}
            contrast={imageNode.filters?.contrast}
            saturation={imageNode.filters?.saturation}
          />
        );
      }
    }
    
    return null;
  };

  // Handle pointer events through tool manager
  const handlePointerDown = useCallback((e: any) => {
    // First try raw event handling for brush tool alignment
    toolManager.handleRawPointerDown(e);
    
    // Then fallback to legacy coordinate handling for other tools
    const coords = getCoordinates(e);
    const pointerEvent = {
      x: coords.world.x,
      y: coords.world.y,
      pressure: e.evt.pressure || 1,
      altKey: e.evt.altKey,
      ctrlKey: e.evt.ctrlKey,
      shiftKey: e.evt.shiftKey
    };

    toolManager.handlePointerDown(pointerEvent, coords);
  }, [getCoordinates]);

  const handlePointerMove = useCallback((e: any) => {
    // First try raw event handling for brush tool alignment
    toolManager.handleRawPointerMove(e);
    
    // Then fallback to legacy coordinate handling for other tools
    const coords = getCoordinates(e);
    const pointerEvent = {
      x: coords.world.x,
      y: coords.world.y,
      pressure: e.evt.pressure || 1,
      altKey: e.evt.altKey,
      ctrlKey: e.evt.ctrlKey,
      shiftKey: e.evt.shiftKey
    };

    toolManager.handlePointerMove(pointerEvent, coords);
  }, [getCoordinates]);

  const handlePointerUp = useCallback((e: any) => {
    // First try raw event handling for brush tool alignment
    toolManager.handleRawPointerUp(e);
    
    // Then fallback to legacy coordinate handling for other tools
    const coords = getCoordinates(e);
    const pointerEvent = {
      x: coords.world.x,
      y: coords.world.y,
      pressure: e.evt.pressure || 1,
      altKey: e.evt.altKey,
      ctrlKey: e.evt.ctrlKey,
      shiftKey: e.evt.shiftKey
    };

    toolManager.handlePointerUp(pointerEvent, coords);
  }, [getCoordinates]);

  // Handle stage click for empty space
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      if (toolManager.getCurrentToolId() === 'select') {
        clearSelection();
      }
    }
  }, [clearSelection]);

  // Enhanced wheel zoom with bounds and garment visibility constraints
  const handleWheel = useCallback((e: any) => {
    if (toolManager.shouldPreventPanning()) return;
    
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const oldZoom = zoom;
    const newZoom = e.evt.deltaY > 0 ? oldZoom / scaleBy : oldZoom * scaleBy;
    const clampedZoom = Math.max(0.1, Math.min(5, newZoom));

    if (clampedZoom !== oldZoom) {
      const mousePointTo = {
        x: (pointer.x - panOffset.x) / oldZoom,
        y: (pointer.y - panOffset.y) / oldZoom,
      };

      let newPanOffset = {
        x: pointer.x - mousePointTo.x * clampedZoom,
        y: pointer.y - mousePointTo.y * clampedZoom,
      };

      // Clamp pan offset to keep canvas reasonably in view
      if (doc?.canvas && stageSize.width && stageSize.height) {
        const canvasWidth = doc.canvas.width * clampedZoom;
        const canvasHeight = doc.canvas.height * clampedZoom;
        
        // Allow panning but keep at least 100px of canvas visible
        const margin = 100;
        newPanOffset.x = Math.max(
          -canvasWidth + margin,
          Math.min(stageSize.width - margin, newPanOffset.x)
        );
        newPanOffset.y = Math.max(
          -canvasHeight + margin,
          Math.min(stageSize.height - margin, newPanOffset.y)
        );
      }

      setZoom(clampedZoom);
      setPanOffset(newPanOffset);
    }
  }, [zoom, panOffset, setZoom, setPanOffset, doc?.canvas, stageSize]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && doc.selectedIds.length > 0 && toolManager.getCurrentToolId() === 'select') {
      const nodes = doc.selectedIds.map(id => 
        stageRef.current?.findOne(`#${id}`)
      ).filter(Boolean);
      
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [doc.selectedIds, toolManager.getCurrentToolId()]);

  // Dev-only crosshair for pointer verification
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && stageRef.current) {
      const stage = stageRef.current;
      const crossLayer = new Konva.Layer({ listening: false });
      const h = new Konva.Line({ points: [0,0,0,0], stroke: "rgba(255,0,0,0.5)", strokeWidth: 1 });
      const v = new Konva.Line({ points: [0,0,0,0], stroke: "rgba(255,0,0,0.5)", strokeWidth: 1 });
      crossLayer.add(h, v);
      stage.add(crossLayer);

      const handleCross = (e: any) => {
        const p = getSmartPointerFromEvent(stage, e);
        if (!p) return;
        h.points([0, p.y, stage.width(), p.y]);
        v.points([p.x, 0, p.x, stage.height()]);
        crossLayer.batchDraw();
      };

      stage.on("pointermove.__cross", handleCross);

      return () => {
        stage.off("pointermove.__cross");
        crossLayer.destroy();
      };
    }
  }, [stageRef.current]);

  // Render brush tool preview
  const renderBrushPreview = () => {
    const currentTool = toolManager.getCurrentTool();
    if (currentTool instanceof BrushTool && currentTool.state.isDrawing) {
      const currentStroke = currentTool.getCurrentStroke();
      if (currentStroke) {
        const points = currentStroke.points.flatMap(p => [p.x, p.y]);
        return (
          <Line
            points={points}
            stroke={currentStroke.brush.color}
            strokeWidth={currentStroke.brush.size / zoom}
            opacity={currentStroke.brush.opacity}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        );
      }
    }
    return null;
  };

  return (
    <DesignToolsErrorBoundary>
      <PrecisionCursorManager stageRef={stageRef} containerRef={containerRef}>
        <UnifiedKeyboardHandler />
        <div
          ref={containerRef}
          className={cn(
            "w-full h-full relative overflow-hidden"
          )}
          style={{ touchAction: toolManager.shouldPreventPanning() ? 'none' : 'auto' }}
          data-cursor-managed="true"
        >
        {/* Enhanced Grid System */}
        <EnhancedGrid
          zoom={zoom}
          panOffset={panOffset}
          showGrid={doc.canvas.showGrid}
          gridSize={doc.canvas.gridSize}
          unit={doc.canvas.unit}
          canvasWidth={stageSize.width}
          canvasHeight={stageSize.height}
        />
        
        {/* Rulers functionality now handled by PrecisionRulers in EnhancedViewportSystem */}
        
        {/* Smart Guides */}
        <SmartGuidesSystem
          canvasWidth={doc.canvas.width}
          canvasHeight={doc.canvas.height}
          zoom={zoom}
          panOffset={panOffset}
        />

        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={panOffset.x}
          y={panOffset.y}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleStageClick}
          onWheel={handleWheel}
          draggable={toolManager.getCurrentToolId() === 'hand'}
          onDragEnd={(e) => {
            if (toolManager.getCurrentToolId() === 'hand') {
              setPanOffset({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
        <Layer>
          {/* Grid */}
          {renderGrid()}
          
          {/* Permanent Garment Background - Always Centered */}
          {garmentImage && (
            <Image
              image={garmentImage}
              x={(doc.canvas.width - (garmentImage.width * (doc.canvas.height / garmentImage.height))) / 2}
              y={0}
              width={garmentImage.width * (doc.canvas.height / garmentImage.height)}
              height={doc.canvas.height}
              opacity={0.15}
              listening={false}
            />
          )}
          
          {/* Canvas Border for Reference */}
          <Rect
            x={0}
            y={0}
            width={doc.canvas.width}
            height={doc.canvas.height}
            stroke="hsl(var(--border))"
            strokeWidth={2 / zoom}
            opacity={0.3}
            listening={false}
          />
        </Layer>
        
        {/* Design layer - Individual element opacity preserved, no global opacity */}
        <Layer>
          {doc.nodes.map(renderNode)}
          
          {/* Brush tool live preview */}
          {renderBrushPreview()}
        </Layer>
        
        {/* Selection layer - always fully visible */}
        <Layer>
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            anchorStroke="#0066FF"
            anchorFill="#ffffff"
            anchorSize={8}
            borderStroke="#0066FF"
            borderStrokeWidth={2}
          />
        </Layer>
      </Stage>
      
        {/* Floating Brush Controls */}
        <FloatingBrushControls />
        </div>
        </PrecisionCursorManager>
      </DesignToolsErrorBoundary>
  );
};