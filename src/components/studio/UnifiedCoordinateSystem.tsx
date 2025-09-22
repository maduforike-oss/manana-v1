import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { screenToCanvas, canvasToScreen, CoordinateMapper, ViewportState } from '@/lib/studio/coordinateTransform';

interface UnifiedCoordinateContextType {
  mapper: CoordinateMapper | null;
  updateCanvasRect: (rect: DOMRect) => void;
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number };
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number };
  isPointInCanvas: (screenX: number, screenY: number) => boolean;
  getCanvasBounds: () => DOMRect | null;
}

const UnifiedCoordinateContext = createContext<UnifiedCoordinateContextType | null>(null);

export const useUnifiedCoordinates = () => {
  const context = useContext(UnifiedCoordinateContext);
  if (!context) {
    throw new Error('useUnifiedCoordinates must be used within UnifiedCoordinateProvider');
  }
  return context;
};

interface UnifiedCoordinateProviderProps {
  children: React.ReactNode;
}

export const UnifiedCoordinateProvider: React.FC<UnifiedCoordinateProviderProps> = ({ children }) => {
  const { zoom, panOffset } = useStudioStore();
  const [mapper, setMapper] = useState<CoordinateMapper | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Create viewport state from store
  const viewport: ViewportState = {
    zoom,
    panOffset,
    canvasOffset: { x: 0, y: 0 }
  };

  // Update mapper when viewport or canvas rect changes
  useEffect(() => {
    if (canvasRect) {
      if (mapper) {
        mapper.updateViewport(viewport);
        mapper.updateCanvasRect(canvasRect);
      } else {
        setMapper(new CoordinateMapper(viewport, canvasRect));
      }
    }
  }, [zoom, panOffset, canvasRect]);

  const updateCanvasRect = useCallback((rect: DOMRect) => {
    setCanvasRect(rect);
  }, []);

  const screenToCanvasTransform = useCallback((screenX: number, screenY: number) => {
    if (!mapper) return { x: 0, y: 0 };
    return mapper.screenToCanvas(screenX, screenY);
  }, [mapper]);

  const canvasToScreenTransform = useCallback((canvasX: number, canvasY: number) => {
    if (!mapper) return { x: 0, y: 0 };
    return mapper.canvasToScreen(canvasX, canvasY);
  }, [mapper]);

  const isPointInCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRect) return false;
    
    // Use precise boundary detection with sub-pixel accuracy
    return (
      screenX >= canvasRect.left &&
      screenX <= canvasRect.left + canvasRect.width &&
      screenY >= canvasRect.top &&
      screenY <= canvasRect.top + canvasRect.height
    );
  }, [canvasRect]);

  const getCanvasBounds = useCallback(() => {
    if (!mapper) return null;
    return mapper.getCanvasBounds();
  }, [mapper]);

  const value: UnifiedCoordinateContextType = {
    mapper,
    updateCanvasRect,
    screenToCanvas: screenToCanvasTransform,
    canvasToScreen: canvasToScreenTransform,
    isPointInCanvas,
    getCanvasBounds
  };

  return (
    <UnifiedCoordinateContext.Provider value={value}>
      {children}
    </UnifiedCoordinateContext.Provider>
  );
};