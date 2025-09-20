import { supabase } from '@/integrations/supabase/client';

export async function populateTemplatesFromStorage(): Promise<{
  success: boolean;
  processed: number;
  skipped: number;
  inserted: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('populate-templates', {
      method: 'POST',
    });

    if (error) {
      console.error('Failed to populate templates:', error);
      throw new Error('Failed to populate templates');
    }

    return data;
  } catch (error) {
    console.error('Error populating templates:', error);
    return {
      success: false,
      processed: 0,
      skipped: 0,
      inserted: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}