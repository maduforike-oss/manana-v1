import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface Coordinates {
  screen: { x: number; y: number };
  canvas: { x: number; y: number };
  world: { x: number; y: number };
}

interface CoordinateManagerContextType {
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number };
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number };
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  getCanvasBounds: () => DOMRect | null;
  registerCanvas: (element: HTMLCanvasElement | HTMLElement) => void;
  unregisterCanvas: () => void;
}

const CoordinateManagerContext = createContext<CoordinateManagerContextType | null>(null);

export const useCoordinateManager = () => {
  const context = useContext(CoordinateManagerContext);
  if (!context) {
    throw new Error('useCoordinateManager must be used within a CoordinateManagerProvider');
  }
  return context;
};

interface CoordinateManagerProviderProps {
  children: React.ReactNode;
}

export const CoordinateManagerProvider: React.FC<CoordinateManagerProviderProps> = ({ children }) => {
  const { zoom, panOffset } = useStudioStore();
  const canvasElementRef = useRef<HTMLCanvasElement | HTMLElement | null>(null);

  // Register the canvas element for coordinate calculations
  const registerCanvas = useCallback((element: HTMLCanvasElement | HTMLElement) => {
    canvasElementRef.current = element;
  }, []);

  const unregisterCanvas = useCallback(() => {
    canvasElementRef.current = null;
  }, []);

  // Get current canvas bounds
  const getCanvasBounds = useCallback((): DOMRect | null => {
    if (!canvasElementRef.current) return null;
    return canvasElementRef.current.getBoundingClientRect();
  }, []);

  // Convert screen coordinates to canvas coordinates (accounting for canvas position)
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const bounds = getCanvasBounds();
    if (!bounds) return { x: screenX, y: screenY };

    return {
      x: screenX - bounds.left,
      y: screenY - bounds.top
    };
  }, [getCanvasBounds]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    const bounds = getCanvasBounds();
    if (!bounds) return { x: canvasX, y: canvasY };

    return {
      x: canvasX + bounds.left,
      y: canvasY + bounds.top
    };
  }, [getCanvasBounds]);

  // Convert screen coordinates to world coordinates (accounting for zoom and pan)
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvasCoords = screenToCanvas(screenX, screenY);
    
    return {
      x: (canvasCoords.x - panOffset.x) / zoom,
      y: (canvasCoords.y - panOffset.y) / zoom
    };
  }, [screenToCanvas, zoom, panOffset]);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    const canvasX = worldX * zoom + panOffset.x;
    const canvasY = worldY * zoom + panOffset.y;
    
    return canvasToScreen(canvasX, canvasY);
  }, [canvasToScreen, zoom, panOffset]);

  const contextValue: CoordinateManagerContextType = {
    screenToCanvas,
    canvasToScreen,
    screenToWorld,
    worldToScreen,
    getCanvasBounds,
    registerCanvas,
    unregisterCanvas
  };

  return (
    <CoordinateManagerContext.Provider value={contextValue}>
      {children}
    </CoordinateManagerContext.Provider>
  );
};

// Hook for easier coordinate transformations
export const useCoordinateTransform = () => {
  const manager = useCoordinateManager();
  
  return {
    // Transform a pointer event to different coordinate systems
    transformPointerEvent: (e: PointerEvent | React.PointerEvent) => {
      const screen = { x: e.clientX, y: e.clientY };
      const canvas = manager.screenToCanvas(e.clientX, e.clientY);
      const world = manager.screenToWorld(e.clientX, e.clientY);
      
      return { screen, canvas, world };
    },
    
    // Transform a mouse event to different coordinate systems
    transformMouseEvent: (e: MouseEvent | React.MouseEvent) => {
      const screen = { x: e.clientX, y: e.clientY };
      const canvas = manager.screenToCanvas(e.clientX, e.clientY);
      const world = manager.screenToWorld(e.clientX, e.clientY);
      
      return { screen, canvas, world };
    },
    
    ...manager
  };
};