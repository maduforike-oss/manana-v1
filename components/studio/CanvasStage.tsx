"use client";

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import Konva from 'konva';
import { useStudioStore } from '@/lib/studio/store';
import { Node, TextNode, ShapeNode, ImageNode } from '@/lib/studio/types';

export const CanvasStage = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  
  const { 
    doc, 
    zoom, 
    panOffset, 
    setPanOffset, 
    activeTool, 
    addNode, 
    updateNode, 
    selectNode, 
    clearSelection,
    snapEnabled,
    mockup
  } = useStudioStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = stageRef.current?.container();
      if (container) {
        const rect = container.getBoundingClientRect();
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create new text node
  const createTextNode = (x: number, y: number): TextNode => ({
    id: `text-${Date.now()}`,
    type: 'text',
    name: 'Text',
    x,
    y,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    text: 'Click to edit',
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: 0,
    align: 'left',
    fill: { type: 'solid', color: '#000000' },
  });

  // Create new shape node
  const createShapeNode = (shape: ShapeNode['shape'], x: number, y: number): ShapeNode => ({
    id: `${shape}-${Date.now()}`,
    type: 'shape',
    name: shape.charAt(0).toUpperCase() + shape.slice(1),
    x,
    y,
    width: shape === 'line' ? 100 : 100,
    height: shape === 'line' ? 0 : 100,
    rotation: 0,
    opacity: 1,
    shape,
    fill: { type: 'solid', color: '#3B82F6' },
    stroke: { color: '#1E40AF', width: 2 },
    radius: shape === 'rect' ? 0 : undefined,
    points: shape === 'star' ? 5 : undefined,
  });

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Convert screen coordinates to canvas coordinates
    const x = (pointer.x - panOffset.x) / zoom;
    const y = (pointer.y - panOffset.y) / zoom;

    // Handle tool actions
    switch (activeTool) {
      case 'text':
        addNode(createTextNode(x, y));
        break;
      case 'rect':
        addNode(createShapeNode('rect', x, y));
        break;
      case 'circle':
        addNode(createShapeNode('circle', x, y));
        break;
      case 'line':
        addNode(createShapeNode('line', x, y));
        break;
      case 'triangle':
        addNode(createShapeNode('triangle', x, y));
        break;
      case 'star':
        addNode(createShapeNode('star', x, y));
        break;
      default:
        // If clicking on empty space with select tool, clear selection
        if (e.target === stage) {
          clearSelection();
        }
    }
  };

  // Handle node click
  const handleNodeClick = (nodeId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    selectNode(nodeId);
  };

  // Handle node drag
  const handleNodeDrag = (nodeId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    updateNode(nodeId, {
      x: node.x(),
      y: node.y(),
    });
  };

  // Render a node
  const renderNode = (node: Node) => {
    if (node.hidden) return null;

    const isSelected = doc.selectedIds.includes(node.id);
    const commonProps = {
      key: node.id,
      x: node.x,
      y: node.y,
      rotation: node.rotation,
      opacity: node.opacity,
      draggable: activeTool === 'select' && !node.locked,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleNodeClick(node.id, e),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleNodeDrag(node.id, e),
      stroke: isSelected ? '#FF0080' : undefined,
      strokeWidth: isSelected ? 3 : undefined,
    };

    switch (node.type) {
      case 'text':
        const textNode = node as TextNode;
        return (
          <Text
            {...commonProps}
            text={textNode.text}
            fontSize={textNode.fontSize}
            fontFamily={textNode.fontFamily}
            fontStyle={textNode.fontWeight > 500 ? 'bold' : 'normal'}
            align={textNode.align}
            width={textNode.width}
            height={textNode.height}
            fill={textNode.fill.color}
            shadowColor={isSelected ? '#FF0080' : undefined}
            shadowBlur={isSelected ? 10 : undefined}
            shadowOpacity={isSelected ? 0.5 : undefined}
          />
        );

      case 'shape':
        const shapeNode = node as ShapeNode;
        
        if (shapeNode.shape === 'rect') {
          return (
            <Rect
              {...commonProps}
              width={shapeNode.width}
              height={shapeNode.height}
              fill={shapeNode.fill.color}
              cornerRadius={shapeNode.radius || 0}
              shadowColor={isSelected ? '#FF0080' : undefined}
              shadowBlur={isSelected ? 15 : undefined}
              shadowOpacity={isSelected ? 0.4 : undefined}
            />
          );
        } else if (shapeNode.shape === 'circle') {
          return (
            <Circle
              {...commonProps}
              radius={shapeNode.width / 2}
              fill={shapeNode.fill.color}
              shadowColor={isSelected ? '#FF0080' : undefined}
              shadowBlur={isSelected ? 15 : undefined}
              shadowOpacity={isSelected ? 0.4 : undefined}
            />
          );
        } else if (shapeNode.shape === 'line') {
          return (
            <Line
              {...commonProps}
              points={[0, 0, shapeNode.width, 0]}
              stroke={shapeNode.stroke?.color || '#000000'}
              strokeWidth={shapeNode.stroke?.width || 2}
              shadowColor={isSelected ? '#FF0080' : undefined}
              shadowBlur={isSelected ? 10 : undefined}
              shadowOpacity={isSelected ? 0.6 : undefined}
            />
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 studio-canvas overflow-hidden relative">
      {/* Enhanced Canvas Effects Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-4 right-4 w-40 h-40 bg-studio-accent-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-studio-accent-purple/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Artboard indicator overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute border-2 border-primary/20 bg-primary/5 backdrop-blur-sm"
          style={{
            left: `${panOffset.x + (stageSize.width - doc.canvas.width * zoom) / 2}px`,
            top: `${panOffset.y + (stageSize.height - doc.canvas.height * zoom) / 2}px`,
            width: `${doc.canvas.width * zoom}px`,
            height: `${doc.canvas.height * zoom}px`,
            transform: 'translate3d(0,0,0)'
          }}
        />
      </div>

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        className="cursor-crosshair relative z-10"
      >
        {/* Background layer */}
        <Layer>
          <Rect
            width={stageSize.width / zoom}
            height={stageSize.height / zoom}
            fill="transparent"
          />
        </Layer>

        {/* Mockup layer */}
        {mockup.opacity > 0 && (
          <Layer>
            <Rect
              x={0}
              y={0}
              width={doc.canvas.width}
              height={doc.canvas.height}
              fill="#F3F4F6"
              opacity={mockup.opacity * 0.3}
            />
          </Layer>
        )}

        {/* Artboard layer */}
        <Layer>
          {/* Enhanced Artboard background */}
          <Rect
            x={0}
            y={0}
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill={doc.canvas.background === 'transparent' ? '#FFFFFF' : doc.canvas.background}
            stroke="#FF0080"
            strokeWidth={2}
            shadowColor="rgba(255,0,128,0.3)"
            shadowBlur={10}
            shadowOffset={{ x: 0, y: 4 }}
            dash={[10, 5]}
          />

          {/* Enhanced Grid */}
          {doc.canvas.showGrid && (
            <Group>
              {Array.from({ length: Math.ceil(doc.canvas.width / doc.canvas.gridSize) }, (_, i) => (
                <Line
                  key={`grid-v-${i}`}
                  points={[i * doc.canvas.gridSize, 0, i * doc.canvas.gridSize, doc.canvas.height]}
                  stroke={i % 5 === 0 ? "#8B5CF6" : "#E5E7EB"}
                  strokeWidth={i % 5 === 0 ? 1 : 0.5}
                  opacity={i % 5 === 0 ? 0.4 : 0.2}
                />
              ))}
              {Array.from({ length: Math.ceil(doc.canvas.height / doc.canvas.gridSize) }, (_, i) => (
                <Line
                  key={`grid-h-${i}`}
                  points={[0, i * doc.canvas.gridSize, doc.canvas.width, i * doc.canvas.gridSize]}
                  stroke={i % 5 === 0 ? "#8B5CF6" : "#E5E7EB"}
                  strokeWidth={i % 5 === 0 ? 1 : 0.5}
                  opacity={i % 5 === 0 ? 0.4 : 0.2}
                />
              ))}
            </Group>
          )}

          {/* Enhanced Safe area */}
          {doc.canvas.safeAreaPct > 0 && (
            <Rect
              x={doc.canvas.width * (doc.canvas.safeAreaPct / 200)}
              y={doc.canvas.height * (doc.canvas.safeAreaPct / 200)}
              width={doc.canvas.width * (1 - doc.canvas.safeAreaPct / 100)}
              height={doc.canvas.height * (1 - doc.canvas.safeAreaPct / 100)}
              stroke="#00D4AA"
              strokeWidth={2}
              dash={[8, 4]}
              fill="transparent"
              opacity={0.7}
              shadowColor="#00D4AA"
              shadowBlur={5}
            />
          )}
        </Layer>

        {/* Content layer */}
        <Layer>
          {doc.nodes.map(renderNode)}
        </Layer>
      </Stage>
    </div>
  );
};