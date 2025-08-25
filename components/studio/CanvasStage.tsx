"use client";

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';
import Konva from 'konva';
import { useStudioStore } from '../../lib/studio/store';

export const CanvasStage = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  
  const { 
    doc,
    activeTool,
    zoom,
    panOffset,
    addNode,
    updateNode,
    selectNode,
    clearSelection
  } = useStudioStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container();
        if (container) {
          const containerRect = container.getBoundingClientRect();
          setStageSize({
            width: containerRect.width,
            height: containerRect.height,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  };

  return (
    <div className="flex-1 relative bg-muted/10">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        className="bg-white"
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill="white"
            stroke="#ddd"
            strokeWidth={1}
          />
        </Layer>
        
        <Layer>
          {doc.nodes.map((node) => {
            if (node.type === 'text') {
              return (
                <Text
                  key={node.id}
                  id={node.id}
                  x={node.x}
                  y={node.y}
                  text={node.text}
                  fontSize={node.fontSize}
                  fontFamily={node.fontFamily}
                  fill={node.fill}
                  draggable
                  onClick={() => selectNode(node.id)}
                />
              );
            }
            
            if (node.type === 'shape' && node.shape === 'rect') {
              return (
                <Rect
                  key={node.id}
                  id={node.id}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={node.fill}
                  stroke={node.stroke}
                  strokeWidth={node.strokeWidth}
                  draggable
                  onClick={() => selectNode(node.id)}
                />
              );
            }
            
            if (node.type === 'shape' && node.shape === 'circle') {
              return (
                <Circle
                  key={node.id}
                  id={node.id}
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2}
                  radius={Math.min(node.width, node.height) / 2}
                  fill={node.fill}
                  stroke={node.stroke}
                  strokeWidth={node.strokeWidth}
                  draggable
                  onClick={() => selectNode(node.id)}
                />
              );
            }
            
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};