"use client";

import { useRef, useEffect, useState } from 'react';
import { useStudioStore } from '../../lib/studio/store';

export const CanvasStage = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const { doc, zoom, panOffset, clearSelection } = useStudioStore();

  // Update canvas size on window resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-studio-background">
      {/* Canvas Container */}
      <div 
        ref={canvasRef}
        className="w-full h-full relative cursor-crosshair"
        onClick={handleCanvasClick}
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Grid Background */}
        {doc.canvas.showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${doc.canvas.gridSize}px ${doc.canvas.gridSize}px`
            }}
          />
        )}

        {/* Canvas Area */}
        <div 
          className="absolute border-2 border-primary/30 bg-white shadow-2xl"
          style={{
            width: doc.canvas.width,
            height: doc.canvas.height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: doc.canvas.background === 'transparent' ? 'transparent' : doc.canvas.background
          }}
        >
          {/* Canvas Content - Professional Loading State */}
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground/80 font-medium">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm tracking-wide">Canvas Ready</span>
            </div>
            <div className="text-xs text-foreground/60 font-mono">
              {doc.canvas.width} × {doc.canvas.height}px
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="bg-card/95 border border-border/50 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
          <span className="text-xs font-medium text-foreground">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};