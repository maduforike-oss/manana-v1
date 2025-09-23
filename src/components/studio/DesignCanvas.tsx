import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image, Line } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { EnhancedBrushTool } from './EnhancedBrushTool';
import { PersistentBrushLayer } from './PersistentBrushLayer';
import { generateId } from '@/lib/utils';
import { UnifiedCursorSystem } from './UnifiedCursorSystem';
import { FloatingBrushPanel } from './FloatingBrushPanel';
import { PreciseCanvasDetector } from './PreciseCanvasDetector';
import { useCoordinateManager } from './CoordinateManager';

interface DesignCanvasProps {
  garmentImage: HTMLImageElement | null;
  stageSize: { width: number; height: number };
  garmentDimensions: {
    width: number;
    height: number;
    printArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  garmentImage,
  stageSize,
  garmentDimensions
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBrushPanel, setShowBrushPanel] = useState(false);
  const [brushSettings, setBrushSettings] = useState({
    size: 5,
    opacity: 1,
    color: '#000000',
    hardness: 0.8,
    type: 'pencil' as const,
    flow: 1.0,
    spacing: 0.1,
    pressureSizeMultiplier: 0.5,
    pressureOpacityMultiplier: 0.3,
    smoothing: 0.5,
    blendMode: 'normal' as const
  });

  const handleBrushSettingsChange = useCallback((newSettings: any) => {
    setBrushSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  const { registerCanvas, unregisterCanvas } = useCoordinateManager();
  
  const {
    doc,
    zoom,
    panOffset,
    activeTool,
    selectNode,
    updateNode,
    addNode,
    clearSelection,
    setZoom,
    setPanOffset
  } = useStudioStore();

  // Register canvas for coordinate management
  useEffect(() => {
    if (stageRef.current) {
      registerCanvas(stageRef.current.container());
    }
    return () => unregisterCanvas();
  }, [registerCanvas, unregisterCanvas]);

  // Show brush panel when brush/eraser tools are active
  useEffect(() => {
    setShowBrushPanel(activeTool === 'brush' || activeTool === 'eraser');
  }, [activeTool]);

  const { width: garmentWidth, height: garmentHeight, printArea } = garmentDimensions;
  
  // Calculate actual positions on stage
  const garmentX = stageSize.width / 2 - garmentWidth / 2;
  const garmentY = stageSize.height / 2 - garmentHeight / 2;
  const actualPrintArea = {
    x: garmentX + printArea.x,
    y: garmentY + printArea.y,
    width: printArea.width,
    height: printArea.height
  };

  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setZoom(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setPanOffset(newPos);
  }, [setZoom, setPanOffset]);

  const handleStageDoubleClick = useCallback((e: any) => {
    if (activeTool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      
      // Check if click is within print area
      if (
        pos.x >= actualPrintArea.x &&
        pos.x <= actualPrintArea.x + actualPrintArea.width &&
        pos.y >= actualPrintArea.y &&
        pos.y <= actualPrintArea.y + actualPrintArea.height
      ) {
        const designX = ((pos.x - actualPrintArea.x) / actualPrintArea.width) * doc.canvas.width;
        const designY = ((pos.y - actualPrintArea.y) / actualPrintArea.height) * doc.canvas.height;
        
        addNode({
          id: generateId(),
          type: 'text',
          name: 'Text',
          x: designX,
          y: designY,
          width: 100,
          height: 24,
          rotation: 0,
          opacity: 1,
          text: 'Double-click to edit',
          fontFamily: 'Arial',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 0,
          align: 'left',
          fill: { type: 'solid', color: '#000000' }
        });
      }
    }
  }, [activeTool, actualPrintArea, doc.canvas, addNode]);

  const renderDesignNode = useCallback((node: any) => {
    const isSelected = doc.selectedIds.includes(node.id);
    const printBaseX = actualPrintArea.x;
    const printBaseY = actualPrintArea.y;
    const scaleX = actualPrintArea.width / doc.canvas.width;
    const scaleY = actualPrintArea.height / doc.canvas.height;

    const commonProps = {
      key: node.id,
      x: printBaseX + node.x * scaleX,
      y: printBaseY + node.y * scaleY,
      rotation: node.rotation,
      opacity: node.opacity,
      draggable: activeTool === 'select' && !node.locked,
      onClick: () => selectNode(node.id),
      onDragEnd: (e: any) => {
        updateNode(node.id, {
          x: (e.target.x() - printBaseX) / scaleX,
          y: (e.target.y() - printBaseY) / scaleY
        });
      }
    };

    if (node.type === 'shape') {
      if (node.shape === 'rect') {
        return (
          <Rect
            {...commonProps}
            width={node.width * scaleX}
            height={node.height * scaleY}
            fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
            stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
            strokeWidth={(isSelected ? 3 : node.stroke?.width || 0) / zoom}
          />
        );
      } else if (node.shape === 'circle') {
        return (
          <Circle
            {...commonProps}
            x={printBaseX + (node.x + node.width / 2) * scaleX}
            y={printBaseY + (node.y + node.height / 2) * scaleY}
            radius={Math.min(node.width * scaleX, node.height * scaleY) / 2}
            fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
            stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
            strokeWidth={(isSelected ? 3 : node.stroke?.width || 0) / zoom}
          />
        );
      }
    } else if (node.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={node.text}
          fontSize={node.fontSize * Math.min(scaleX, scaleY)}
          fontFamily={node.fontFamily}
          fill={node.fill.type === 'solid' ? node.fill.color : 'black'}
          width={node.width * scaleX}
          height={node.height * scaleY}
          align={node.align}
          stroke={isSelected ? 'hsl(var(--primary))' : undefined}
          strokeWidth={isSelected ? 2 / zoom : 0}
        />
      );
    } else if (node.type === 'path') {
      return (
        <Line
          {...commonProps}
          points={node.points}
          stroke={node.stroke.color}
          strokeWidth={node.stroke.width / zoom}
          lineCap="round"
          lineJoin="round"
          closed={node.closed}
        />
      );
    }

    return null;
  }, [doc, actualPrintArea, zoom, activeTool, selectNode, updateNode]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Precise Canvas Detection */}
      <PreciseCanvasDetector 
        containerRef={containerRef}
        onPointerEnter={() => console.log('Entered canvas area')}
        onPointerLeave={() => console.log('Left canvas area')}
      />

