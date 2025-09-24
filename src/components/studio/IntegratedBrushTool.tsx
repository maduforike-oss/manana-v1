import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { generateId } from '@/lib/utils';
import type { Node, PathNode } from '@/lib/studio/types';
import { getSmartPointer, fitStageToContainer } from '@/utils/konvaCoords';

const IntegratedBrushTool = () => {
  const stageRef = useRef(null);
  const { 
    doc,
    addNode, 
    updateNode, 
    activeColor, 
    brushSize, 
    brushOpacity,
    zoom,
    panOffset,
    saveSnapshot 
  } = useStudioStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Node | null>(null);

  const startDrawing = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // TODO(lovable): removed legacy coord math; now using getSmartPointer()
    const transformedPos = getSmartPointer(stage);
    if (!transformedPos) return;

    const newStroke: PathNode = {
      id: generateId(),
      type: 'path',
      name: 'Brush Stroke',
      x: transformedPos.x,
      y: transformedPos.y,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: brushOpacity,
      points: [transformedPos.x, transformedPos.y],
      stroke: { color: activeColor, width: brushSize },
      closed: false
    };

    addNode(newStroke);
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || !currentStroke) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    // TODO(lovable): removed legacy coord math; now using getSmartPointer()
    const transformedPos = getSmartPointer(stage);
    if (!transformedPos) return;
    
    const newPoints = [...((currentStroke as any).points || []), transformedPos.x, transformedPos.y];
    
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
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setCurrentStroke(null);
    saveSnapshot();
  };

  // Filter path nodes (brush strokes) from all nodes
  const brushStrokes = doc.nodes.filter(node => node.type === 'path') as PathNode[];

  return (
    <Stage
      ref={stageRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
      width={800}
      height={600}
      scaleX={zoom}
      scaleY={zoom}
      x={panOffset.x}
      y={panOffset.y}
    >
      <Layer>
        {/* Render garment template placeholder */}
        {doc.canvas.garmentType && (
          <Rect
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill="rgba(200, 200, 200, 0.3)"
            stroke="rgba(150, 150, 150, 0.5)"
            strokeWidth={1}
          />
        )}
        
        {/* Render all brush strokes */}
        {brushStrokes.map((stroke) => (
          <Line
            key={stroke.id}
            points={stroke.points || []}
            stroke={stroke.stroke?.color || activeColor}
            strokeWidth={stroke.stroke?.width || brushSize}
            opacity={stroke.opacity || 1}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default IntegratedBrushTool;