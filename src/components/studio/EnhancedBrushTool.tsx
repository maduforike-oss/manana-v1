import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { BrushEngine, BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { generateId } from '@/lib/utils';
import type { Node } from '@/lib/studio/types';

interface EnhancedBrushToolProps {
  width: number;
  height: number;
  stageRef: React.RefObject<any>;
  garmentImage?: HTMLImageElement | null;
  onDrawingStateChange?: (isDrawing: boolean) => void;
}

export const EnhancedBrushTool: React.FC<EnhancedBrushToolProps> = ({
  width,
  height,
  stageRef,
  garmentImage,
  onDrawingStateChange
}) => {
  const {
    doc,
    addNode,
    updateNode,
    activeColor,
    brushSize,
    brushOpacity,
    brushHardness,
    brushType,
    isEraser,
    zoom,
    panOffset,
    saveSnapshot
  } = useStudioStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<any>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);

  // Initialize brush engine with current settings
  useEffect(() => {
    const presetSettings = BRUSH_PRESETS[brushType] || BRUSH_PRESETS.pencil;
    brushEngineRef.current = new BrushEngine({
      ...presetSettings,
      size: brushSize,
      opacity: brushOpacity,
      color: activeColor,
      hardness: brushHardness,
      blendMode: isEraser ? 'normal' : presetSettings.blendMode
    });
  }, [activeColor, brushSize, brushOpacity, brushHardness, brushType, isEraser]);

  // Get pointer position with proper coordinate transformation
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    const point = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(point);
  }, [stageRef]);

  const startDrawing = useCallback((e: any) => {
    if (!brushEngineRef.current) return;

    const pos = getRelativePointerPosition();
    const pressure = e.evt?.pressure || 1;

    // Start new brush stroke
    const stroke = brushEngineRef.current.startStroke(pos, pressure);
    
    if (stroke) {
      // Create initial node for the stroke
      const newStroke: Node = {
        id: generateId(),
        type: 'path',
        name: isEraser ? 'Eraser Stroke' : 'Brush Stroke',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: brushOpacity,
        points: [pos.x, pos.y],
        stroke: { 
          color: isEraser ? 'transparent' : activeColor, 
          width: brushSize 
        },
        closed: false
        // Note: globalCompositeOperation handled by canvas renderer
      };

      addNode(newStroke);
      setCurrentStroke(newStroke);
      setIsDrawing(true);
      onDrawingStateChange?.(true);
    }
  }, [getRelativePointerPosition, brushOpacity, activeColor, brushSize, isEraser, addNode, onDrawingStateChange]);

  const draw = useCallback((e: any) => {
    if (!isDrawing || !currentStroke || !brushEngineRef.current) return;

    const pos = getRelativePointerPosition();
    const pressure = e.evt?.pressure || 1;

    // Add point to brush engine
    brushEngineRef.current.addPoint(pos, pressure);
    
    // Update the current stroke node with new points
    const currentPoints = currentStroke.points || [];
    const newPoints = [...currentPoints, pos.x, pos.y];
    
    // Calculate bounding box
    const xs = [];
    const ys = [];
    for (let i = 0; i < newPoints.length; i += 2) {
      xs.push(newPoints[i]);
      ys.push(newPoints[i + 1]);
    }
    
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    updateNode(currentStroke.id, {
      points: newPoints,
      x: minX - brushSize / 2,
      y: minY - brushSize / 2,
      width: maxX - minX + brushSize,
      height: maxY - minY + brushSize
    });
  }, [isDrawing, currentStroke, getRelativePointerPosition, updateNode, brushSize]);

  const endDrawing = useCallback(() => {
    if (!isDrawing || !brushEngineRef.current) return;

    // End the stroke in the brush engine
    const completedStroke = brushEngineRef.current.endStroke();
    
    setIsDrawing(false);
    setCurrentStroke(null);
    onDrawingStateChange?.(false);
    
    // Save the snapshot for undo/redo
    saveSnapshot();
  }, [isDrawing, onDrawingStateChange, saveSnapshot]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: any) => {
    e.evt.preventDefault();
    startDrawing(e);
  }, [startDrawing]);

  const handleTouchMove = useCallback((e: any) => {
    e.evt.preventDefault();
    draw(e);
  }, [draw]);

  const handleTouchEnd = useCallback((e: any) => {
    e.evt.preventDefault();
    endDrawing();
  }, [endDrawing]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={panOffset.x}
      y={panOffset.y}
      onMouseDown={startDrawing}
      onMousemove={draw}
      onMouseup={endDrawing}
      onMouseleave={endDrawing}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Layer>
        {/* Garment template */}
        {garmentImage && (
          <KonvaImage
            image={garmentImage}
            width={doc.canvas.width}
            height={doc.canvas.height}
            opacity={0.8}
          />
        )}
        
        {/* Render all nodes */}
        {doc.nodes.map((node) => {
          if (node.type === 'path') {
            return (
              <Line
                key={node.id}
                points={node.points}
                stroke={node.stroke?.color}
                strokeWidth={node.stroke?.width}
                opacity={node.opacity}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                // Handle eraser-like behavior through opacity or other props
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
};