      {/* Unified Cursor System */}
      <UnifiedCursorSystem
        containerRef={containerRef}
        canvasRef={stageRef}
        isActive={true}
      />

      {/* Floating Brush Panel */}
      <FloatingBrushPanel
        isVisible={showBrushPanel}
        brushSettings={brushSettings}
        onBrushSettingsChange={handleBrushSettingsChange}
        onClose={() => setShowBrushPanel(false)}
      />

      <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      scaleX={zoom}
      scaleY={zoom}
      x={panOffset.x}
      y={panOffset.y}
      onClick={handleStageClick}
      onDblClick={handleStageDoubleClick}
      onWheel={handleWheel}
      draggable={activeTool === 'hand'}
      onDragEnd={(e) => {
        setPanOffset({ x: e.target.x(), y: e.target.y() });
      }}
    >
      {/* Background Layer */}
      <Layer>
        {/* Garment Background */}
        {garmentImage && (
          <Image
            image={garmentImage}
            x={garmentX}
            y={garmentY}
            width={garmentWidth}
            height={garmentHeight}
            opacity={0.8}
          />
        )}

        {/* Print Area Outline */}
        <Rect
          x={actualPrintArea.x}
          y={actualPrintArea.y}
          width={actualPrintArea.width}
          height={actualPrintArea.height}
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth={2 / zoom}
          opacity={0.4}
          dash={[8 / zoom, 8 / zoom]}
        />

        {/* Print Area Label */}
        <Text
          x={actualPrintArea.x + 8}
          y={actualPrintArea.y + 8}
          text="Print Area"
          fontSize={12 / zoom}
          fill="hsl(var(--primary))"
          opacity={0.7}
        />
      </Layer>

      {/* Design Node Layer */}
      <Layer>
        {/* Render design nodes */}
        {doc.nodes.map(renderDesignNode)}
      </Layer>
      </Stage>

      {/* Persistent Brush Layer - positioned outside Konva */}
      <div className="absolute inset-0" style={{ 
        left: panOffset.x, 
        top: panOffset.y,
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
        pointerEvents: activeTool === 'brush' || activeTool === 'eraser' ? 'auto' : 'none'
      }}>
        <PersistentBrushLayer
          width={stageSize.width}
          height={stageSize.height}
          activeTool={activeTool}
          brushSettings={brushSettings}
        />
      </div>
    </div>
  );
};