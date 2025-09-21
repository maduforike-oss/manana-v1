import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface CursorState {
  tool: string;
  position: { x: number; y: number };
  brushSize: number;
  color: string;
  isVisible: boolean;
  isDrawing: boolean;
}

interface UnifiedCursorContextType {
  cursorState: CursorState;
  updateCursor: (updates: Partial<CursorState>) => void;
  hideCursor: () => void;
  showCursor: () => void;
  setCursorPosition: (x: number, y: number) => void;
  setDrawingState: (isDrawing: boolean) => void;
}

const UnifiedCursorContext = createContext<UnifiedCursorContextType | null>(null);

export const useUnifiedCursor = () => {
  const context = useContext(UnifiedCursorContext);
  if (!context) {
    throw new Error('useUnifiedCursor must be used within UnifiedCursorProvider');
  }
  return context;
};

interface UnifiedCursorProviderProps {
  children: React.ReactNode;
}

export const UnifiedCursorProvider: React.FC<UnifiedCursorProviderProps> = ({ children }) => {
  const { activeTool } = useStudioStore();
  const [cursorState, setCursorState] = useState<CursorState>({
    tool: activeTool,
    position: { x: 0, y: 0 },
    brushSize: 20,
    color: '#000000',
    isVisible: false,
    isDrawing: false
  });

  // Update tool when store changes
  useEffect(() => {
    setCursorState(prev => ({ ...prev, tool: activeTool }));
  }, [activeTool]);

  const updateCursor = useCallback((updates: Partial<CursorState>) => {
    setCursorState(prev => ({ ...prev, ...updates }));
  }, []);

  const hideCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const setCursorPosition = useCallback((x: number, y: number) => {
    setCursorState(prev => ({ ...prev, position: { x, y } }));
  }, []);

  const setDrawingState = useCallback((isDrawing: boolean) => {
    setCursorState(prev => ({ ...prev, isDrawing }));
  }, []);

  const value: UnifiedCursorContextType = {
    cursorState,
    updateCursor,
    hideCursor,
    showCursor,
    setCursorPosition,
    setDrawingState
  };

  return (
    <UnifiedCursorContext.Provider value={value}>
      {children}
      <UnifiedCursorDisplay />
    </UnifiedCursorContext.Provider>
  );
};

const UnifiedCursorDisplay: React.FC = () => {
  const { cursorState } = useUnifiedCursor();
  const cursorRef = useRef<HTMLDivElement>(null);

  // Hide default cursor on drawing areas
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .unified-cursor-area, .unified-cursor-area * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!cursorState.isVisible || (!['brush', 'eraser'].includes(cursorState.tool))) {
    return null;
  }

  const cursorSize = Math.max(8, Math.min(40, cursorState.brushSize));

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] transition-none"
      style={{
        left: cursorState.position.x - cursorSize / 2,
        top: cursorState.position.y - cursorSize / 2,
        width: cursorSize,
        height: cursorSize,
      }}
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