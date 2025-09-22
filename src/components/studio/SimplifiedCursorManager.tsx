import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { useUnifiedCoordinates } from './UnifiedCoordinateSystem';

interface SimplifiedCursorState {
  isVisible: boolean;
  position: { x: number; y: number };
  tool: string;
  brushSize: number;
  color: string;
  isDrawing: boolean;
  inputType: 'mouse' | 'pen' | 'touch';
}

interface SimplifiedCursorContextType {
  cursorState: SimplifiedCursorState;
  showCursor: () => void;
  hideCursor: () => void;
  updatePosition: (x: number, y: number) => void;
  updateSettings: (updates: Partial<SimplifiedCursorState>) => void;
  setDrawing: (isDrawing: boolean) => void;
  setInputType: (type: 'mouse' | 'pen' | 'touch') => void;
}

const SimplifiedCursorContext = createContext<SimplifiedCursorContextType | null>(null);

export const useSimplifiedCursor = () => {
  const context = useContext(SimplifiedCursorContext);
  if (!context) {
    throw new Error('useSimplifiedCursor must be used within SimplifiedCursorProvider');
  }
  return context;
};

interface SimplifiedCursorProviderProps {
  children: React.ReactNode;
}

export const SimplifiedCursorProvider: React.FC<SimplifiedCursorProviderProps> = ({ children }) => {
  const { activeTool } = useStudioStore();
  const { isPointInCanvas } = useUnifiedCoordinates();
  
  const [cursorState, setCursorState] = useState<SimplifiedCursorState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    tool: activeTool,
    brushSize: 20,
    color: '#000000',
    isDrawing: false,
    inputType: 'mouse'
  });

  // Update tool when store changes
  useEffect(() => {
    setCursorState(prev => ({ ...prev, tool: activeTool }));
  }, [activeTool]);

  // Global mouse tracking for precise cursor positioning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const inCanvas = isPointInCanvas(e.clientX, e.clientY);
      const shouldShow = inCanvas && 
                        ['brush', 'eraser'].includes(cursorState.tool) && 
                        cursorState.inputType !== 'touch';

      setCursorState(prev => ({
        ...prev,
        position: { x: e.clientX, y: e.clientY },
        isVisible: shouldShow
      }));
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isPointInCanvas, cursorState.tool, cursorState.inputType]);

  const showCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hideCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const updatePosition = useCallback((x: number, y: number) => {
    setCursorState(prev => ({ ...prev, position: { x, y } }));
  }, []);

  const updateSettings = useCallback((updates: Partial<SimplifiedCursorState>) => {
    setCursorState(prev => ({ ...prev, ...updates }));
  }, []);

  const setDrawing = useCallback((isDrawing: boolean) => {
    setCursorState(prev => ({ ...prev, isDrawing }));
  }, []);

  const setInputType = useCallback((type: 'mouse' | 'pen' | 'touch') => {
    setCursorState(prev => ({ ...prev, inputType: type }));
  }, []);

  const value: SimplifiedCursorContextType = {
    cursorState,
    showCursor,
    hideCursor,
    updatePosition,
    updateSettings,
    setDrawing,
    setInputType
  };

  return (
    <SimplifiedCursorContext.Provider value={value}>
      {children}
      <SimplifiedCursorDisplay />
    </SimplifiedCursorContext.Provider>
  );
};

const SimplifiedCursorDisplay: React.FC = () => {
  const { cursorState } = useSimplifiedCursor();

  if (!cursorState.isVisible) {
    return null;
  }

  const cursorSize = Math.max(8, Math.min(40, cursorState.brushSize));
  
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