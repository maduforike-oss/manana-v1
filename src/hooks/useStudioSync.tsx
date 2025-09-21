import { useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { useAppStore } from '@/store/useAppStore';

/**
 * Hook to sync studio changes back to app store
 * This ensures that design changes are preserved when navigating away from studio
 * Includes brush strokes and all design elements
 */
export const useStudioSync = () => {
  const { doc, zoom, panOffset, mockup, getBrushStrokes } = useStudioStore();
  const { currentDesign, saveDesign } = useAppStore();

  useEffect(() => {
    if (!currentDesign) return;

    // Debounce save to prevent excessive writes
    const timeoutId = setTimeout(() => {
      try {
        const canvasData = {
          doc: {
            ...doc,
            // Ensure brush strokes are included in the doc
            nodes: [...doc.nodes] // All nodes including brush strokes
          },
          zoom,
          panOffset,
          mockup,
        };

        saveDesign({
          id: currentDesign.id,
          canvas: JSON.stringify(canvasData),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.warn('Failed to sync studio changes to app store:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [doc, zoom, panOffset, mockup, currentDesign, saveDesign, getBrushStrokes]);
};