import { useState } from 'react';
import { saveDesign, updateDesign } from '@/lib/api/designs';
import type { SaveDesignData } from '@/lib/api/designs';
import { toast } from 'sonner';

export interface SaveOptions {
  showDialog?: boolean;
  title?: string;
  autoSave?: boolean;
}

export const useDesignSave = () => {
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<SaveDesignData | null>(null);

  const saveDesignWithConfirmation = async (
    designData: SaveDesignData, 
    designId?: string,
    options: SaveOptions = {}
  ) => {
    const { showDialog = true, autoSave = false } = options;

    // If auto-save is disabled and no explicit consent, show dialog
    if (!autoSave && showDialog && !options.title) {
      setPendingSaveData(designData);
      setShowSaveDialog(true);
      return null;
    }

    try {
      setSaving(true);
      
      const saveData = {
        ...designData,
        title: options.title || designData.title || 'Untitled Design'
      };

      let result;
      if (designId) {
        result = await updateDesign(designId, saveData);
        toast.success('Design updated successfully');
      } else {
        result = await saveDesign(saveData);
        toast.success('Design saved successfully');
      }

      return result;
    } catch (error) {
      console.error('Failed to save design:', error);
      toast.error('Failed to save design');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = async (title: string) => {
    if (!pendingSaveData) return null;

    try {
      const result = await saveDesignWithConfirmation(
        pendingSaveData,
        undefined,
        { title, showDialog: false }
      );
      
      setShowSaveDialog(false);
      setPendingSaveData(null);
      
      return result;
    } catch (error) {
      // Error already handled in saveDesignWithConfirmation
      return null;
    }
  };

  const cancelSave = () => {
    setShowSaveDialog(false);
    setPendingSaveData(null);
  };

  return {
    saving,
    showSaveDialog,
    saveDesignWithConfirmation,
    confirmSave,
    cancelSave
  };
};