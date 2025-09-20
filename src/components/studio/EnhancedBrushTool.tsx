import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Line } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { BrushEngine, BRUSH_PRESETS, BrushStroke } from '@/lib/studio/brushEngine';
import { generateId } from '@/lib/utils';

interface EnhancedBrushToolProps {
  isActive: boolean;
  brushSettings: {
    size: number;
    opacity: number;
    color: string;
    hardness: number;
    type: keyof typeof BRUSH_PRESETS;
  };
  onStrokeComplete?: (stroke: BrushStroke) => void;
}

export const EnhancedBrushTool: React.FC<EnhancedBrushToolProps> = ({
  isActive,
  brushSettings,
  onStrokeComplete
}) => {
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { addNode, zoom } = useStudioStore();

  // Initialize brush engine
  useEffect(() => {
    const presetSettings = BRUSH_PRESETS[brushSettings.type];
    brushEngineRef.current = new BrushEngine({
      ...presetSettings,
      size: brushSettings.size,
      opacity: brushSettings.opacity,
      color: brushSettings.color,
      hardness: brushSettings.hardness
    });
  }, [brushSettings]);

  const handleMouseDown = useCallback((e: any) => {
    if (!isActive || !brushEngineRef.current) return;
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const pressure = e.evt.pressure || 1;
    
    const stroke = brushEngineRef.current.startStroke({ x: pos.x, y: pos.y }, pressure);
    setCurrentStroke(stroke);
  }, [isActive]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const pressure = e.evt.pressure || 1;
    
    brushEngineRef.current.addPoint({ x: pos.x, y: pos.y }, pressure);
    setCurrentStroke({ ...currentStroke });
  }, [isDrawing, currentStroke]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    setIsDrawing(false);
    const completedStroke = brushEngineRef.current.endStroke();
    
    if (completedStroke) {
      // Convert stroke to path node
      const points = completedStroke.points.flatMap(p => [p.x, p.y]);
      
      addNode({
        id: generateId(),
        type: 'path',
        name: `Brush Stroke`,
        x: Math.min(...completedStroke.points.map(p => p.x)),
        y: Math.min(...completedStroke.points.map(p => p.y)),
        width: Math.max(...completedStroke.points.map(p => p.x)) - Math.min(...completedStroke.points.map(p => p.x)),
        height: Math.max(...completedStroke.points.map(p => p.y)) - Math.min(...completedStroke.points.map(p => p.y)),
        rotation: 0,
        opacity: completedStroke.brush.opacity,
        points,
        stroke: {
          color: completedStroke.brush.color,
          width: completedStroke.brush.size
        },
        closed: false
      });

      onStrokeComplete?.(completedStroke);
    }
    
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, addNode, onStrokeComplete]);

  // Render current stroke while drawing
  if (currentStroke && isDrawing) {
    const points = currentStroke.points.flatMap(p => [p.x, p.y]);
    
    return (
      <Line
        points={points}
        stroke={currentStroke.brush.color}
        strokeWidth={currentStroke.brush.size / zoom}
        opacity={currentStroke.brush.opacity}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation="source-over"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    );
  }

  return null;
};