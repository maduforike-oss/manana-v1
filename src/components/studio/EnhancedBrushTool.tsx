import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { BrushEngine, BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { generateId } from '@/lib/utils';
import { attachBrush, getSmartPointer } from '@/utils/konvaPointer';
import type { Node } from '@/lib/studio/types';
import type { SmartPointerEvent } from '@/utils/konvaPointer';

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
  const detachBrushRef = useRef<(() => void) | null>(null);

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

  // Initialize brush attachment with smart pointer handling
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Detach previous brush if exists
    if (detachBrushRef.current) {
      detachBrushRef.current();
    }

    // Attach new brush with smart pointer handling
    detachBrushRef.current = attachBrush(stage, stage.getLayers()[0], {
      onStrokeStart: handleStrokeStart,
      onStrokeMove: handleStrokeMove,
      onStrokeEnd: handleStrokeEnd,
      preventPanning: true,
    });

    return () => {
      if (detachBrushRef.current) {
        detachBrushRef.current();
        detachBrushRef.current = null;
      }
    };
  }, [stageRef.current]);

  const handleStrokeStart = useCallback((pointer: SmartPointerEvent) => {
    if (!brushEngineRef.current) return;

    // Start new brush stroke
    const stroke = brushEngineRef.current.startStroke(pointer, pointer.pressure || 1);
    
    if (stroke) {
      // Create initial node for the stroke
      const newStroke: Node = {
        id: generateId(),
        type: 'path',
        name: isEraser ? 'Eraser Stroke' : 'Brush Stroke',
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: brushOpacity,
        points: [pointer.x, pointer.y],
        stroke: { 
          color: isEraser ? 'transparent' : activeColor, 
          width: brushSize 
        },
        closed: false
      };

      addNode(newStroke);
      setCurrentStroke(newStroke);
      setIsDrawing(true);
      onDrawingStateChange?.(true);
    }
  }, [brushOpacity, activeColor, brushSize, isEraser, addNode, onDrawingStateChange]);

  const handleStrokeMove = useCallback((pointer: SmartPointerEvent) => {
    if (!isDrawing || !currentStroke || !brushEngineRef.current) return;

    // Add point to brush engine
    brushEngineRef.current.addPoint(pointer, pointer.pressure || 1);
    
    // Update the current stroke node with new points
    const currentPoints = currentStroke.points || [];
    const newPoints = [...currentPoints, pointer.x, pointer.y];
    
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
  }, [isDrawing, currentStroke, updateNode, brushSize]);

  const handleStrokeEnd = useCallback((pointer: SmartPointerEvent) => {
    if (!isDrawing || !brushEngineRef.current) return;

    // End the stroke in the brush engine
    const completedStroke = brushEngineRef.current.endStroke();
    
    setIsDrawing(false);
    setCurrentStroke(null);
    onDrawingStateChange?.(false);
    
    // Save the snapshot for undo/redo
    saveSnapshot();
  }, [isDrawing, onDrawingStateChange, saveSnapshot]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={panOffset.x}
      y={panOffset.y}
      // Event handling now managed by attachBrush utility
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