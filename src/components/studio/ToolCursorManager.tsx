import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { screenToCanvas } from '@/lib/studio/coordinateTransform';

interface CursorState {
  tool: string;
  position: { x: number; y: number };
  brushSize: number;
  color: string;
  isVisible: boolean;
  isDrawing: boolean;
  canvasRect: DOMRect | null;
}

interface ToolCursorContextType {
  cursorState: CursorState;
  updateCursor: (updates: Partial<CursorState>) => void;
  setCursorPosition: (clientX: number, clientY: number) => void;
  setDrawingState: (isDrawing: boolean) => void;
  setCanvasRect: (rect: DOMRect) => void;
  showCursor: () => void;
  hideCursor: () => void;
}

const ToolCursorContext = createContext<ToolCursorContextType | null>(null);

export const useToolCursor = () => {
  const context = useContext(ToolCursorContext);
  if (!context) {
    throw new Error('useToolCursor must be used within ToolCursorProvider');
  }
  return context;
};

interface ToolCursorProviderProps {
  children: React.ReactNode;
}

export const ToolCursorProvider: React.FC<ToolCursorProviderProps> = ({ children }) => {
  const { activeTool, zoom, panOffset } = useStudioStore();
  const [cursorState, setCursorState] = useState<CursorState>({
    tool: activeTool,
    position: { x: 0, y: 0 },
    brushSize: 20,
    color: '#000000',
    isVisible: false,
    isDrawing: false,
    canvasRect: null
  });

  // Update tool when store changes
  useEffect(() => {
    setCursorState(prev => ({ ...prev, tool: activeTool }));
  }, [activeTool]);

  const updateCursor = useCallback((updates: Partial<CursorState>) => {
    setCursorState(prev => ({ ...prev, ...updates }));
  }, []);

  const setCursorPosition = useCallback((clientX: number, clientY: number) => {
    // Use screen coordinates directly for cursor positioning
    // This ensures the cursor appears exactly where the pointer is
    setCursorState(prev => ({ ...prev, position: { x: clientX, y: clientY } }));
  }, []);

  const setDrawingState = useCallback((isDrawing: boolean) => {
    setCursorState(prev => ({ ...prev, isDrawing }));
  }, []);

  const setCanvasRect = useCallback((rect: DOMRect) => {
    setCursorState(prev => ({ ...prev, canvasRect: rect }));
  }, []);

  const showCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hideCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const value: ToolCursorContextType = {
    cursorState,
    updateCursor,
    setCursorPosition,
    setDrawingState,
    setCanvasRect,
    showCursor,
    hideCursor
  };

  return (
    <ToolCursorContext.Provider value={value}>
      {children}
      <ToolCursorDisplay />
    </ToolCursorContext.Provider>
  );
};

const ToolCursorDisplay: React.FC = () => {
  const { cursorState } = useToolCursor();

  // Only show custom cursor for brush/eraser tools when visible
  if (!cursorState.isVisible || !['brush', 'eraser'].includes(cursorState.tool)) {
    return null;
  }

  // Scale cursor size appropriately for display
  const cursorSize = Math.max(8, Math.min(40, cursorState.brushSize));
  
  // Position cursor precisely at pointer location
  const cursorStyle = {
    left: cursorState.position.x - cursorSize / 2,
    top: cursorState.position.y - cursorSize / 2,
    width: cursorSize,
    height: cursorSize,
  };

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-none will-change-transform"
      style={cursorStyle}
    >
      {cursorState.tool === 'brush' ? (
        <div
          className="w-full h-full rounded-full border-2 border-white shadow-lg"
          style={{
            backgroundColor: cursorState.color,
            opacity: cursorState.isDrawing ? 0.9 : 0.7,
            transform: cursorState.isDrawing ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.1s ease-out'
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full border-2 border-red-500 bg-transparent shadow-lg"
          style={{
            borderStyle: 'dashed',
            opacity: cursorState.isDrawing ? 0.9 : 0.7,
            transform: cursorState.isDrawing ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.1s ease-out'
          }}
        />
      )}
    </div>
  );
};