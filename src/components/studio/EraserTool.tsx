import React, { useRef, useEffect, useState } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface EraserToolProps {
  canvasSize: { width: number; height: number };
  zoom: number;
  panOffset: { x: number; y: number };
  size: number;
  onErase?: (strokeId: string) => void;
}

export const EraserTool: React.FC<EraserToolProps> = ({
  canvasSize,
  zoom,
  panOffset,
  size,
  onErase
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const { doc, updateNode, removeNode, getBrushStrokes } = useStudioStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
  }, [canvasSize]);

  const screenToCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panOffset.x) / zoom,
      y: (clientY - rect.top - panOffset.y) / zoom
    };
  };

  const eraseAtPoint = (x: number, y: number) => {
    // Check for brush strokes to erase
    const brushStrokes = getBrushStrokes();
    for (const stroke of brushStrokes) {
      if (stroke.strokeData?.points) {
        const withinStroke = stroke.strokeData.points.some((point: any) => {
          const distance = Math.sqrt(
            Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
          );
          return distance <= size;
        });
        
        if (withinStroke) {
          removeNode(stroke.id);
          onErase?.(stroke.id);
          return;
        }
      }
    }

    // Check for other elements to erase
    const elementsAtPoint = doc.nodes.filter(node => {
      if (node.type === 'brush-stroke') return false;
      
      return (
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
      );
    });

    if (elementsAtPoint.length > 0) {
      const topElement = elementsAtPoint[elementsAtPoint.length - 1];
      removeNode(topElement.id);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsErasing(true);
    const pos = screenToCanvas(e.clientX, e.clientY);
    setLastPos(pos);
    eraseAtPoint(pos.x, pos.y);
    
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isErasing || !lastPos) return;

    const pos = screenToCanvas(e.clientX, e.clientY);
    
    // Interpolate between last position and current position for smooth erasing
    const steps = Math.ceil(
      Math.sqrt(
        Math.pow(pos.x - lastPos.x, 2) + Math.pow(pos.y - lastPos.y, 2)
      ) / (size / 4)
    );

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const interpolatedX = lastPos.x + (pos.x - lastPos.x) * t;
      const interpolatedY = lastPos.y + (pos.y - lastPos.y) * t;
      eraseAtPoint(interpolatedX, interpolatedY);
    }

    setLastPos(pos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsErasing(false);
    setLastPos(null);
    
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: `url("data:image/svg+xml,${encodeURIComponent(`
          <svg width="${size * zoom}" height="${size * zoom}" viewBox="0 0 ${size * zoom} ${size * zoom}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size * zoom / 2}" cy="${size * zoom / 2}" r="${size * zoom / 2 - 1}" fill="none" stroke="red" stroke-width="2"/>
          </svg>
        `)}")") ${size * zoom / 2} ${size * zoom / 2}, crosshair`,
        touchAction: 'none'
      }}
    />
  );
};