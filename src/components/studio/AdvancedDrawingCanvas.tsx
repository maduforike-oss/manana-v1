import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushEngine, BrushStroke, BrushSettings, BRUSH_PRESETS } from '../../lib/studio/brushEngine';
import { CommandStack, AddStrokeCommand } from '../../lib/studio/commandStack';
import { useStudioStore } from '../../lib/studio/store';
import { Vec2 } from '../../lib/studio/types';

interface AdvancedDrawingCanvasProps {
  width: number;
  height: number;
  brushSettings: BrushSettings;
  activeTool: 'brush' | 'eraser';
  onStrokeComplete?: (stroke: BrushStroke) => void;
  className?: string;
}

export const AdvancedDrawingCanvas: React.FC<AdvancedDrawingCanvasProps> = ({
  width,
  height,
  brushSettings,
  activeTool,
  onStrokeComplete,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const commandStackRef = useRef<CommandStack>(new CommandStack());
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);

  const { zoom, panOffset } = useStudioStore();

  // Initialize brush engine
  useEffect(() => {
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine(brushSettings);
    } else {
      brushEngineRef.current.updateSettings(brushSettings);
    }
  }, [brushSettings]);

  // Set up canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (canvas && previewCanvas) {
      canvas.width = width;
      canvas.height = height;
      previewCanvas.width = width;
      previewCanvas.height = height;
      
      // Set canvas context properties
      const ctx = canvas.getContext('2d');
      const previewCtx = previewCanvas.getContext('2d');
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      
      if (previewCtx) {
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
      }
    }
  }, [width, height]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((clientX: number, clientY: number): Vec2 => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;
    
    return { x, y };
  }, [zoom, panOffset]);

  // Get pressure from pointer event
  const getPressure = useCallback((e: PointerEvent): number => {
    return e.pressure || (e.pointerType === 'pen' ? 0.5 : 1.0);
  }, []);

  // Handle drawing start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!brushEngineRef.current || !canvasRef.current) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const point = screenToCanvas(e.clientX, e.clientY);
    const pressure = getPressure(e.nativeEvent);
    
    // Update brush settings for eraser
    const currentSettings = activeTool === 'eraser' 
      ? { ...brushSettings, type: 'eraser' as const, color: 'transparent' }
      : brushSettings;
    
    brushEngineRef.current.updateSettings(currentSettings);
    
    const stroke = brushEngineRef.current.startStroke(point, pressure);
    setCurrentStroke(stroke);
    
    // Capture pointer for smooth drawing
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [brushSettings, activeTool, screenToCanvas, getPressure]);

  // Handle drawing movement
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    e.preventDefault();
    const point = screenToCanvas(e.clientX, e.clientY);
    const pressure = getPressure(e.nativeEvent);
    
    const updatedStroke = brushEngineRef.current.addPoint(point, pressure);
    
    if (updatedStroke) {
      setCurrentStroke(updatedStroke);
      
      // Update preview canvas
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const ctx = previewCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          brushEngineRef.current.renderStroke(updatedStroke, ctx);
        }
      }
    }
  }, [isDrawing, currentStroke, screenToCanvas, getPressure]);

  // Handle drawing end
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !brushEngineRef.current || !currentStroke) return;
    
    e.preventDefault();
    setIsDrawing(false);
    
    const completedStroke = brushEngineRef.current.endStroke();
    
    if (completedStroke && canvasRef.current) {
      // Render final stroke to main canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        brushEngineRef.current.renderStroke(completedStroke, ctx);
      }
      
      // Clear preview canvas
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext('2d');
        if (previewCtx) {
          previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        }
      }
      
      // Add to command stack for undo/redo
      const command = new AddStrokeCommand(
        {
          id: completedStroke.id,
          color: completedStroke.brush.color,
          size: completedStroke.brush.size,
          opacity: completedStroke.brush.opacity,
          points: completedStroke.points.map(p => ({ x: p.x, y: p.y, p: p.pressure, t: p.timestamp }))
        },
        canvasRef.current,
        () => onStrokeComplete?.(completedStroke)
      );
      
      commandStackRef.current.executeCommand(command);
      onStrokeComplete?.(completedStroke);
    }
    
    setCurrentStroke(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, [isDrawing, currentStroke, onStrokeComplete]);

  // Undo function
  const undo = useCallback(() => {
    commandStackRef.current.undo();
  }, []);

  // Redo function
  const redo = useCallback(() => {
    commandStackRef.current.redo();
  }, []);

  // Clear canvas
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }
    }
    
    commandStackRef.current.clear();
  }, []);

  // Expose functions via ref (if needed)
  React.useEffect(() => {
    // Functions available for external access if needed
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Main drawing canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
      
      {/* Preview canvas for live stroke preview */}
      <canvas
        ref={previewCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
      
      {/* Invisible interaction canvas */}
      <canvas
        className="absolute inset-0 cursor-crosshair touch-none"
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ 
          touchAction: 'none',
          cursor: activeTool === 'eraser' ? 'crosshair' : 'crosshair'
        }}
      />
    </div>
  );
};