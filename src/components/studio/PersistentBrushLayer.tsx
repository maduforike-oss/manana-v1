import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { AdvancedDrawingCanvas } from './AdvancedDrawingCanvas';
import { DesignLayerManager } from './DesignLayerManager';

interface PersistentBrushLayerProps {
  width: number;
  height: number;
  activeTool: 'brush' | 'eraser' | 'select' | 'hand' | 'text' | 'image' | 'rect' | 'circle' | 'line' | 'triangle' | 'star';
  brushSettings: any;
  className?: string;
}

export const PersistentBrushLayer: React.FC<PersistentBrushLayerProps> = ({
  width,
  height,
  activeTool,
  brushSettings,
  className = ""
}) => {
  const [designLayerCanvas, setDesignLayerCanvas] = useState<HTMLCanvasElement | null>(null);
  const isDrawingTool = activeTool === 'brush' || activeTool === 'eraser';

  return (
    <div className={`absolute inset-0 ${className}`} style={{ width, height }}>
      {/* Persistent Design Layer */}
      <DesignLayerManager
        width={width}
        height={height}
        className="absolute inset-0 z-5"
        onLayerReady={setDesignLayerCanvas}
      />

      {/* Drawing Interface - only when using drawing tools */}
      {isDrawingTool && (
        <AdvancedDrawingCanvas
          width={width}
          height={height}
          brushSettings={brushSettings}
          activeTool={activeTool}
          designLayerCanvas={designLayerCanvas}
          className="absolute inset-0 z-10"
        />
      )}
    </div>
  );
};