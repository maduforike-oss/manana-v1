import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface DesignLayerManagerProps {
  width: number;
  height: number;
  className?: string;
  onLayerReady?: (canvas: HTMLCanvasElement) => void;
}

export const DesignLayerManager: React.FC<DesignLayerManagerProps> = ({
  width,
  height,
  className = "",
  onLayerReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLayerReady, setIsLayerReady] = useState(false);
  const { doc } = useStudioStore();

  // Initialize the persistent design layer canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);

    setIsLayerReady(true);
    onLayerReady?.(canvas);
  }, [width, height, onLayerReady]);

  // Load existing design layer data from store  
  useEffect(() => {
    if (!isLayerReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if there's saved layer data in the store
    const savedLayerData = doc.canvas.designLayerData;
    if (savedLayerData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedLayerData;
    }
  }, [isLayerReady, doc.canvas.designLayerData, width, height]);

  // Save layer data to store using updateCanvas instead of updateNode
  const saveLayerData = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    // Use proper store method to update canvas config
    const { updateCanvas } = useStudioStore.getState();
    updateCanvas({ designLayerData: dataURL });
  }, []);

  // Expose canvas for external painting
  const getCanvas = useCallback(() => canvasRef.current, []);
  const getContext = useCallback(() => canvasRef.current?.getContext('2d') || null, []);

  // Provide methods for external access
  const clearLayer = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      saveLayerData();
    }
  }, [width, height, saveLayerData]);

  return (
    <div className={`absolute inset-0 ${className}`} style={{ width, height }}>
      {/* Persistent design layer canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: 'normal'
        }}
      />
    </div>
  );
};