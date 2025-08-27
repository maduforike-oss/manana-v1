import React from 'react';

interface CanvasGridProps {
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
}

export const CanvasGrid = ({ zoom, panOffset, showGrid, gridSize }: CanvasGridProps) => {
  if (!showGrid) return null;

  const adjustedGridSize = gridSize * zoom;
  const offsetX = panOffset.x % adjustedGridSize;
  const offsetY = panOffset.y % adjustedGridSize;

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${adjustedGridSize}px ${adjustedGridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity: Math.min(0.6, zoom * 0.4)
      }}
    />
  );
};