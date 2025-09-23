import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';
import { optimizeCursorUpdates, useCursorPerformanceMonitor } from './CursorPerformanceMonitor';

interface CanvasCoordinates {
  screen: { x: number; y: number };
  canvas: { x: number; y: number };
  world: { x: number; y: number };
}

interface CursorConfig {
  size: number;
  color: string;
  opacity: number;
  shape: 'circle' | 'crosshair' | 'square';
  showCenter: boolean;
  showCrosshair: boolean;
  minSize: number;
  maxSize: number;
}

class CanvasCoordinateTransform {
  constructor(
    private zoom: number,
    private panOffset: { x: number; y: number },
    private containerRect: DOMRect
  ) {}

  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX - this.containerRect.left,
      y: screenY - this.containerRect.top
    };
  }

  canvasToWorld(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: (canvasX - this.panOffset.x) / this.zoom,
      y: (canvasY - this.panOffset.y) / this.zoom
    };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const canvas = this.screenToCanvas(screenX, screenY);
    return this.canvasToWorld(canvas.x, canvas.y);
  }

  worldToCanvas(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.zoom + this.panOffset.x,
      y: worldY * this.zoom + this.panOffset.y
    };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const canvas = this.worldToCanvas(worldX, worldY);
    return {
      x: canvas.x + this.containerRect.left,
      y: canvas.y + this.containerRect.top
    };
  }
}

export interface PrecisionCursorManagerProps {
  children: React.ReactNode;
  stageRef: React.RefObject<any>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const PrecisionCursorManager: React.FC<PrecisionCursorManagerProps> = ({ 
  children, 
  stageRef, 
  containerRef 
}) => {
  const { zoom, panOffset } = useStudioStore();
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const coordinateTransformRef = useRef<CanvasCoordinateTransform | null>(null);
  
  // Performance monitoring (only in development)
  useCursorPerformanceMonitor(process.env.NODE_ENV === 'development');

  // Get tool-specific cursor configuration
  const getCursorConfig = useCallback((): CursorConfig => {
    const currentToolId = toolManager.getCurrentToolId();
    const currentTool = toolManager.getCurrentTool();
    const settings = currentTool.getSettings();

    const baseConfig: CursorConfig = {
      size: 20,
      color: 'hsl(var(--primary))',
      opacity: 1,
      shape: 'circle',
      showCenter: true,
      showCrosshair: false,
      minSize: 8,
      maxSize: 200
    };

    switch (currentToolId) {
      case 'brush':
        return {
          ...baseConfig,
          size: Math.max(baseConfig.minSize, Math.min(baseConfig.maxSize, settings.size || 10)),
          color: settings.color || baseConfig.color,
          opacity: settings.opacity || 0.8,
          shape: 'circle',
          showCenter: true,
          showCrosshair: false
        };

      case 'eraser':
        return {
          ...baseConfig,
          size: Math.max(baseConfig.minSize, Math.min(baseConfig.maxSize, settings.size || 10)),
          color: 'hsl(var(--destructive))',
          opacity: 0.6,
          shape: 'circle',
          showCenter: true,
          showCrosshair: false
        };

      case 'rect':
      case 'circle':
      case 'line':
      case 'triangle':
      case 'star':
        return {
          ...baseConfig,
          size: 16,
          shape: 'crosshair',
          showCenter: true,
          showCrosshair: true
        };

      case 'text':
        return {
          ...baseConfig,
          size: 12,
          shape: 'crosshair',
          showCenter: true,
          showCrosshair: false
        };

      default:
        return baseConfig;
    }
  }, []);

  // Update coordinate transform when dependencies change
  useEffect(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    coordinateTransformRef.current = new CanvasCoordinateTransform(zoom, panOffset, rect);
  }, [zoom, panOffset, containerRef]);

