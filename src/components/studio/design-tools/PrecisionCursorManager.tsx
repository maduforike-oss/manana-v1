import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';
import { getSmartPointer } from '@/utils/konvaCoords';

interface CursorConfig {
  size: number;
  color: string;
  opacity: number;
  shape: 'circle' | 'crosshair' | 'precision' | 'text';
  showCenter: boolean;
  showCrosshair: boolean;
  showGuideLines: boolean;
  minSize: number;
  maxSize: number;
  strokeWidth: number;
  shadowBlur: number;
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
  
  // Enhanced tool-specific cursor configuration with gaming-style precision
  const getCursorConfig = useCallback((): CursorConfig => {
    const currentToolId = toolManager.getCurrentToolId();
    const currentTool = toolManager.getCurrentTool();
    const settings = currentTool.getSettings();

    const baseConfig: CursorConfig = {
      size: 20,
      color: 'hsl(210 100% 60%)',
      opacity: 0.9,
      shape: 'precision',
      showCenter: true,
      showCrosshair: true,
      showGuideLines: false,
      minSize: 8,
      maxSize: 200,
      strokeWidth: 1.5,
      shadowBlur: 2
    };

    switch (currentToolId) {
      case 'brush':
        return {
          ...baseConfig,
          size: Math.max(baseConfig.minSize, Math.min(baseConfig.maxSize, settings.size || 10)),
          color: settings.color || 'hsl(210 100% 60%)',
          opacity: 0.8,
          shape: 'circle',
          showCenter: true,
          showCrosshair: false,
          showGuideLines: false,
          strokeWidth: 2,
          shadowBlur: 4
        };

      case 'eraser':
        return {
          ...baseConfig,
          size: Math.max(baseConfig.minSize, Math.min(baseConfig.maxSize, settings.size || 10)),
          color: 'hsl(0 100% 60%)',
          opacity: 0.7,
          shape: 'circle',
          showCenter: true,
          showCrosshair: false,
          showGuideLines: false,
          strokeWidth: 2,
          shadowBlur: 4
        };

      case 'rect':
      case 'circle':
      case 'triangle':
        return {
          ...baseConfig,
          size: 24,
          color: 'hsl(120 100% 50%)',
          shape: 'precision',
          showCenter: true,
          showCrosshair: true,
          showGuideLines: true,
          strokeWidth: 1.5,
          shadowBlur: 3
        };

      case 'text':
        return {
          ...baseConfig,
          size: 20,
          color: 'hsl(280 100% 60%)',
          shape: 'text',
          showCenter: true,
          showCrosshair: false,
          showGuideLines: false,
          strokeWidth: 1.5,
          shadowBlur: 2
        };

      default:
        return baseConfig;
    }
  }, []);

