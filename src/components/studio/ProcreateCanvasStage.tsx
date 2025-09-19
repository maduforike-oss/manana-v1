import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { GestureHandler, GestureHandlerOptions } from '@/lib/studio/gestureHandler';
import { BrushEngine, BrushStroke, BrushSettings, BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { LayerSystem, Layer } from '@/lib/studio/layerSystem';
import { useStudioStore } from '@/lib/studio/store';
import { Vec2 } from '@/lib/studio/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcreateCanvasStageProps {
  brushSettings: BrushSettings;
  onBrushStroke?: (stroke: BrushStroke) => void;
  onLayerChange?: (layers: Layer[]) => void;
  className?: string;
}

export const ProcreateCanvasStage = ({ 
  brushSettings = BRUSH_PRESETS.pencil,
  onBrushStroke,
  onLayerChange,
  className 
}: ProcreateCanvasStageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Studio store
  const { activeTool, doc, zoom, panOffset, setZoom, setPanOffset } = useStudioStore();
  
  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [canvasRotation, setCanvasRotation] = useState(0);
  
  // Systems
  const [brushEngine] = useState(() => new BrushEngine(brushSettings));
  const [layerSystem] = useState(() => new LayerSystem(800, 600));
  const [gestureHandler, setGestureHandler] = useState<GestureHandler | null>(null);
  
  // Current stroke state
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [lastPointerPos, setLastPointerPos] = useState<Vec2>({ x: 0, y: 0 });

  // Update brush settings when props change
  useEffect(() => {
    brushEngine.updateSettings(brushSettings);
  }, [brushSettings, brushEngine]);

  // Setup canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setCanvasSize({ width: clientWidth, height: clientHeight });
        }
      }
    };

    const observer = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Setup gesture handling
  useEffect(() => {
    if (!containerRef.current) return;

    const gestureOptions: GestureHandlerOptions = {
      onUndo: () => {
        // Implement undo
        console.log('Undo gesture detected');
      },
      onRedo: () => {
        // Implement redo
        console.log('Redo gesture detected');
      },
      onClearLayer: () => {
        // Clear current layer
        const activeLayer = layerSystem.getActiveLayer();
        if (activeLayer) {
          const ctx = activeLayer.canvas.getContext('2d')!;
          ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
          redrawCanvas();
        }
      },
      onToggleUI: () => {
        // Toggle UI visibility
        console.log('Toggle UI gesture detected');
      },
      onZoom: (scale: number, center: Vec2) => {
        handleZoom(scale, center);
      },
      onPan: (offset: Vec2) => {
        setPanOffset(offset);
      },
      onRotate: (angle: number, center: Vec2) => {
        setCanvasRotation(prev => prev + angle);
      },
      enableHaptics: true
    };

    const handler = new GestureHandler(containerRef.current, gestureOptions);
    setGestureHandler(handler);

    return () => handler.dispose();
  }, [layerSystem, setPanOffset]);

  // Canvas drawing functions
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Vec2 => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;
    
    return { x, y };
  }, [zoom, panOffset]);

  const startDrawing = useCallback((event: React.PointerEvent) => {
    if (activeTool !== 'brush') return;
    
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    canvas.setPointerCapture(event.pointerId);

    const pos = getCanvasCoordinates(event.clientX, event.clientY);
    const pressure = event.pressure || 1;
    
    setLastPointerPos(pos);
    const stroke = brushEngine.startStroke(pos, pressure);
    setCurrentStroke(stroke);

    // Start drawing on active layer
    const activeLayer = layerSystem.getActiveLayer();
    if (activeLayer) {
      const ctx = activeLayer.canvas.getContext('2d')!;
      brushEngine.renderStroke(stroke, ctx);
    }
  }, [activeTool, getCanvasCoordinates, brushEngine, layerSystem]);

  const continueDrawing = useCallback((event: React.PointerEvent) => {
    if (!isDrawing || activeTool !== 'brush') return;
    
    event.preventDefault();
    const pos = getCanvasCoordinates(event.clientX, event.clientY);
    const pressure = event.pressure || 1;

    // Add point to current stroke
    const updatedStroke = brushEngine.addPoint(pos, pressure);
    if (updatedStroke) {
      setCurrentStroke(updatedStroke);
      
      // Update active layer
      const activeLayer = layerSystem.getActiveLayer();
      if (activeLayer) {
        const ctx = activeLayer.canvas.getContext('2d')!;
        brushEngine.renderStroke(updatedStroke, ctx);
      }
    }

    setLastPointerPos(pos);
  }, [isDrawing, activeTool, getCanvasCoordinates, brushEngine, layerSystem]);

  const endDrawing = useCallback((event: React.PointerEvent) => {
    if (!isDrawing) return;
    
    event.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(event.pointerId);
    }

    setIsDrawing(false);
    
    const finalStroke = brushEngine.endStroke();
    if (finalStroke) {
      onBrushStroke?.(finalStroke);
      // Save to undo history
      useStudioStore.getState().saveSnapshot();
    }
    
    setCurrentStroke(null);
    redrawCanvas();
  }, [isDrawing, brushEngine, onBrushStroke]);

  // Redraw entire canvas
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Render composite of all layers
    const composite = layerSystem.renderComposite();
    ctx.drawImage(composite, 0, 0);
  }, [canvasSize, layerSystem]);

  // Handle zoom
  const handleZoom = useCallback((scale: number, center?: Vec2) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
    setZoom(newZoom);
    
    if (center) {
      // Zoom towards center point
      const zoomDelta = newZoom / zoom;
      const newPanX = center.x - (center.x - panOffset.x) * zoomDelta;
      const newPanY = center.y - (center.y - panOffset.y) * zoomDelta;
      setPanOffset({ x: newPanX, y: newPanY });
    }
  }, [zoom, panOffset, setZoom, setPanOffset]);

  // Render grid
  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 20 * zoom;
    const offsetX = panOffset.x % gridSize;
    const offsetY = panOffset.y % gridSize;
    
    // Vertical lines
    for (let x = offsetX; x < canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [showGrid, zoom, panOffset, canvasSize]);

  // Canvas transform style
  const canvasTransform = useMemo(() => {
    return {
      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${canvasRotation}deg)`,
      transformOrigin: 'center center'
    };
  }, [panOffset, zoom, canvasRotation]);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full bg-workspace overflow-hidden", className)}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={canvasTransform}
        className="absolute inset-0 cursor-crosshair touch-none"
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={endDrawing}
        onPointerLeave={endDrawing}
      />

      {/* Overlay canvas for UI elements */}
      <canvas
        ref={overlayCanvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Grid */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
          }}
        />
      )}

      {/* Rulers */}
      {showRulers && (
        <>
          {/* Horizontal ruler */}
          <div className="absolute top-0 left-8 right-0 h-8 bg-card border-b border-border">
            {/* Ruler marks */}
          </div>
          
          {/* Vertical ruler */}
          <div className="absolute left-0 top-8 bottom-0 w-8 bg-card border-r border-border">
            {/* Ruler marks */}
          </div>
        </>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => handleZoom(0.8)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Badge variant="secondary" className="text-xs min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => handleZoom(1.2)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* View controls */}
        <div className="flex gap-1">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="icon"
            className="w-8 h-8"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={showRulers ? "default" : "outline"}
            size="icon"
            className="w-8 h-8"
            onClick={() => setShowRulers(!showRulers)}
          >
            <Ruler className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => {
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
              setCanvasRotation(0);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Touch gesture hints */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg p-2 text-xs text-muted-foreground">
        <div>✌️ Two fingers: Undo</div>
        <div>✋ Three fingers: Redo</div>
        <div>🤏 Pinch: Zoom & Rotate</div>
      </div>
    </div>
  );
};