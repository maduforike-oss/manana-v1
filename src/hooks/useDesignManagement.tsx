import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DesignDocument {
  id: string;
  user_id?: string;
  title: string;
  garment_type: string;
  garment_slug?: string;
  canvas_config: any;
  design_data: any;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export const useDesignManagement = () => {
  const [designs, setDesigns] = useState<DesignDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const listDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('design_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setDesigns(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to load designs:', error);
      toast.error('Failed to load designs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDesign = useCallback(async (designId: string) => {
    try {
      const { error } = await supabase
        .from('design_documents')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      toast.success('Design deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast.error('Failed to delete design');
      return false;
    }
  }, []);

  const loadDesign = useCallback(async (designId: string) => {
    try {
      const { data, error } = await supabase
        .from('design_documents')
        .select('*')
        .eq('id', designId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to load design:', error);
      toast.error('Failed to load design');
      return null;
    }
  }, []);

  return {
    designs,
    loading,
    listDesigns,
    deleteDesign,
    loadDesign,
  };
};