  // Handle mouse movement with accurate coordinate calculation and performance optimization
  const handleMouseMove = useCallback((e: MouseEvent) => {
    optimizeCursorUpdates.throttleUpdate(() => {
      if (!coordinateTransformRef.current || !containerRef.current) return;

      // Check if mouse is over canvas container
      const rect = containerRef.current.getBoundingClientRect();
      const isOver = e.clientX >= rect.left && 
                    e.clientX <= rect.right && 
                    e.clientY >= rect.top && 
                    e.clientY <= rect.bottom;
      
      setIsOverCanvas(isOver);

      if (isOver) {
        // Use direct screen coordinates for perfect alignment
        setCursorPosition({
          x: e.clientX,
          y: e.clientY
        });
      } else {
        setCursorPosition(null);
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsOverCanvas(false);
    setCursorPosition(null);
  }, []);

  // Event listeners with proper cleanup
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Apply CSS cursor to canvas elements
  useEffect(() => {
    const currentToolId = toolManager.getCurrentToolId();
    const needsCustomCursor = ['brush', 'eraser'].includes(currentToolId);
    const csscursor = needsCustomCursor ? 'none' : 
                     currentToolId === 'hand' ? 'grab' :
                     currentToolId === 'text' ? 'text' :
                     ['rect', 'circle', 'line', 'triangle', 'star'].includes(currentToolId) ? 'crosshair' :
                     'default';

    const updateCursor = () => {
      const canvasElements = document.querySelectorAll('canvas, .konvajs-content, [data-cursor-managed="true"]');
      canvasElements.forEach((element) => {
        (element as HTMLElement).style.cursor = csscursor;
      });
    };

    updateCursor();
    
    // No more polling - just update when tool changes
    const checkTool = () => {
      if (toolManager.getCurrentToolId() !== currentToolId) {
        updateCursor();
      }
    };
    
    const interval = setInterval(checkTool, 50); // Minimal polling just for tool changes
    
    return () => {
      clearInterval(interval);
      const elements = document.querySelectorAll('canvas, .konvajs-content, [data-cursor-managed="true"]');
      elements.forEach((element) => {
        (element as HTMLElement).style.cursor = '';
      });
    };
  }, []);

  // Render custom cursor overlay
  const renderCustomCursor = () => {
    if (!cursorPosition || !isOverCanvas) return null;

    const currentToolId = toolManager.getCurrentToolId();
    const needsCustomCursor = ['brush', 'eraser', 'rect', 'circle', 'line', 'triangle', 'star', 'text'].includes(currentToolId);
    
    if (!needsCustomCursor) return null;

    const config = getCursorConfig();
    const scaledSize = config.size * zoom;
    
    // Clamp size for visibility
    const finalSize = Math.max(config.minSize, Math.min(config.maxSize, scaledSize));

    return (
      <div
        className="fixed pointer-events-none z-50 transition-all duration-75"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)', // Single, correct transform
        }}
      >
        {/* Main cursor shape */}
        {config.shape === 'circle' && (
          <div
            className="rounded-full border-2"
            style={{
              width: finalSize,
              height: finalSize,
              borderColor: config.color,
              backgroundColor: `${config.color.replace('hsl', 'hsla').replace(')', `, ${config.opacity * 0.1})`)}`,
            }}
          />
        )}
        
        {config.shape === 'crosshair' && (
          <div className="relative">
            {/* Horizontal line */}
            <div
              className="absolute"
              style={{
                left: -finalSize / 2,
                top: 0,
                width: finalSize,
                height: 1,
                backgroundColor: config.color,
              }}
            />
            {/* Vertical line */}
            <div
              className="absolute"
              style={{
                left: 0,
                top: -finalSize / 2,
                width: 1,
                height: finalSize,
                backgroundColor: config.color,
              }}
            />
          </div>
        )}

        {/* Center precision dot */}
        {config.showCenter && (
          <div
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: 2,
              height: 2,
              backgroundColor: config.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Additional crosshair for shapes */}
        {config.showCrosshair && (
          <div className="absolute">
            <div
              className="absolute"
              style={{
                left: -8,
                top: 0,
                width: 16,
                height: 1,
                backgroundColor: config.color,
              }}
            />
            <div
              className="absolute"
              style={{
                left: 0,
                top: -8,
                width: 1,
                height: 16,
                backgroundColor: config.color,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {children}
      
      {/* Custom cursor overlay */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {renderCustomCursor()}
      </div>
    </>
  );
};