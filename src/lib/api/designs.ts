import { supabase } from '@/integrations/supabase/client';
import type { DesignDoc } from '@/lib/studio/types';

export interface DesignDocument {
  id: string;
  user_id?: string;
  title: string;
  garment_type: string;
  garment_slug?: string;
  canvas_config: any;
  design_data: DesignDoc;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SaveDesignData {
  title?: string;
  garment_type?: string;
  garment_slug?: string;
  canvas_config?: any;
  design_data?: DesignDoc;
  thumbnail_url?: string;
}

export async function saveDesign(designData: SaveDesignData): Promise<DesignDocument> {
  const response = await fetch(
    `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/design-persistence`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(designData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save design');
  }

  const result = await response.json();
  return result.design;
}

export async function updateDesign(id: string, designData: SaveDesignData): Promise<DesignDocument> {
  const response = await fetch(
    `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/design-persistence/${id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(designData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update design');
  }

  const result = await response.json();
  return result.design;
}

export async function loadDesign(id: string): Promise<DesignDocument> {
  const response = await fetch(
    `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/design-persistence/${id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load design');
  }

  const result = await response.json();
  return result.design;
}

export async function deleteDesign(id: string): Promise<void> {
  const response = await fetch(
    `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/design-persistence/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete design');
  }
}

export async function listDesigns(): Promise<DesignDocument[]> {
  const response = await fetch(
    `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/design-persistence`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list designs');
  }

  const result = await response.json();
  return result.designs;
}