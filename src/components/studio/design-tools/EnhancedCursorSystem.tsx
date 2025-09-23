import React, { useEffect, useRef } from 'react';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';

interface EnhancedCursorSystemProps {
  children: React.ReactNode;
}

export const EnhancedCursorSystem: React.FC<EnhancedCursorSystemProps> = ({ children }) => {
  const cursorOverlayRef = useRef<HTMLDivElement>(null);
  const { zoom } = useStudioStore();
  
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [showCursorPreview, setShowCursorPreview] = React.useState(false);

  // Dynamic cursor styles based on active tool
  const getCursorStyle = () => {
    const currentTool = toolManager.getCurrentTool();
    const currentToolId = toolManager.getCurrentToolId();
    
    switch (currentToolId) {
      case 'select':
        return 'default';
      case 'hand':
        return 'grab';
      case 'text':
        return 'text';
      case 'brush':
        return 'none'; // We'll show custom brush cursor
      case 'eraser':
        return 'none'; // We'll show custom eraser cursor
      case 'rect':
      case 'circle':
      case 'line':
      case 'triangle':
      case 'star':
        return 'crosshair';
      default:
        return 'default';
    }
  };

  // Get brush/eraser size for preview cursor
  const getBrushSize = () => {
    const currentTool = toolManager.getCurrentTool();
    const settings = currentTool.getSettings();
    return (settings.size || 10) * zoom;
  };

  // Check if current tool needs custom cursor preview
  const needsCustomCursor = () => {
    const currentToolId = toolManager.getCurrentToolId();
    return currentToolId === 'brush' || currentToolId === 'eraser';
  };

  // Update mouse position for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setShowCursorPreview(needsCustomCursor());
    };

    const handleMouseEnter = () => {
      setShowCursorPreview(needsCustomCursor());
    };

    const handleMouseLeave = () => {
      setShowCursorPreview(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [zoom]);

  // Apply cursor styles to canvas elements
  useEffect(() => {
    const cursorStyle = getCursorStyle();
    
    const updateCursor = () => {
      // Apply to canvas elements
      const canvasElements = document.querySelectorAll('canvas, .konvajs-content');
      canvasElements.forEach((element) => {
        (element as HTMLElement).style.cursor = cursorStyle;
      });
      
      // Apply to stage containers
      const stageElements = document.querySelectorAll('[data-cursor-managed="true"]');
      stageElements.forEach((element) => {
        (element as HTMLElement).style.cursor = cursorStyle;
      });
    };

    updateCursor();
    const interval = setInterval(updateCursor, 100);
    
    return () => {
      clearInterval(interval);
      
      // Reset cursors on cleanup
      const elements = document.querySelectorAll('canvas, .konvajs-content, [data-cursor-managed="true"]');
      elements.forEach((element) => {
        (element as HTMLElement).style.cursor = '';
      });
    };
  }, [zoom]);

  const renderCustomCursor = () => {
    if (!showCursorPreview) return null;
    
    const currentToolId = toolManager.getCurrentToolId();
    const brushSize = getBrushSize();
    const isEraser = currentToolId === 'eraser';
    
    return (
      <div
        className="fixed pointer-events-none z-50 rounded-full border-2 transition-all duration-75"
        style={{
          left: mousePosition.x - brushSize / 2,
          top: mousePosition.y - brushSize / 2,
          width: brushSize,
          height: brushSize,
          borderColor: isEraser ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
          backgroundColor: isEraser ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--primary) / 0.1)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Center dot for precision */}
        <div
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: 2,
            height: 2,
            backgroundColor: isEraser ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Crosshair for shapes */}
        {(currentToolId === 'rect' || currentToolId === 'circle') && (
          <>
            <div
              className="absolute"
              style={{
                left: '50%',
                top: 0,
                width: 1,
                height: '100%',
                backgroundColor: 'hsl(var(--primary))',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              className="absolute"
              style={{
                left: 0,
                top: '50%',
                width: '100%',
                height: 1,
                backgroundColor: 'hsl(var(--primary))',
                transform: 'translateY(-50%)',
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
      <div ref={cursorOverlayRef} className="fixed inset-0 pointer-events-none z-40">
        {renderCustomCursor()}
      </div>
    </>
  );
};