import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushEngine, BrushStroke, BrushSettings, BRUSH_PRESETS } from '../../lib/studio/brushEngine';
import { CommandStack, AddStrokeCommand } from '../../lib/studio/commandStack';
import { useStudioStore } from '../../lib/studio/store';
import { Vec2, BrushStrokeNode } from '../../lib/studio/types';

interface AdvancedDrawingCanvasProps {
  width: number;
  height: number;
  brushSettings: BrushSettings;
  activeTool: 'brush' | 'eraser';
  onStrokeComplete?: (stroke: BrushStroke) => void;
  className?: string;
  designLayerCanvas?: HTMLCanvasElement | null;
}

export const AdvancedDrawingCanvas: React.FC<AdvancedDrawingCanvasProps> = ({
  width,
  height,
  brushSettings,
  activeTool,
  onStrokeComplete,
  className = "",
  designLayerCanvas
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const commandStackRef = useRef<CommandStack>(new CommandStack());
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);

  const { updateCanvas, addBrushStroke } = useStudioStore();

  // Initialize brush engine
  useEffect(() => {
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine(brushSettings);
    } else {
      brushEngineRef.current.updateSettings(brushSettings);
    }
  }, [brushSettings]);

  // Get the design layer canvas context for persistent drawing
  const getDesignLayerContext = useCallback(() => {
    return designLayerCanvas?.getContext('2d') || null;
  }, [designLayerCanvas]);

  // Set up preview canvas
  useEffect(() => {
    const previewCanvas = previewCanvasRef.current;
    
    if (previewCanvas) {
      previewCanvas.width = width;
      previewCanvas.height = height;
      
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
      }
    }
  }, [width, height]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((clientX: number, clientY: number): Vec2 => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return { x, y };
  }, []);

  // Get pressure from pointer event with better Apple Pencil detection
  const getPressure = useCallback((e: PointerEvent): number => {
    // Apple Pencil and stylus detection
    if (e.pointerType === 'pen') {
      return e.pressure > 0 ? e.pressure : 0.5;
    }
    // Touch detection - differentiate finger vs palm
    if (e.pointerType === 'touch') {
      return e.pressure || 0.7;
    }
    // Mouse fallback
    return 1.0;
  }, []);

  // Handle drawing start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!brushEngineRef.current || !previewCanvasRef.current) return;
    
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
    
    if (completedStroke) {
      // Render final stroke to persistent design layer
      const designCtx = getDesignLayerContext();
      if (designCtx) {
        brushEngineRef.current.renderStroke(completedStroke, designCtx);
        
        // Save the design layer data to store for persistence
        if (designLayerCanvas) {
          const dataURL = designLayerCanvas.toDataURL('image/png');
          updateCanvas({ designLayerData: dataURL });
        }
      }
      
      // Clear preview canvas
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext('2d');
        if (previewCtx) {
          previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        }
      }
      
      // Save stroke to store for undo/redo purposes
      addBrushStroke({
        color: completedStroke.brush.color,
        size: completedStroke.brush.size,
        opacity: completedStroke.brush.opacity,
        hardness: completedStroke.brush.hardness || 1,
        points: completedStroke.points.map(p => ({ x: p.x, y: p.y, pressure: p.pressure }))
      });
      
      onStrokeComplete?.(completedStroke);
    }
    
    setCurrentStroke(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, [isDrawing, currentStroke, onStrokeComplete, getDesignLayerContext, designLayerCanvas, updateCanvas, addBrushStroke]);

  // Undo function
  const undo = useCallback(() => {
    commandStackRef.current.undo();
  }, []);

  // Redo function
  const redo = useCallback(() => {
    commandStackRef.current.redo();
  }, []);

  // Clear design layer
  const clear = useCallback(() => {
    const designCtx = getDesignLayerContext();
    if (designCtx && designLayerCanvas) {
      designCtx.clearRect(0, 0, designLayerCanvas.width, designLayerCanvas.height);
      const dataURL = designLayerCanvas.toDataURL('image/png');
      updateCanvas({ designLayerData: dataURL });
    }
    
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }
    }
    
    commandStackRef.current.clear();
  }, [getDesignLayerContext, designLayerCanvas, updateCanvas]);

  // Expose functions via ref (if needed)
  React.useEffect(() => {
    // Functions available for external access if needed
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>      
      {/* Preview canvas for live stroke preview */}
      <canvas
        ref={previewCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
      
      {/* Invisible interaction canvas */}
      <canvas
        className="absolute inset-0 cursor-crosshair"
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ 
          touchAction: 'none',
          cursor: activeTool === 'eraser' ? 'crosshair' : 'crosshair',
          position: 'absolute',
          left: 0,
          top: 0
        }}
      />
    </div>
  );
};