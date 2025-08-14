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
      stroke: isSelected ? '#3B82F6' : undefined,
      strokeWidth: isSelected ? 2 : undefined,
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
            />
          );
        } else if (shapeNode.shape === 'circle') {
          return (
            <Circle
              {...commonProps}
              radius={shapeNode.width / 2}
              fill={shapeNode.fill.color}
            />
          );
        } else if (shapeNode.shape === 'line') {
          return (
            <Line
              {...commonProps}
              points={[0, 0, shapeNode.width, 0]}
              stroke={shapeNode.stroke?.color || '#000000'}
              strokeWidth={shapeNode.stroke?.width || 2}
            />
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-muted/20 overflow-hidden relative">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        className="cursor-crosshair"
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
          {/* Artboard background */}
          <Rect
            x={0}
            y={0}
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill={doc.canvas.background === 'transparent' ? '#FFFFFF' : doc.canvas.background}
            stroke="#E5E7EB"
            strokeWidth={1}
          />

          {/* Grid */}
          {doc.canvas.showGrid && (
            <Group>
              {Array.from({ length: Math.ceil(doc.canvas.width / doc.canvas.gridSize) }, (_, i) => (
                <Line
                  key={`grid-v-${i}`}
                  points={[i * doc.canvas.gridSize, 0, i * doc.canvas.gridSize, doc.canvas.height]}
                  stroke="#E5E7EB"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
              {Array.from({ length: Math.ceil(doc.canvas.height / doc.canvas.gridSize) }, (_, i) => (
                <Line
                  key={`grid-h-${i}`}
                  points={[0, i * doc.canvas.gridSize, doc.canvas.width, i * doc.canvas.gridSize]}
                  stroke="#E5E7EB"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
            </Group>
          )}

          {/* Safe area */}
          {doc.canvas.safeAreaPct > 0 && (
            <Rect
              x={doc.canvas.width * (doc.canvas.safeAreaPct / 200)}
              y={doc.canvas.height * (doc.canvas.safeAreaPct / 200)}
              width={doc.canvas.width * (1 - doc.canvas.safeAreaPct / 100)}
              height={doc.canvas.height * (1 - doc.canvas.safeAreaPct / 100)}
              stroke="#10B981"
              strokeWidth={1}
              dash={[5, 5]}
              fill="transparent"
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