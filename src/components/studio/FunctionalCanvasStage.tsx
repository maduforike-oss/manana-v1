import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, RegularPolygon, Transformer } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';
import { Node, TextNode, ShapeNode, ImageNode } from '../../lib/studio/types';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Download, Move, Hand } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const FunctionalCanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  
  const { 
    doc, 
    activeTool, 
    zoom, 
    panOffset, 
    addNode, 
    updateNode, 
    removeNode,
    selectNode,
    clearSelection,
    setZoom,
    setPanOffset,
    undo,
    redo,
    canUndo,
    canRedo,
    saveSnapshot
  } = useStudioStore();

  // Handle window resize
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({ width: clientWidth, height: clientHeight });
      }
    };

    const observer = new ResizeObserver(updateStageSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (doc.nodes.length > 0) {
        try {
          localStorage.setItem('studio-autosave', JSON.stringify(doc));
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [doc]);

  // Grid rendering
  const renderGrid = () => {
    if (!doc.canvas.showGrid) return null;
    
    const gridSize = doc.canvas.gridSize || 20;
    const lines = [];
    
    // Vertical lines
    for (let i = 0; i < stageSize.width / zoom + panOffset.x; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height / zoom]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i < stageSize.height / zoom + panOffset.y; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width / zoom, i]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    return lines;
  };

  // Render design nodes
  const renderNode = (node: Node) => {
    const isSelected = doc.selectedIds.includes(node.id);
    
    const commonProps = {
      id: node.id,
      x: node.x,
      y: node.y,
      rotation: node.rotation || 0,
      opacity: node.opacity || 1,
      draggable: !node.locked,
      onClick: () => selectNode(node.id),
      onDragEnd: (e: any) => {
        updateNode(node.id, {
          x: e.target.x(),
          y: e.target.y()
        });
        saveSnapshot();
      },
      onTransformEnd: (e: any) => {
        const scaleX = e.target.scaleX();
        const scaleY = e.target.scaleY();
        
        updateNode(node.id, {
          x: e.target.x(),
          y: e.target.y(),
          width: node.width * scaleX,
          height: node.height * scaleY,
          rotation: e.target.rotation()
        });
        
        // Reset scale after applying to dimensions
        e.target.scaleX(1);
        e.target.scaleY(1);
        saveSnapshot();
      }
    };

    switch (node.type) {
      case 'text': {
        const textNode = node as TextNode;
        return (
          <Text
            key={node.id}
            {...commonProps}
            text={textNode.text}
            fontSize={textNode.fontSize}
            fontFamily={textNode.fontFamily}
            fill={textNode.fill.type === 'solid' ? textNode.fill.color : '#000000'}
            align={textNode.align}
            width={textNode.width}
            height={textNode.height}
            stroke={isSelected ? '#0066FF' : undefined}
            strokeWidth={isSelected ? 2 : 0}
          />
        );
      }
      
      case 'shape': {
        const shapeNode = node as ShapeNode;
        const fill = shapeNode.fill.type === 'solid' ? shapeNode.fill.color : '#3B82F6';
        const stroke = shapeNode.stroke?.color || '#1E40AF';
        
        switch (shapeNode.shape) {
          case 'rect':
            return (
              <Rect
                key={node.id}
                {...commonProps}
                width={shapeNode.width}
                height={shapeNode.height}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
                cornerRadius={shapeNode.radius || 0}
              />
            );
            
          case 'circle':
            return (
              <Circle
                key={node.id}
                {...commonProps}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'triangle':
          case 'star':
            return (
              <RegularPolygon
                key={node.id}
                {...commonProps}
                sides={shapeNode.shape === 'triangle' ? 3 : (shapeNode.points || 5)}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'line':
            return (
              <Line
                key={node.id}
                {...commonProps}
                points={[0, 0, shapeNode.width, 0]}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
        }
        break;
      }
    }
    
    return null;
  };

  // Handle stage click for tool interactions
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
      
      const pos = e.target.getStage().getPointerPosition();
      const localPos = {
        x: (pos.x - panOffset.x) / zoom,
        y: (pos.y - panOffset.y) / zoom
      };

      if (activeTool === 'text') {
        const textNode: TextNode = {
          id: `text-${Date.now()}`,
          type: 'text',
          name: 'Text Layer',
          x: localPos.x,
          y: localPos.y,
          width: 200,
          height: 50,
          rotation: 0,
          opacity: 1,
          text: 'Double click to edit',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 0,
          align: 'left',
          fill: { type: 'solid', color: '#000000' }
        };
        addNode(textNode);
        saveSnapshot();
        toast('Text added! Click to select and edit.');
      }
      
      else if (activeTool === 'rect' || activeTool === 'circle') {
        const shapeNode: ShapeNode = {
          id: `${activeTool}-${Date.now()}`,
          type: 'shape',
          name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Shape`,
          x: localPos.x,
          y: localPos.y,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          shape: activeTool as any,
          fill: { type: 'solid', color: '#3B82F6' },
          stroke: { color: '#1E40AF', width: 2 }
        };
        addNode(shapeNode);
        saveSnapshot();
        toast(`${activeTool} shape added!`);
      }
    }
  }, [activeTool, panOffset, zoom, addNode, clearSelection, saveSnapshot]);

  // Handle brush drawing
  const handleBrushStart = useCallback((e: any) => {
    if (activeTool === 'brush') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const localPos = {
        x: (pos.x - panOffset.x) / zoom,
        y: (pos.y - panOffset.y) / zoom
      };
      setCurrentPath([localPos.x, localPos.y]);
    }
  }, [activeTool, panOffset, zoom]);

  const handleBrushMove = useCallback((e: any) => {
    if (!isDrawing || activeTool !== 'brush') return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const localPos = {
      x: (point.x - panOffset.x) / zoom,
      y: (point.y - panOffset.y) / zoom
    };
    
    setCurrentPath(prev => [...prev, localPos.x, localPos.y]);
  }, [isDrawing, activeTool, panOffset, zoom]);

  const handleBrushEnd = useCallback(() => {
    if (isDrawing && currentPath.length > 4) {
      // Create a path node from the drawing
      const pathNode: any = {
        id: `path-${Date.now()}`,
        type: 'path',
        name: 'Brush Stroke',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        points: currentPath,
        stroke: { color: '#000000', width: 3 },
        closed: false
      };
      addNode(pathNode);
      saveSnapshot();
      toast('Brush stroke added!');
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, addNode, saveSnapshot]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    setZoom(clampedScale);
    
    // Adjust pan to zoom towards cursor
    const mousePointTo = {
      x: (pointer.x - panOffset.x) / oldScale,
      y: (pointer.y - panOffset.y) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setPanOffset(newPos);
  }, [panOffset, setZoom, setPanOffset]);

  // Handle pan
  const handleDragEnd = useCallback((e: any) => {
    if (activeTool === 'hand') {
      setPanOffset({
        x: e.target.x(),
        y: e.target.y()
      });
    }
  }, [activeTool, setPanOffset]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && doc.selectedIds.length > 0) {
      const nodes = doc.selectedIds.map(id => 
        stageRef.current?.findOne(`#${id}`)
      ).filter(Boolean);
      
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [doc.selectedIds]);

  // Export functionality
  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    
    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2 // 2x for higher quality
      });
      
      const link = document.createElement('a');
      link.download = `${doc.title || 'design'}.png`;
      link.href = dataURL;
      link.click();
      
      toast('Design exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast('Export failed. Please try again.');
    }
  }, [doc.title]);

  // Zoom controls
  const zoomIn = () => setZoom(Math.min(zoom * 1.2, 5));
  const zoomOut = () => setZoom(Math.max(zoom / 1.2, 0.1));
  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-muted/20">
      {/* Zoom and Export Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <div className="flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg border border-border/50 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={zoom <= 0.1}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="h-8 px-3 text-xs font-mono"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={zoom >= 5}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="bg-card/95 backdrop-blur-sm border-border/50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </Button>
      </div>

      {/* Undo/Redo Controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg border border-border/50 p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="w-4 h-4 scale-x-[-1]" />
        </Button>
      </div>

      {/* Tool indicator */}
      <div className="absolute bottom-4 left-4 z-50 bg-card/95 backdrop-blur-sm rounded-lg border border-border/50 px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          {activeTool === 'hand' && <Hand className="w-4 h-4" />}
          {activeTool === 'select' && <Move className="w-4 h-4" />}
          <span className="font-medium capitalize">{activeTool} Tool</span>
        </div>
      </div>

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseDown={handleBrushStart}
        onMouseMove={handleBrushMove}
        onMouseUp={handleBrushEnd}
        onDragEnd={handleDragEnd}
        draggable={activeTool === 'hand'}
        className={cn(
          "outline-none",
          activeTool === 'select' && "cursor-default",
          activeTool === 'hand' && "cursor-grab",
          activeTool === 'text' && "cursor-text",
          activeTool === 'brush' && "cursor-crosshair",
          (activeTool === 'rect' || activeTool === 'circle') && "cursor-crosshair"
        )}
      >
        <Layer>
          {/* Grid */}
          {renderGrid()}
          
          {/* Current brush stroke */}
          {isDrawing && currentPath.length > 2 && (
            <Line
              points={currentPath}
              stroke="#000000"
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          )}
          
          {/* Design nodes */}
          {doc.nodes.map(renderNode)}
          
          {/* Transformer for selected nodes */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
            anchorStroke="#0066FF"
            anchorFill="#FFFFFF"
            anchorSize={8}
            borderStroke="#0066FF"
            borderDash={[3, 3]}
          />
        </Layer>
      </Stage>
    </div>
  );
};