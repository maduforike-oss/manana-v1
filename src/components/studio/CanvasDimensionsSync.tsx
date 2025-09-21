import { useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface CanvasDimensionsSyncProps {
  width: number;
  height: number;
  garmentType?: string;
}

/**
 * Component to sync canvas dimensions with the drawing system
 * Ensures proper coordinate mapping between Konva stage and drawing canvas
 */
export const CanvasDimensionsSync: React.FC<CanvasDimensionsSyncProps> = ({
  width,
  height,
  garmentType
}) => {
  const { updateCanvas, doc } = useStudioStore();

  useEffect(() => {
    // Sync canvas dimensions
    updateCanvas({
      width,
      height,
      garmentType: garmentType || doc.canvas.garmentType
    });
  }, [width, height, garmentType, updateCanvas, doc.canvas.garmentType]);

  return null; // This is a logic-only component
};