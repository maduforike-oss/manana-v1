import React, { useEffect, useRef } from 'react';
import { useUnifiedCursor } from './UnifiedCursorManager';
import { BrushSettings } from '../../lib/studio/brushEngine';

interface CursorIntegrationProps {
  brushSettings: BrushSettings;
  activeTool: string;
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Component that integrates cursor tracking with the unified cursor system
 */
export const CursorIntegration: React.FC<CursorIntegrationProps> = ({
  brushSettings,
  activeTool,
  containerRef
}) => {
  const { updateCursor, setCursorPosition, showCursor, hideCursor } = useUnifiedCursor();
  const isTrackingRef = useRef(false);

  // Update cursor settings when brush settings change
  useEffect(() => {
    updateCursor({
      tool: activeTool,
      brushSize: brushSettings.size,
      color: brushSettings.color
    });
  }, [brushSettings, activeTool, updateCursor]);

  // Track mouse movement over the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (['brush', 'eraser'].includes(activeTool)) {
        setCursorPosition(e.clientX, e.clientY);
        if (!isTrackingRef.current) {
          showCursor();
          isTrackingRef.current = true;
        }
      }
    };

    const handleMouseEnter = () => {
      if (['brush', 'eraser'].includes(activeTool)) {
        showCursor();
        isTrackingRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      hideCursor();
      isTrackingRef.current = false;
    };

    // Add the unified cursor class to the container
    container.classList.add('unified-cursor-area');

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.classList.remove('unified-cursor-area');
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      hideCursor();
      isTrackingRef.current = false;
    };
  }, [activeTool, setCursorPosition, showCursor, hideCursor]);

  // Hide cursor when tool changes away from brush/eraser
  useEffect(() => {
    if (!['brush', 'eraser'].includes(activeTool)) {
      hideCursor();
      isTrackingRef.current = false;
    }
  }, [activeTool, hideCursor]);

  return null; // This is a logic-only component
};