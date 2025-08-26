import { useState, useCallback } from 'react';

interface ViewportState {
  showBoundingBox: boolean;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

const defaultState: ViewportState = {
  showBoundingBox: false,
  showGrid: true,
  showRulers: false,
  snapToGrid: true,
  gridSize: 1
};

export const useViewportState = (initialState?: Partial<ViewportState>) => {
  const [state, setState] = useState<ViewportState>({
    ...defaultState,
    ...initialState
  });

  const toggleBoundingBox = useCallback(() => {
    setState(prev => ({ ...prev, showBoundingBox: !prev.showBoundingBox }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleRulers = useCallback(() => {
    setState(prev => ({ ...prev, showRulers: !prev.showRulers }));
  }, []);

  const toggleSnap = useCallback(() => {
    setState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const setGridSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, gridSize: size }));
  }, []);

  const resetViewport = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    toggleBoundingBox,
    toggleGrid,
    toggleRulers,
    toggleSnap,
    setGridSize,
    resetViewport
  };
};