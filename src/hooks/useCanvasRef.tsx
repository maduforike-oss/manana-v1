import { useState, useCallback } from 'react';

let globalCanvasRef: HTMLCanvasElement | null = null;

export const useCanvasRef = () => {
  const [canvasRef, setCanvasRefState] = useState<HTMLCanvasElement | null>(globalCanvasRef);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    globalCanvasRef = canvas;
    setCanvasRefState(canvas);
  }, []);

  const getCanvas = useCallback(() => {
    return globalCanvasRef;
  }, []);

  return {
    canvasRef,
    setCanvasRef,
    getCanvas
  };
};