  // Enhanced cursor system using exact same coordinate logic as brush tool
  const handleMouseMove = useCallback(() => {
    if (!stageRef.current || !containerRef.current) return;
    
    const stage = stageRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Use exact same coordinate logic as brush tool (getSmartPointer)
    const stagePos = getSmartPointer(stage);
    const pointerPosition = stage.getPointerPosition();
    
    if (pointerPosition && stagePos) {
      // Convert stage coordinates to screen coordinates for cursor overlay
      const transform = stage.getAbsoluteTransform();
      const screenPoint = transform.point(stagePos);
      
      const screenPosition = {
        x: screenPoint.x + containerRect.left,
        y: screenPoint.y + containerRect.top
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

  // Enhanced gaming-style precision cursor rendering
  const renderCustomCursor = () => {
    if (!cursorPosition || !isOverCanvas) return null;

    const currentToolId = toolManager.getCurrentToolId();
    const needsCustomCursor = ['brush', 'eraser', 'rect', 'circle', 'triangle', 'text'].includes(currentToolId);
    
    if (!needsCustomCursor) return null;

    const config = getCursorConfig();
    
    // Zoom-adaptive sizing with enhanced visibility
    const scaledSize = config.size * zoom;
    const finalSize = Math.max(config.minSize, Math.min(config.maxSize, scaledSize));
    const strokeWidth = Math.max(1, config.strokeWidth * (zoom > 1 ? Math.min(zoom, 2) : 1));
    const shadowBlur = config.shadowBlur * Math.min(zoom, 1.5);

    return (
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)',
          filter: `drop-shadow(0 0 ${shadowBlur}px rgba(0,0,0,0.3))`,
        }}
      >
        {/* Circle cursor for brush/eraser */}
        {config.shape === 'circle' && (
          <>
            {/* Outer ring for visibility */}
            <div
              className="absolute rounded-full"
              style={{
                width: finalSize + 4,
                height: finalSize + 4,
                border: `${strokeWidth}px solid rgba(0,0,0,0.8)`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Main circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: finalSize,
                height: finalSize,
                border: `${strokeWidth}px solid ${config.color}`,
                backgroundColor: `${config.color.replace(')', `, ${config.opacity * 0.1})`)}`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </>
        )}
        
        {/* Precision crosshair for shapes */}
        {config.shape === 'precision' && (
          <>
            {/* Guide lines extending to edges */}
            {config.showGuideLines && (
              <>
                <div
                  className="absolute"
                  style={{
                    left: -100,
                    top: -strokeWidth / 2,
                    width: 200,
                    height: strokeWidth,
                    background: `linear-gradient(90deg, transparent 0%, ${config.color} 45%, ${config.color} 55%, transparent 100%)`,
                    opacity: 0.6,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: -strokeWidth / 2,
                    top: -100,
                    width: strokeWidth,
                    height: 200,
                    background: `linear-gradient(180deg, transparent 0%, ${config.color} 45%, ${config.color} 55%, transparent 100%)`,
                    opacity: 0.6,
                  }}
                />
              </>
            )}
            
            {/* Main crosshair */}
            <div
              className="absolute"
              style={{
                left: -finalSize / 2,
                top: -strokeWidth / 2,
                width: finalSize,
                height: strokeWidth,
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}
            />
            <div
              className="absolute"
              style={{
                left: -finalSize / 2,
                top: -strokeWidth / 2,
                width: finalSize,
                height: strokeWidth,
                backgroundColor: config.color,
                transform: 'translate(0, -1px)',
              }}
            />
            <div
              className="absolute"
              style={{
                left: -strokeWidth / 2,
                top: -finalSize / 2,
                width: strokeWidth,
                height: finalSize,
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}
            />
            <div
              className="absolute"
              style={{
                left: -strokeWidth / 2,
                top: -finalSize / 2,
                width: strokeWidth,
                height: finalSize,
                backgroundColor: config.color,
                transform: 'translate(-1px, 0)',
              }}
            />
          </>
        )}

        {/* Text cursor with I-beam style */}
        {config.shape === 'text' && (
          <>
            {/* I-beam vertical line */}
            <div
              className="absolute"
              style={{
                left: -strokeWidth / 2,
                top: -finalSize / 2,
                width: strokeWidth * 2,
                height: finalSize,
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}
            />
            <div
              className="absolute"
              style={{
                left: -strokeWidth / 2,
                top: -finalSize / 2,
                width: strokeWidth,
                height: finalSize,
                backgroundColor: config.color,
              }}
            />
            {/* Top and bottom caps */}
            <div
              className="absolute"
              style={{
                left: -4,
                top: -finalSize / 2,
                width: 8,
                height: strokeWidth * 2,
                backgroundColor: config.color,
              }}
            />
            <div
              className="absolute"
              style={{
                left: -4,
                top: finalSize / 2 - strokeWidth * 2,
                width: 8,
                height: strokeWidth * 2,
                backgroundColor: config.color,
              }}
            />
          </>
        )}

        {/* Enhanced center precision dot */}
        {config.showCenter && (
          <>
            {/* Outer dot for visibility */}
            <div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: 4,
                height: 4,
                backgroundColor: 'rgba(0,0,0,0.8)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Inner precise dot */}
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
          </>
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