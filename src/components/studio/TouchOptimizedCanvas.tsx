import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { EnhancedBrushTool } from './EnhancedBrushTool';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface TouchOptimizedCanvasProps {
  width: number;
  height: number;
  garmentImage?: string;
  onStrokeComplete?: (stroke: any) => void;
}

export const TouchOptimizedCanvas: React.FC<TouchOptimizedCanvasProps> = ({
  width,
  height,
  garmentImage,
  onStrokeComplete
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    activeTool, 
    zoom, 
    panOffset, 
    setZoom, 
    setPanOffset, 
    undo, 
    redo,
    canUndo,
    canRedo 
  } = useStudioStore();
  
  const [brushSettings, setBrushSettings] = useState({
    size: 8,
    opacity: 1,
    color: '#000000',
    hardness: 0.8,
    type: 'pencil' as const
  });

  // Enhanced touch gesture handling
  const { isDrawing, touchCount } = useTouchGestures(containerRef, {
    onTwoFingerTap: undo,
    onThreeFingerTap: redo,
    onPinch: (scale, center) => {
      if (touchCount === 2 && !isDrawing) {
        const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
        setZoom(newZoom);
        
        // Adjust pan to zoom around gesture center
        const stage = stageRef.current;
        if (stage) {
          const pointer = stage.getPointerPosition();
          const zoomPoint = {
            x: (pointer.x - panOffset.x) / zoom,
            y: (pointer.y - panOffset.y) / zoom
          };
          const newPos = {
            x: pointer.x - zoomPoint.x * newZoom,
            y: pointer.y - zoomPoint.y * newZoom
          };
          setPanOffset(newPos);
        }
      }
    },
    onPan: (delta) => {
      if (touchCount === 2 && !isDrawing) {
        setPanOffset({
          x: panOffset.x + delta.x,
          y: panOffset.y + delta.y
        });
      }
    }
  });

  // Prevent default touch behaviors that interfere with drawing
  // Smart Touch Event Management - context-aware touch handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouch = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Check if touch is within canvas drawing area (not on UI elements)
      const isInDrawingArea = x > 60 && y > 60 && x < rect.width - 60 && y < rect.height - 60;
      
      // Only prevent default for drawing interactions in the canvas area
      if (activeTool === 'brush' && isInDrawingArea && e.touches.length === 1) {
        e.preventDefault();
        container.classList.add('touch-context-draw');
      } else {
        container.classList.remove('touch-context-draw');
        container.classList.add('touch-context-scroll');
      }
    };

    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });
    container.addEventListener('touchend', () => {
      container.classList.remove('touch-context-draw');
      container.classList.add('touch-context-scroll');
    });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
      container.removeEventListener('touchend', handleTouch);
    };
  }, [activeTool]);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(5, zoom * 1.2));
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(0.1, zoom / 1.2));
  }, [zoom, setZoom]);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [setZoom, setPanOffset]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-surface rounded-lg touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Touch Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="w-12 h-12 touch-manipulation shadow-lg"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="w-12 h-12 touch-manipulation shadow-lg"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="w-12 h-12 touch-manipulation shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Undo/Redo Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          className="w-12 h-12 touch-manipulation shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          className="w-12 h-12 touch-manipulation shadow-lg"
        >
          <RotateCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-surface-elevated px-3 py-1 rounded-full text-sm text-foreground border border-glass-border">
        {Math.round(zoom * 100)}%
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        draggable={activeTool === 'hand'}
        onDragEnd={(e) => {
          setPanOffset({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {/* Background/Garment Layer */}
          {garmentImage && (
            <Group>
              {/* Garment image would be rendered here */}
            </Group>
          )}
          
          {/* Design Layer */}
          <Group>
            {/* Enhanced Brush Tool with touch support */}
            <EnhancedBrushTool
              isActive={activeTool === 'brush'}
              brushSettings={brushSettings}
              onStrokeComplete={onStrokeComplete}
            />
          </Group>
        </Layer>
      </Stage>

      {/* Touch Instructions Overlay */}
      {touchCount === 0 && activeTool === 'brush' && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-surface-elevated px-4 py-2 rounded-lg text-sm text-foreground border border-glass-border shadow-lg animate-fade-in">
          Draw with your finger or Apple Pencil
        </div>
      )}
    </div>
  );
};