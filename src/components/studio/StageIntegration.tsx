import React, { useEffect, useRef } from 'react';
import { useToolCursor } from './ToolCursorManager';
import { BrushSettings } from '../../lib/studio/brushEngine';

interface StageIntegrationProps {
  brushSettings: BrushSettings;
  activeTool: string;
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Integration component for cursor tracking within the stage container
 */
export const StageIntegration: React.FC<StageIntegrationProps> = ({
  brushSettings,
  activeTool,
  containerRef
}) => {
  const { 
    updateCursor, 
    setCursorPosition, 
    showCursor, 
    hideCursor, 
    setDrawingState,
    setCanvasRect 
  } = useToolCursor();
  
  const isTrackingRef = useRef(false);

  // Update cursor settings when brush settings change
  useEffect(() => {
    updateCursor({
      tool: activeTool,
      brushSize: brushSettings.size,
      color: brushSettings.color
    });
  }, [brushSettings, activeTool, updateCursor]);

  // Track pointer movement and apply tool-specific cursor behavior (unified for mouse/touch/stylus)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect input type from pointer events
    const detectInputType = (e: PointerEvent) => {
      const isStylus = e.pointerType === 'pen' || 
                      (e.pressure > 0 && e.pointerType === 'touch' && e.width < 10);
      const isFinger = e.pointerType === 'touch' && !isStylus;
      const isMouse = e.pointerType === 'mouse';
      
      return { isStylus, isFinger, isMouse };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const { isStylus, isFinger, isMouse } = detectInputType(e);
      
      // Always update cursor position for consistent tracking
      setCursorPosition(e.clientX, e.clientY);
      
      if (['brush', 'eraser'].includes(activeTool)) {
        // Show cursor for mouse and stylus, hide for finger touch
        const shouldShowCursor = isMouse || isStylus;
        
        if (shouldShowCursor && !isTrackingRef.current) {
          showCursor();
          isTrackingRef.current = true;
        } else if (!shouldShowCursor && isTrackingRef.current) {
          hideCursor();
          isTrackingRef.current = false;
        }
      }
    };

    const handlePointerEnter = (e: PointerEvent) => {
      // Update canvas rect when entering
      const rect = container.getBoundingClientRect();
      setCanvasRect(rect);
      
      const { isStylus, isMouse } = detectInputType(e);
      
      if (['brush', 'eraser'].includes(activeTool)) {
        // Show cursor for mouse and stylus only
        if (isMouse || isStylus) {
          showCursor();
          isTrackingRef.current = true;
        }
      }
    };

    const handlePointerLeave = () => {
      if (['brush', 'eraser'].includes(activeTool)) {
        hideCursor();
        isTrackingRef.current = false;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (['brush', 'eraser'].includes(activeTool)) {
        setDrawingState(true);
      }
    };

    const handlePointerUp = () => {
      if (['brush', 'eraser'].includes(activeTool)) {
        setDrawingState(false);
      }
    };

    // Apply cursor styles based on tool
    const updateCursorStyle = () => {
      switch (activeTool) {
        case 'brush':
        case 'eraser':
          container.style.cursor = 'none';
          break;
        case 'text':
          container.style.cursor = 'text';
          break;
        case 'select':
        case 'move':
          container.style.cursor = 'default';
          break;
        case 'rect':
        case 'circle':
        case 'line':
          container.style.cursor = 'crosshair';
          break;
        default:
          container.style.cursor = 'default';
      }
    };

    updateCursorStyle();

    // Use pointer events for unified handling across input types
    container.addEventListener('pointermove', handlePointerMove, { passive: false });
    container.addEventListener('pointerenter', handlePointerEnter, { passive: false });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: false });
    container.addEventListener('pointerdown', handlePointerDown, { passive: false });
    container.addEventListener('pointerup', handlePointerUp, { passive: false });

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      
      // Reset cursor
      container.style.cursor = '';
      hideCursor();
      isTrackingRef.current = false;
    };
  }, [activeTool, setCursorPosition, showCursor, hideCursor, setDrawingState, setCanvasRect]);

  // Hide cursor when tool changes away from brush/eraser
  useEffect(() => {
    if (!['brush', 'eraser'].includes(activeTool)) {
      hideCursor();
      isTrackingRef.current = false;
    }
  }, [activeTool, hideCursor]);

  return null; // This is a logic-only component
};