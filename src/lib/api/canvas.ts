import { supabase } from '@/integrations/supabase/client';
import type { CanvasConfig } from '@/lib/studio/types';

export interface CanvasConfigResponse {
  canvasConfig: CanvasConfig & {
    printArea?: { x: number; y: number; w: number; h: number };
    safeArea?: { x: number; y: number; w: number; h: number };
    templateUrl?: string | null;
  };
}

export async function getCanvasConfig(garmentType: string): Promise<CanvasConfigResponse> {
  const { data, error } = await supabase.functions.invoke('canvas-config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: null,
  });

  if (error) {
    console.error('Failed to fetch canvas config:', error);
    throw new Error('Failed to fetch canvas configuration');
  }

  // If function invoke doesn't support query params, fall back to direct fetch
  if (!data) {
    const response = await fetch(
      `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1/canvas-config?garmentType=${encodeURIComponent(garmentType)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJ0ZXZnemhraWxva2ZsbnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjE1MjMsImV4cCI6MjA3MjkzNzUyM30.oNvgUt_1PJRHNJ9NJa1T1duGq1rVw8C_6qudq1b1dMg`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch canvas configuration');
    }

    return await response.json();
  }

  return data;
}