import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import Konva from 'konva';

interface LiveDrawingCanvasProps {
  width?: number;
  height?: number;
}

export const LiveDrawingCanvas: React.FC<LiveDrawingCanvasProps> = ({
  width = 800,
  height = 600
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const {
    doc,
    liveStroke,
    activeTool,
    zoom,
    panOffset,
    startLiveStroke,
    extendLiveStroke,
    commitLiveStroke,
    cancelLiveStroke,
    activeColor,
    brushSize,
    brushOpacity,
    isEraser
  } = useStudioStore();

  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return { x: 0, y: 0 };
    
    // Account for zoom and pan
    return {
      x: (pointerPos.x - panOffset.x) / zoom,
      y: (pointerPos.y - panOffset.y) / zoom
    };
  }, [zoom, panOffset]);

  const handlePointerDown = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    if (activeTool !== 'brush') return;
    
    const pos = getRelativePointerPosition();
    startLiveStroke(pos.x, pos.y);
    setIsDrawing(true);
  }, [activeTool, getRelativePointerPosition, startLiveStroke]);

  const handlePointerMove = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!isDrawing || activeTool !== 'brush') return;
    
    const pos = getRelativePointerPosition();
    extendLiveStroke(pos.x, pos.y);
  }, [isDrawing, activeTool, getRelativePointerPosition, extendLiveStroke]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    
    commitLiveStroke();
    setIsDrawing(false);
  }, [isDrawing, commitLiveStroke]);

  const handlePointerLeave = useCallback(() => {
    if (isDrawing) {
      cancelLiveStroke();
      setIsDrawing(false);
    }
  }, [isDrawing, cancelLiveStroke]);

  // Render permanent brush strokes
  const renderBrushStrokes = () => {
    return doc.nodes
      .filter(node => node.type === 'brush-stroke')
      .map(stroke => (
        <Line
          key={stroke.id}
          points={stroke.strokeData.points?.flatMap(p => [p.x, p.y]) || []}
          stroke={stroke.strokeData.color}
          strokeWidth={stroke.strokeData.size}
          opacity={stroke.strokeData.opacity}
          lineCap="round"
          lineJoin="round"
          tension={0.3}
          globalCompositeOperation={stroke.strokeData.isEraser ? 'destination-out' : 'source-over'}
        />
      ));
  };

  // Render live stroke for real-time preview
  const renderLiveStroke = () => {
    if (!liveStroke || !liveStroke.strokeData.points?.length) return null;
    
    return (
      <Line
        points={liveStroke.strokeData.points.flatMap(p => [p.x, p.y])}
        stroke={liveStroke.strokeData.color}
        strokeWidth={liveStroke.strokeData.size}
        opacity={liveStroke.strokeData.opacity}
        lineCap="round"
        lineJoin="round"
        tension={0.3}
        globalCompositeOperation={liveStroke.strokeData.isEraser ? 'destination-out' : 'source-over'}
      />
    );
  };

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ 
          cursor: activeTool === 'brush' ? 'crosshair' : 'default',
          border: '1px solid hsl(var(--border))'
        }}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width / zoom}
            height={height / zoom}
            fill="white"
          />
          
          {/* Permanent strokes */}
          {renderBrushStrokes()}
          
          {/* Live stroke preview */}
          {renderLiveStroke()}
        </Layer>
      </Stage>
      
      {/* Brush cursor preview */}
      {activeTool === 'brush' && (
        <div 
          className="pointer-events-none fixed z-50 rounded-full border border-primary/30"
          style={{
            width: brushSize * zoom,
            height: brushSize * zoom,
            backgroundColor: isEraser ? 'transparent' : activeColor + '40',
            borderColor: isEraser ? 'red' : activeColor,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  );
};