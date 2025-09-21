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

  // Track mouse movement and apply tool-specific cursor behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition(e.clientX, e.clientY);
      
      if (['brush', 'eraser'].includes(activeTool)) {
        if (!isTrackingRef.current) {
          showCursor();
          isTrackingRef.current = true;
        }
      }
    };

    const handleMouseEnter = () => {
      // Update canvas rect when entering
      const rect = container.getBoundingClientRect();
      setCanvasRect(rect);
      
      if (['brush', 'eraser'].includes(activeTool)) {
        showCursor();
        isTrackingRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      if (['brush', 'eraser'].includes(activeTool)) {
        hideCursor();
        isTrackingRef.current = false;
      }
    };

    const handlePointerDown = () => {
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

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
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