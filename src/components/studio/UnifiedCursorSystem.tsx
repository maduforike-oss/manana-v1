import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { BrushEngine } from '@/lib/studio/brushEngine';

interface CursorConfig {
  tool: string;
  size: number;
  color: string;
  opacity: number;
  hardness?: number;
}

interface UnifiedCursorSystemProps {
  containerRef: React.RefObject<HTMLElement>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

export const UnifiedCursorSystem: React.FC<UnifiedCursorSystemProps> = ({
  containerRef,
  canvasRef,
  isActive
}) => {
  const { activeTool, doc } = useStudioStore();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isInCanvas, setIsInCanvas] = useState(false);
  const [cursorSize, setCursorSize] = useState(20);
  const cursorRef = useRef<HTMLDivElement>(null);
  const brushEngineRef = useRef<BrushEngine>();

  // Initialize brush engine for cursor preview
  useEffect(() => {
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine();
    }
  }, []);

  // Update cursor size based on tool and settings
  useEffect(() => {
    if (activeTool === 'brush' || activeTool === 'eraser') {
      // Get brush size from store or default
      const brushSize = 20; // This should come from brush settings
      setCursorSize(brushSize);
    } else {
      setCursorSize(20);
    }
  }, [activeTool]);

  // Get precise canvas boundaries
  const getCanvasBounds = useCallback(() => {
    if (!containerRef.current) return null;
    
    // Find the actual drawable canvas area
    const canvasElement = containerRef.current.querySelector('canvas');
    if (canvasElement) {
      return canvasElement.getBoundingClientRect();
    }
    
    // Fallback to container bounds
    return containerRef.current.getBoundingClientRect();
  }, [containerRef]);

  // Check if point is within canvas boundaries
  const isPointInCanvas = useCallback((clientX: number, clientY: number): boolean => {
    const bounds = getCanvasBounds();
    if (!bounds) return false;
    
    return (
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom
    );
  }, [getCanvasBounds]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || !containerRef.current) return;
    
    const inCanvas = isPointInCanvas(e.clientX, e.clientY);
    setIsInCanvas(inCanvas);
    
    if (inCanvas) {
      const bounds = getCanvasBounds();
      if (bounds) {
        // Convert to canvas-relative coordinates
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        setCursorPosition({ x, y });
      }
    }
  }, [isActive, containerRef, isPointInCanvas, getCanvasBounds]);

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    setIsInCanvas(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsInCanvas(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    document.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isActive, containerRef, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Generate cursor style based on tool
  const getCursorStyle = useCallback((tool: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1000,
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 150ms ease-out',
    };

    switch (tool) {
      case 'brush':
      case 'eraser':
        return {
          ...baseStyle,
          width: cursorSize,
          height: cursorSize,
          border: '2px solid rgba(0, 0, 0, 0.8)',
          borderRadius: '50%',
          backgroundColor: tool === 'eraser' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          left: cursorPosition.x,
          top: cursorPosition.y,
          opacity: isInCanvas ? 1 : 0,
        };
      
      case 'text':
        return {
          ...baseStyle,
          width: 2,
          height: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          left: cursorPosition.x,
          top: cursorPosition.y,
          opacity: isInCanvas ? 1 : 0,
        };
      
      case 'select':
      case 'hand':
        return {
          ...baseStyle,
          opacity: 0, // Use default cursor
        };
      
      default:
        return {
          ...baseStyle,
          width: 20,
          height: 20,
          border: '2px solid rgba(0, 0, 0, 0.6)',
          borderRadius: '50%',
          left: cursorPosition.x,
          top: cursorPosition.y,
          opacity: isInCanvas ? 0.8 : 0,
        };
    }
  }, [activeTool, cursorSize, cursorPosition, isInCanvas]);

  // Set container cursor style
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    let cursor = 'default';
    
    switch (activeTool) {
      case 'brush':
      case 'eraser':
        cursor = 'none'; // Hide default cursor, show custom
        break;
      case 'text':
        cursor = 'text';
        break;
      case 'hand':
        cursor = 'grab';
        break;
      case 'select':
        cursor = 'default';
        break;
      default:
        cursor = 'crosshair';
    }
    
    container.style.cursor = cursor;
    
    return () => {
      container.style.cursor = 'default';
    };
  }, [activeTool, containerRef]);

  // Don't render custom cursor for certain tools
  if (!isActive || ['select', 'hand'].includes(activeTool)) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      style={getCursorStyle(activeTool)}
      className="cursor-indicator"
    >
      {/* Additional cursor details for brush/eraser */}
      {(activeTool === 'brush' || activeTool === 'eraser') && isInCanvas && (
        <>
          {/* Inner circle for hardness indication */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${cursorSize * 0.5}px`,
              height: `${cursorSize * 0.5}px`,
              border: '1px solid rgba(0, 0, 0, 0.4)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          
          {/* Center dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '2px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
};