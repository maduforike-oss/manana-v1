import React, { memo, useMemo } from 'react';
import { Rect, Circle, Text, Star, RegularPolygon, Line } from 'react-konva';
import { Node, TextNode, ShapeNode } from '../../../lib/studio/types';

interface NodeRendererProps {
  node: Node;
  isSelected: boolean;
  layoutMetrics: {
    printBaseX: number;
    printBaseY: number;
    scaleX: number;
    scaleY: number;
  };
  activeTool: string;
  snapEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<Node>) => void;
}

// Memoized node renderer to prevent unnecessary re-renders
export const NodeRenderer = memo<NodeRendererProps>(({
  node,
  isSelected,
  layoutMetrics,
  activeTool,
  snapEnabled,
  snapToGrid,
  gridSize,
  zoom,
  onSelect,
  onUpdate
}) => {
  const { printBaseX, printBaseY, scaleX, scaleY } = layoutMetrics;

  // Stable callbacks to prevent re-renders
  const handleClick = React.useCallback(() => onSelect(node.id), [onSelect, node.id]);
  
  const handleDragEnd = React.useCallback((e: any) => {
    const newX = (e.target.x() - printBaseX) / scaleX;
    const newY = (e.target.y() - printBaseY) / scaleY;
    
    // Snap to grid if enabled
    const snappedX = (snapEnabled && snapToGrid) ? Math.round(newX / gridSize) * gridSize : newX;
    const snappedY = (snapEnabled && snapToGrid) ? Math.round(newY / gridSize) * gridSize : newY;
    
    onUpdate(node.id, { x: snappedX, y: snappedY });
  }, [printBaseX, printBaseY, scaleX, scaleY, snapEnabled, snapToGrid, gridSize, onUpdate, node.id]);

  // Memoize common props to prevent object recreation
  const commonProps = useMemo(() => ({
    key: node.id,
    x: printBaseX + node.x * scaleX,
    y: printBaseY + node.y * scaleY,
    rotation: node.rotation,
    opacity: node.opacity,
    draggable: activeTool === 'select',
    onClick: handleClick,
    onDragEnd: handleDragEnd,
    stroke: isSelected ? 'hsl(var(--primary))' : undefined,
    strokeWidth: isSelected ? 2 / zoom : 0,
    shadowColor: isSelected ? 'hsl(var(--primary))' : undefined,
    shadowBlur: isSelected ? 10 : 0,
    shadowOpacity: isSelected ? 0.3 : 0,
  }), [
    node.id, node.x, node.y, node.rotation, node.opacity,
    printBaseX, printBaseY, scaleX, scaleY,
    activeTool, isSelected, zoom, handleClick, handleDragEnd
  ]);

  // Render shape nodes
  if (node.type === 'shape') {
    return <ShapeNodeRenderer node={node as ShapeNode} commonProps={commonProps} scaleX={scaleX} scaleY={scaleY} zoom={zoom} isSelected={isSelected} />;
  }

  // Render text nodes
  if (node.type === 'text') {
    return <TextNodeRenderer node={node as TextNode} commonProps={commonProps} scaleX={scaleX} scaleY={scaleY} />;
  }

  return null;
});

// Separate shape renderer component
const ShapeNodeRenderer = memo<{
  node: ShapeNode;
  commonProps: any;
  scaleX: number;
  scaleY: number;
  zoom: number;
  isSelected: boolean;
}>(({ node, commonProps, scaleX, scaleY, zoom, isSelected }) => {
  const shapeProps = useMemo(() => ({
    ...commonProps,
    fill: node.fill.type === 'solid' ? node.fill.color : 'transparent',
    strokeEnabled: !!node.stroke,
    stroke: isSelected ? 'hsl(var(--primary))' : node.stroke?.color,
    strokeWidth: isSelected ? 3 / zoom : (node.stroke?.width || 0) / zoom,
  }), [commonProps, node.fill, node.stroke, isSelected, zoom]);

  switch (node.shape) {
    case 'rect':
      return (
        <Rect
          {...shapeProps}
          width={node.width * scaleX}
          height={node.height * scaleY}
          cornerRadius={node.radius || 0}
        />
      );
    case 'circle':
      return (
        <Circle
          {...shapeProps}
          x={commonProps.x + (node.width * scaleX) / 2}
          y={commonProps.y + (node.height * scaleY) / 2}
          radius={Math.min(node.width * scaleX, node.height * scaleY) / 2}
        />
      );
    case 'triangle':
      return (
        <RegularPolygon
          {...shapeProps}
          x={commonProps.x + (node.width * scaleX) / 2}
          y={commonProps.y + (node.height * scaleY) / 2}
          sides={3}
          radius={Math.min(node.width * scaleX, node.height * scaleY) / 2}
        />
      );
    case 'star':
      return (
        <Star
          {...shapeProps}
          x={commonProps.x + (node.width * scaleX) / 2}
          y={commonProps.y + (node.height * scaleY) / 2}
          numPoints={node.points || 5}
          innerRadius={Math.min(node.width * scaleX, node.height * scaleY) / 4}
          outerRadius={Math.min(node.width * scaleX, node.height * scaleY) / 2}
        />
      );
    case 'line':
      return (
        <Line
          {...shapeProps}
          points={[0, 0, node.width * scaleX, node.height * scaleY]}
          strokeWidth={(node.stroke?.width || 2) / zoom}
        />
      );
    default:
      return null;
  }
});

// Separate text renderer component
const TextNodeRenderer = memo<{
  node: TextNode;
  commonProps: any;
  scaleX: number;
  scaleY: number;
}>(({ node, commonProps, scaleX, scaleY }) => {
  const textProps = useMemo(() => ({
    ...commonProps,
    text: node.text,
    fontSize: node.fontSize * Math.min(scaleX, scaleY),
    fontFamily: node.fontFamily,
    fontStyle: node.fontWeight > 500 ? 'bold' : 'normal',
    fill: node.fill.type === 'solid' ? node.fill.color : 'black',
    width: node.width * scaleX,
    height: node.height * scaleY,
    align: node.align,
    letterSpacing: node.letterSpacing,
    lineHeight: node.lineHeight,
  }), [commonProps, node, scaleX, scaleY]);

  return <Text {...textProps} />;
});

NodeRenderer.displayName = 'NodeRenderer';
ShapeNodeRenderer.displayName = 'ShapeNodeRenderer';
TextNodeRenderer.displayName = 'TextNodeRenderer';