import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';

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
  const { zoom } = useStudioStore();
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  
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

  // Professional cursor system using Konva's native methods
  const handleMouseMove = useCallback(() => {
    if (!stageRef.current || !containerRef.current) return;
    
    const stage = stageRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Use Konva's native getPointerPosition() - industry standard
    const pointerPosition = stage.getPointerPosition();
    
    if (pointerPosition) {
      // Convert canvas coordinates to screen coordinates for cursor positioning
      const screenPosition = {
        x: pointerPosition.x + containerRect.left,
        y: pointerPosition.y + containerRect.top
      };
      
      setCursorPosition(screenPosition);
      setIsOverCanvas(true);
    } else {
      setIsOverCanvas(false);
      setCursorPosition(null);
    }
  }, [zoom]);

  const handleMouseLeave = useCallback(() => {
    setIsOverCanvas(false);
    setCursorPosition(null);
  }, []);

  // Event-driven updates using Konva's stage events (professional approach)
  useEffect(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    
    // Hook into Konva's native mouse events for perfect synchronization
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseleave', handleMouseLeave);
    stage.on('mouseout', handleMouseLeave);
    
    return () => {
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseleave', handleMouseLeave);
      stage.off('mouseout', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, stageRef.current]);

  // Apply CSS cursor to canvas elements
  useEffect(() => {
    const currentToolId = toolManager.getCurrentToolId();
    const needsCustomCursor = ['brush', 'eraser'].includes(currentToolId);
    const cssCursor = needsCustomCursor ? 'none' : 
                     currentToolId === 'hand' ? 'grab' :
                     currentToolId === 'text' ? 'text' :
                     ['rect', 'circle', 'line', 'triangle', 'star'].includes(currentToolId) ? 'crosshair' :
                     'default';

    const updateCursor = () => {
      const canvasElements = document.querySelectorAll('canvas, .konvajs-content, [data-cursor-managed="true"]');
      canvasElements.forEach((element) => {
        (element as HTMLElement).style.cursor = cssCursor;
      });
    };

    updateCursor();
    
    // Minimal polling just for tool changes detection
    const interval = setInterval(() => {
      if (toolManager.getCurrentToolId() !== currentToolId) {
        updateCursor();
      }
    }, 100);
    
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
    
    // Zoom-aware sizing with proper constraints
    const scaledSize = config.size * zoom;
    const finalSize = Math.max(config.minSize, Math.min(config.maxSize, scaledSize));

    return (
      <div
        className="fixed pointer-events-none z-50 transition-none"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)',
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