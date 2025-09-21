import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useCanvasFocus } from '@/hooks/useCanvasFocus';
import { usePointerRouting } from '@/hooks/usePointerRouting';
import { TapToDrawPrompt } from './TapToDrawPrompt';
import { StrokePipeline, LiveStroke } from '@/lib/studio/strokePipeline';
import { PrintAreaMaskManager } from '@/lib/studio/printAreaMask';
import { useStudioStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';
import useImage from 'use-image';

interface FocusedDrawingCanvasProps {
  width: number;
  height: number;
  garmentImageUrl?: string;
  className?: string;
}

export const FocusedDrawingCanvas: React.FC<FocusedDrawingCanvasProps> = ({
  width,
  height,
  garmentImageUrl,
  className
}) => {
  const { focusState, canvasRef, focusCanvas, blurCanvas, shouldCapture, showDrawPrompt } = useCanvasFocus();
  const stageRef = useRef<any>(null);
  const [strokePipeline, setStrokePipeline] = useState<StrokePipeline | null>(null);
  const [maskManager] = useState(() => new PrintAreaMaskManager());
  const [garmentImage] = useImage(garmentImageUrl || '');
  const [artworkCanvas, setArtworkCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const { activeTool, addNode } = useStudioStore();

  // Initialize stroke pipeline
  useEffect(() => {
    const pipeline = new StrokePipeline(document.createElement('canvas'));
    pipeline.getPreviewCanvas().width = width;
    pipeline.getPreviewCanvas().height = height;
    setStrokePipeline(pipeline);

    // Initialize artwork canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    setArtworkCanvas(canvas);

    // Load garment mask
    maskManager.loadGarmentMask('t-shirt');
  }, [width, height, maskManager]);

  // Handle drawing events
  const handlePointerDown = (e: PointerEvent) => {
    if (!strokePipeline || focusState.mode !== 'draw') return;

    const rect = (e.target as Element).getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Check if point is in print area
    if (!maskManager.isPointInPrintArea(point)) return;

    strokePipeline.startStroke(point, e.pressure, {
      size: 5,
      color: '#000000',
      opacity: 1,
      hardness: 0.8,
      type: 'brush'
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!strokePipeline) return;

    const rect = (e.target as Element).getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    strokePipeline.addPoint(point, e.pressure);
  };

  const handlePointerUp = () => {
    if (!strokePipeline || !artworkCanvas) return;

    const completedStroke = strokePipeline.endStroke();
    if (completedStroke) {
      // Rasterize stroke to artwork canvas
      strokePipeline.rasterizeStroke(completedStroke, artworkCanvas);
      
      // Add to studio store as image node
      const dataUrl = artworkCanvas.toDataURL();
      addNode({
        id: `stroke_${Date.now()}`,
        type: 'image',
        name: 'Drawing Layer',
        x: 0,
        y: 0,
        width: width,
        height: height,
        rotation: 0,
        opacity: 1,
        src: dataUrl
      });
    }
  };

  const { elementRef } = usePointerRouting({
    shouldCapture,
    mode: focusState.mode,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp
  });

  // Handle canvas click for focus
  const handleCanvasClick = () => {
    if (activeTool === 'brush' && !focusState.isFocused) {
      focusCanvas();
    }
  };

  // Render print area outlines
  const renderPrintAreas = () => {
    if (!stageRef.current) return null;
    
    const stage = stageRef.current;
    const layer = stage.getLayers()[0];
    
    // This would be implemented as a custom Konva shape
    // For now, we'll use CSS overlay
    return null;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Canvas Container */}
      <div
        ref={(el) => {
          if (el) {
            canvasRef.current = el;
            elementRef.current = el;
          }
        }}
        className={cn(
          "relative cursor-crosshair select-none",
          focusState.isFocused && "ring-2 ring-primary ring-offset-2",
          !shouldCapture && "cursor-default"
        )}
        tabIndex={0}
        onClick={handleCanvasClick}
        onBlur={blurCanvas}
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          className="bg-background"
        >
          <Layer>
            {/* Garment mockup */}
            {garmentImage && (
              <KonvaImage
                image={garmentImage}
                width={width}
                height={height}
                listening={false}
              />
            )}
            
            {/* Artwork layer would be rendered here */}
            {artworkCanvas && (
              <KonvaImage
                image={artworkCanvas}
                width={width}
                height={height}
                listening={false}
              />
            )}
          </Layer>
        </Stage>

        {/* Print area overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            {maskManager.getPrintAreaBounds().map((area, index) => (
              <rect
                key={index}
                x={area.bounds.x}
                y={area.bounds.y}
                width={area.bounds.width}
                height={area.bounds.height}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity={focusState.isFocused ? 0.8 : 0.3}
              />
            ))}
          </svg>
        </div>

        {/* Focus indicator */}
        {focusState.isFocused && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
            Drawing Mode
          </div>
        )}
      </div>

      {/* Mobile draw prompt */}
      {showDrawPrompt && (
        <TapToDrawPrompt onTap={focusCanvas} />
      )}

      {/* Canvas info */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        {focusState.mode} • {focusState.isFocused ? 'Focused' : 'Navigate'}
      </div>
    </div>
  );
};