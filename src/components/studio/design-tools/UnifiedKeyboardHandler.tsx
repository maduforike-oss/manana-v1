import React, { useEffect } from 'react';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';
import { Tool } from '@/lib/studio/types';

export const UnifiedKeyboardHandler = () => {
  const { setActiveTool, undo, redo, setZoom, setPanOffset, zoom, panOffset } = useStudioStore();

  // Function to activate tool in both systems
  const activateToolBoth = (toolId: Tool) => {
    setActiveTool(toolId); // Update store
    toolManager.activateTool(toolId); // Update tool manager
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          e.preventDefault();
          activateToolBoth('select');
          break;
        case 'h':
          e.preventDefault();
          activateToolBoth('hand');
          break;
        case 't':
          e.preventDefault();
          activateToolBoth('text');
          break;
        case 'b':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activateToolBoth('brush');
          }
          break;
        case 'e':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activateToolBoth('eraser');
          }
          break;
        case 'r':
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activateToolBoth('rect');
          }
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activateToolBoth('circle');
          }
          break;
        case 'i':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activateToolBoth('image');
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(Math.min(zoom * 1.2, 5));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(Math.max(zoom / 1.2, 0.1));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }
          break;
        case 'escape':
          e.preventDefault();
          // Switch to select tool and clear selection
          activateToolBoth('select');
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      toolManager.handleKeyUp(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveTool, undo, redo, setZoom, setPanOffset, zoom, panOffset, activateToolBoth]);

  // Sync tool manager with store changes
  useEffect(() => {
    const { activeTool } = useStudioStore.getState();
    if (toolManager.getCurrentToolId() !== activeTool) {
      toolManager.activateTool(activeTool);
    }
  });

  return null; // This component just handles events
};