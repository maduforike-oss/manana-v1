import { useState, useCallback, useRef, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';

export type CanvasMode = 'navigate' | 'draw' | 'transform' | 'text';

interface CanvasFocusState {
  isFocused: boolean;
  mode: CanvasMode;
  canAcceptInput: boolean;
}

export const useCanvasFocus = () => {
  const [focusState, setFocusState] = useState<CanvasFocusState>({
    isFocused: false,
    mode: 'navigate',
    canAcceptInput: false
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { activeTool } = useStudioStore();

  // Determine mode based on active tool
  const getMode = useCallback((tool: string): CanvasMode => {
    switch (tool) {
      case 'brush':
      case 'eraser':
        return 'draw';
      case 'text':
        return 'text';
      case 'select':
        return 'transform';
      default:
        return 'navigate';
    }
  }, []);

  // Focus the canvas
  const focusCanvas = useCallback(() => {
    const mode = getMode(activeTool);
    setFocusState({
      isFocused: true,
      mode,
      canAcceptInput: mode === 'draw' || mode === 'text'
    });
    
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  }, [activeTool, getMode]);

  // Blur the canvas
  const blurCanvas = useCallback(() => {
    setFocusState({
      isFocused: false,
      mode: 'navigate',
      canAcceptInput: false
    });
  }, []);

  // Handle tool changes
  useEffect(() => {
    const mode = getMode(activeTool);
    setFocusState(prev => ({
      ...prev,
      mode,
      canAcceptInput: prev.isFocused && (mode === 'draw' || mode === 'text')
    }));
  }, [activeTool, getMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        blurCanvas();
      }
    };

    if (focusState.isFocused) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusState.isFocused, blurCanvas]);

  return {
    focusState,
    canvasRef,
    focusCanvas,
    blurCanvas,
    shouldCapture: focusState.isFocused && focusState.canAcceptInput,
    showDrawPrompt: activeTool === 'brush' && !focusState.isFocused
  };
};