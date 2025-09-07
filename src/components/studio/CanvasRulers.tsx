import React from 'react';

interface CanvasRulersProps {
  zoom: number;
  panOffset: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
  showRulers?: boolean;
}

export const CanvasRulers = ({ zoom, panOffset, canvasWidth, canvasHeight, showRulers = true }: CanvasRulersProps) => {
  if (!showRulers) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-5 right-0 h-5 bg-card border-b border-border/50 text-xs">
        Horizontal Ruler
      </div>
      <div className="absolute top-5 left-0 bottom-0 w-5 bg-card border-r border-border/50 text-xs">
        V
      </div>
    </div>
  );
};