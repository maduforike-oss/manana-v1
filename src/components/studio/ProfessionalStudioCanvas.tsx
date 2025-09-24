import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Text, Image as KonvaImage, Rect, Circle } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { Node } from '@/lib/studio/types';
import { getSmartPointer, getSmartPointerFromEvent, fitStageToContainer } from '@/utils/konvaCoords';

// Professional layer-based design studio following the user's architecture pattern
export const ProfessionalStudioCanvas = () => {
  const stageRef = useRef<any>(null);
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any>(null);
  
  const { 
    doc, 
    activeTool, 
    zoom, 
    panOffset, 
    addNode, 
    updateNode, 
    selectNode, 
    clearSelection,
    saveSnapshot,
    activeColor,
    brushSize,
    brushOpacity
  } = useStudioStore();

  // TODO(lovable): removed legacy coord math; now using getSmartPointer()
  // Professional coordinate transformation using transform-safe helpers
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    return getSmartPointer(stage) || { x: 0, y: 0 };
  }, []);

  // Load garment template with 100% fidelity
  useEffect(() => {
    const loadGarmentTemplate = async () => {
      if (!doc.canvas.garmentType) return;
      
      try {
        const { getGarmentView } = await import('@/lib/api/garments');
        const garmentView = await getGarmentView(doc.canvas.garmentType, 'front', 'white');
        
        if (garmentView?.url) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => setGarmentImage(img);
          img.src = garmentView.url;
        }
      } catch (error) {
        console.warn('Failed to load garment template:', error);
      }
    };

    loadGarmentTemplate();
  }, [doc.canvas.garmentType]);

  // Handle stage resize with container sync
  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    const onResize = () => {
      fitStageToContainer(stage);
      const rect = stage.container().getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };
    
    const ro = new ResizeObserver(onResize);
    ro.observe(stage.container());
    window.addEventListener("resize", onResize, { passive: true });

    onResize(); // initial

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Enhanced brush drawing logic using store settings
  const handleBrushDraw = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // TODO(lovable): removed legacy coord math; now using getSmartPointer()
    const pos = getSmartPointer(stage);
    if (!pos) return;

    if (isDrawing && currentStroke) {
      const newPoints = [...currentStroke.points, pos.x, pos.y];
      updateNode(currentStroke.id, { points: newPoints });
    } else {
      // Start a new stroke with current brush settings
      const newStroke = {
        id: `brush-${Date.now()}`,
        type: 'path' as const,
        name: 'Brush Stroke',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: brushOpacity,
        points: [pos.x, pos.y],
        stroke: { color: activeColor, width: brushSize },
        closed: false
      };
      addNode(newStroke);
      setCurrentStroke(newStroke);
      setIsDrawing(true);
    }
  }, [isDrawing, currentStroke, updateNode, addNode, activeColor, brushSize, brushOpacity]);

  const endBrushDraw = useCallback(() => {
    setIsDrawing(false);
    setCurrentStroke(null);
  }, []);

  // Professional pointer event handling
  const handlePointerDown = useCallback((e: any) => {
    const pos = getRelativePointerPosition();
    
    // Handle different tools with persistent layer approach
    switch (activeTool) {
      case 'brush':
        handleBrushDraw(e);
        break;
        
      case 'text':
        const textNode: Node = {
          id: `text-${Date.now()}`,
          type: 'text',
          name: 'Text',
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 30,
          rotation: 0,
          opacity: 1,
          text: 'Double click to edit',
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 0,
          align: 'left',
          fill: { type: 'solid', color: '#000000' }
        };
        addNode(textNode);
        break;
        
      case 'select':
        // Handle selection on pointer down
        const clickedElement = e.target;
        if (clickedElement !== e.target.getStage()) {
          const nodeId = clickedElement.id();
          if (nodeId) {
            selectNode(nodeId);
          }
        } else {
          clearSelection();
        }
        break;
    }
  }, [activeTool, addNode, selectNode, clearSelection, getRelativePointerPosition, handleBrushDraw]);

  // Handle pointer move for brush drawing
  const handlePointerMove = useCallback((e: any) => {
    if (activeTool === 'brush' && isDrawing) {
      handleBrushDraw(e);
    }
  }, [activeTool, isDrawing, handleBrushDraw]);

  // Handle pointer up for brush drawing
  const handlePointerUp = useCallback((e: any) => {
    if (activeTool === 'brush' && isDrawing) {
      endBrushDraw();
      saveSnapshot();
    }
  }, [activeTool, isDrawing, endBrushDraw, saveSnapshot]);

  // Render nodes with proper layer management
  const renderLayer = (layer: Node) => {
    const isSelected = doc.selectedIds.includes(layer.id);
    
    const commonProps = {
      id: layer.id,
      x: layer.x,
      y: layer.y,
      rotation: layer.rotation || 0,
      opacity: layer.opacity || 1, // Individual layer opacity, not global
      draggable: activeTool === 'select' && !layer.locked,
      onDragEnd: (e: any) => {
        updateNode(layer.id, {
          x: e.target.x(),
          y: e.target.y()
        });
        saveSnapshot();
      }
    };

    switch (layer.type) {
      case 'path':
        return (
          <Line
            key={layer.id}
            {...commonProps}
            points={layer.points}
            stroke={layer.stroke?.color || '#000000'}
            strokeWidth={layer.stroke?.width || 2}
            lineCap="round"
            lineJoin="round"
            closed={layer.closed || false}
          />
        );
        
      case 'text':
        return (
          <Text
            key={layer.id}
            {...commonProps}
            text={layer.text}
            fontSize={layer.fontSize}
            fontFamily={layer.fontFamily}
            fill={layer.fill?.type === 'solid' ? layer.fill.color : '#000000'}
            align={layer.align}
          />
        );
        
      case 'shape':
        if (layer.shape === 'rect') {
          return (
            <Rect
              key={layer.id}
              {...commonProps}
              width={layer.width}
              height={layer.height}
              fill={layer.fill?.type === 'solid' ? layer.fill.color : '#3B82F6'}
              stroke={isSelected ? '#0066FF' : layer.stroke?.color}
              strokeWidth={isSelected ? 3 : (layer.stroke?.width || 0)}
            />
          );
        } else if (layer.shape === 'circle') {
          return (
            <Circle
              key={layer.id}
              {...commonProps}
              radius={Math.min(layer.width, layer.height) / 2}
              fill={layer.fill?.type === 'solid' ? layer.fill.color : '#3B82F6'}
              stroke={isSelected ? '#0066FF' : layer.stroke?.color}
              strokeWidth={isSelected ? 3 : (layer.stroke?.width || 0)}
            />
          );
        }
        break;
        
      default:
        return null;
    }
  };

  return (
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
    >
      <Layer>
        {/* Garment template at 100% opacity - maintain template fidelity */}
        {garmentImage && (
          <KonvaImage 
            image={garmentImage} 
            x={50}
            y={50}
            width={doc.canvas.width * 0.8}
            height={doc.canvas.height * 0.8}
            opacity={1.0} 
            listening={false}
          />
        )}
        
        {/* All user-created layers from persistent state */}
        {doc.nodes.map(renderLayer)}
      </Layer>
    </Stage>
  );
};