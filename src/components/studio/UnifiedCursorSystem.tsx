import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { useUnifiedCoordinates } from './UnifiedCoordinateSystem';
import { cn } from '@/lib/utils';

interface CursorState {
  isVisible: boolean;
  position: { x: number; y: number };
  size: number;
  color: string;
  tool: string;
  isDrawing: boolean;
  inputType: 'mouse' | 'pen' | 'touch';
}

interface UnifiedCursorContextType {
  cursorState: CursorState;
  showCursor: () => void;
  hideCursor: () => void;
  updateCursorPosition: (clientX: number, clientY: number) => void;
  updateCursorSettings: (updates: Partial<CursorState>) => void;
  setDrawingState: (isDrawing: boolean) => void;
  setInputType: (type: 'mouse' | 'pen' | 'touch') => void;
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
  const { isPointInCanvas } = useUnifiedCoordinates();
  const [cursorState, setCursorState] = useState<CursorState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    size: 20,
    color: '#000000',
    tool: activeTool,
    isDrawing: false,
    inputType: 'mouse'
  });

  // Update tool when store changes
  useEffect(() => {
    setCursorState(prev => ({ ...prev, tool: activeTool }));
  }, [activeTool]);

  const showCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hideCursor = useCallback(() => {
    setCursorState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const updateCursorPosition = useCallback((clientX: number, clientY: number) => {
    // Check if cursor should be visible based on canvas bounds
    const shouldShow = isPointInCanvas(clientX, clientY) && ['brush', 'eraser'].includes(cursorState.tool);
    
    setCursorState(prev => ({
      ...prev,
      position: { x: clientX, y: clientY },
      isVisible: shouldShow
    }));
  }, [isPointInCanvas, cursorState.tool]);

  const updateCursorSettings = useCallback((updates: Partial<CursorState>) => {
    setCursorState(prev => ({ ...prev, ...updates }));
  }, []);

  const setDrawingState = useCallback((isDrawing: boolean) => {
    setCursorState(prev => ({ ...prev, isDrawing }));
  }, []);

  const setInputType = useCallback((type: 'mouse' | 'pen' | 'touch') => {
    setCursorState(prev => ({ ...prev, inputType: type }));
  }, []);

  const value: UnifiedCursorContextType = {
    cursorState,
    showCursor,
    hideCursor,
    updateCursorPosition,
    updateCursorSettings,
    setDrawingState,
    setInputType
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

  // Only show custom cursor for brush/eraser tools when visible
  if (!cursorState.isVisible || !['brush', 'eraser'].includes(cursorState.tool)) {
    return null;
  }

  // Scale cursor size appropriately for display
  const displaySize = Math.max(8, Math.min(40, cursorState.size));
  
  // Position cursor precisely at pointer location
  const cursorStyle = {
    left: cursorState.position.x - displaySize / 2,
    top: cursorState.position.y - displaySize / 2,
    width: displaySize,
    height: displaySize,
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