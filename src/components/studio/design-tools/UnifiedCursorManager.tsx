import React from 'react';
import { toolManager } from './ToolManager';

interface UnifiedCursorManagerProps {
  children: React.ReactNode;
}

export const UnifiedCursorManager: React.FC<UnifiedCursorManagerProps> = ({ children }) => {
  // Apply cursor styles based on active tool
  React.useEffect(() => {
    const updateGlobalCursor = () => {
      const currentCursor = toolManager.getCurrentCursor();
      
      // Apply cursor to canvas elements specifically
      const canvasElements = document.querySelectorAll('canvas, .konvajs-content');
      canvasElements.forEach((element) => {
        (element as HTMLElement).style.cursor = currentCursor;
      });
      
      // Apply cursor to main stage containers
      const stageElements = document.querySelectorAll('[data-cursor-managed="true"]');
      stageElements.forEach((element) => {
        (element as HTMLElement).style.cursor = currentCursor;
      });
    };

    // Update immediately and set up polling for changes
    updateGlobalCursor();
    const interval = setInterval(updateGlobalCursor, 100);
    
    return () => {
      clearInterval(interval);
      
      // Reset cursors on cleanup
      const elements = document.querySelectorAll('canvas, .konvajs-content, [data-cursor-managed="true"]');
      elements.forEach((element) => {
        (element as HTMLElement).style.cursor = '';
      });
    };
  }, []);

  return <>{children}</>;
};