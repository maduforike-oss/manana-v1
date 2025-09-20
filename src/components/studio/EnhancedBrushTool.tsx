import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Line, Group } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { BrushEngine, BRUSH_PRESETS, BrushStroke } from '@/lib/studio/brushEngine';
import { generateId } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/useTouchGestures';

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
  const stageRef = useRef<any>(null);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [completedStrokes, setCompletedStrokes] = useState<BrushStroke[]>([]);
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

  // Unified pointer event handlers for mouse, touch, and stylus
  const handlePointerDown = useCallback((e: any) => {
    if (!isActive || !brushEngineRef.current) return;
    
    e.evt.preventDefault();
    setIsDrawing(true);
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Enhanced pressure detection for Apple Pencil/stylus
    const pressure = e.evt.pressure || 
                    (e.evt.pointerType === 'pen' ? (e.evt.force || 0.5) : 1) ||
                    (e.evt.touches?.[0]?.force || 1);
    
    const stroke = brushEngineRef.current.startStroke({ x: pos.x, y: pos.y }, pressure);
    setCurrentStroke(stroke);
  }, [isActive]);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Enhanced pressure detection
    const pressure = e.evt.pressure || 
                    (e.evt.pointerType === 'pen' ? (e.evt.force || 0.5) : 1) ||
                    (e.evt.touches?.[0]?.force || 1);
    
    brushEngineRef.current.addPoint({ x: pos.x, y: pos.y }, pressure);
    setCurrentStroke({ ...currentStroke });
  }, [isDrawing, currentStroke]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    setIsDrawing(false);
    const completedStroke = brushEngineRef.current.endStroke();
    
    if (completedStroke && completedStroke.points.length > 1) {
      // Add to completed strokes for persistent rendering
      setCompletedStrokes(prev => [...prev, completedStroke]);
      
      // Convert stroke to persistent path node
      const points = completedStroke.points.flatMap(p => [p.x, p.y]);
      const bounds = {
        minX: Math.min(...completedStroke.points.map(p => p.x)),
        minY: Math.min(...completedStroke.points.map(p => p.y)),
        maxX: Math.max(...completedStroke.points.map(p => p.x)),
        maxY: Math.max(...completedStroke.points.map(p => p.y))
      };
      
      addNode({
        id: generateId(),
        type: 'path',
        name: `Brush Stroke`,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX || 1,
        height: bounds.maxY - bounds.minY || 1,
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

  // Render all completed and current strokes
  return (
    <Group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      listening={isActive}
    >
      {/* Render completed strokes */}
      {completedStrokes.map((stroke, index) => {
        const points = stroke.points.flatMap(p => [p.x, p.y]);
        return (
          <Line
            key={`completed-${index}`}
            points={points}
            stroke={stroke.brush.color}
            strokeWidth={stroke.brush.size / zoom}
            opacity={stroke.brush.opacity}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="source-over"
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      })}
      
      {/* Render current stroke while drawing */}
      {currentStroke && isDrawing && (
        <Line
          points={currentStroke.points.flatMap(p => [p.x, p.y])}
          stroke={currentStroke.brush.color}
          strokeWidth={currentStroke.brush.size / zoom}
          opacity={currentStroke.brush.opacity}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation="source-over"
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
};