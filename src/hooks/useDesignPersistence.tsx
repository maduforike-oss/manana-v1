import { useCallback, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface DesignData {
  id: string;
  garmentSlug: string;
  printMaskUrl: string;
  garmentBaseUrl: string;
  canvasW: number;
  canvasH: number;
  layers: {
    id: string;
    type: "artwork";
    bitmap?: HTMLCanvasElement;
    strokes?: any[];
  }[];
}

export const useDesignPersistence = () => {
  const { doc, saveSnapshot } = useStudioStore();

  // Save design to server
  const saveDesignToServer = useCallback(async (designData: DesignData) => {
    try {
      const response = await fetch('/api/design/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save design');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  }, []);

  // Load design from server
  const loadDesignFromServer = useCallback(async (designId: string) => {
    try {
      const response = await fetch(`/api/design/projects/${designId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load design');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading design:', error);
      throw error;
    }
  }, []);

  // Auto-save to local storage
  useEffect(() => {
    const autoSave = () => {
      try {
        const designData = {
          doc,
          timestamp: Date.now(),
        };
        localStorage.setItem('design-autosave', JSON.stringify(designData));
      } catch (error) {
        console.warn('Failed to auto-save design:', error);
      }
    };

    const interval = setInterval(autoSave, 3000); // Auto-save every 3 seconds
    return () => clearInterval(interval);
  }, [doc]);

  // Load auto-saved design on mount
  const loadAutoSavedDesign = useCallback(() => {
    try {
      const saved = localStorage.getItem('design-autosave');
      if (saved) {
        const { doc: savedDoc } = JSON.parse(saved);
        return savedDoc;
      }
    } catch (error) {
      console.warn('Failed to load auto-saved design:', error);
    }
    return null;
  }, []);

  return {
    saveDesignToServer,
    loadDesignFromServer,
    loadAutoSavedDesign,
  };
};