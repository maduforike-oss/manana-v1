import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudioStore } from '@/lib/studio/store';
import { toast } from 'sonner';

export const useSupabaseDesignPersistence = () => {
  const [saving, setSaving] = useState(false);
  const { doc } = useStudioStore();

  const saveToSupabase = useCallback(async (title?: string) => {
    if (!doc) return null;

    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare design data
      const designData = {
        title: title || doc.title || 'Untitled Design',
        garment_type: doc.canvas.garmentType || 'tshirt',
        garment_slug: doc.canvas.garmentColor || 'white',
        canvas_config: doc.canvas,
        design_data: {
          nodes: doc.nodes,
          selectedIds: doc.selectedIds,
        },
        thumbnail_url: null, // TODO: Generate thumbnail
      };

      // Check if this is an update or new design
      const existingDesignId = localStorage.getItem(`studio-design-id-${doc.id}`);
      
      if (existingDesignId) {
        // Update existing design
        const { data, error } = await supabase
          .from('design_documents')
          .update({
            ...designData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDesignId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Design updated successfully');
        return data;
      } else {
        // Create new design
        const { data, error } = await supabase
          .from('design_documents')
          .insert({
            ...designData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Store the mapping for future updates
        localStorage.setItem(`studio-design-id-${doc.id}`, data.id);
        
        toast.success('Design saved successfully');
        return data;
      }
    } catch (error) {
      console.error('Failed to save design:', error);
      toast.error('Failed to save design');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [doc]);

  const autoSave = useCallback(async () => {
    if (!doc) return;
    
    try {
      // Save to localStorage first (for immediate recovery)
      localStorage.setItem('studio-autosave', JSON.stringify({
        doc,
        timestamp: Date.now(),
      }));

      // Then save to Supabase (for persistence)
      await saveToSupabase();
    } catch (error) {
      // Silent fail for autosave - don't show error toast
      console.warn('Auto-save failed:', error);
    }
  }, [doc, saveToSupabase]);

  return {
    saving,
    saveToSupabase,
    autoSave,
  };
};