import { supabase } from "@/integrations/supabase/client";

export interface GarmentView {
  url: string;
  width_px: number;
  height_px: number;
  dpi: number;
  print_area: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  safe_area: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  color: string;
  storage_path: string;
}

export interface GarmentDetail {
  slug: string;
  name: string;
  category: string;
  views: Record<string, GarmentView>;
  colors: string[];
  default_color: string;
  template_count: number;
}

export interface GarmentSummary {
  slug: string;
  name: string;
  category: string;
  template_count: number;
  preview_url: string | null;
  created_at: string;
}

export interface GarmentsListResponse {
  garments: GarmentSummary[];
  error?: string;
}

export interface GarmentDetailResponse {
  garment: GarmentDetail;
  error?: string;
}

// Get all available garments
export async function getGarments(): Promise<GarmentSummary[]> {
  try {
    const { data, error } = await supabase.functions.invoke('garment-selection', {
      method: 'GET'
    });

    if (error) {
      console.error('Error fetching garments:', error);
      return [];
    }

    const response = data as GarmentsListResponse;
    if (response.error) {
      console.error('API error:', response.error);
      return [];
    }

    return response.garments || [];
  } catch (error) {
    console.error('Error in getGarments:', error);
    return [];
  }
}

// Get detailed information for a specific garment
export async function getGarmentDetail(slug: string): Promise<GarmentDetail | null> {
  try {
    const { data, error } = await supabase.functions.invoke(`garment-selection/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error(`Error fetching garment ${slug}:`, error);
      return null;
    }

    const response = data as GarmentDetailResponse;
    if (response.error) {
      console.error('API error:', response.error);
      return null;
    }

    return response.garment || null;
  } catch (error) {
    console.error(`Error in getGarmentDetail for ${slug}:`, error);
    return null;
  }
}

// Get specific garment view (front, back, etc.)
export async function getGarmentView(slug: string, view: string = 'front', color: string = 'white'): Promise<GarmentView | null> {
  try {
    const garment = await getGarmentDetail(slug);
    if (!garment) return null;

    // Try to find exact match
    let targetView = garment.views[view];
    
    // If not found, try fallbacks
    if (!targetView) {
      // Try front view as fallback
      targetView = garment.views['front'];
    }
    
    // If still not found, get any available view
    if (!targetView) {
      const availableViews = Object.values(garment.views);
      targetView = availableViews[0];
    }

    return targetView || null;
  } catch (error) {
    console.error(`Error getting garment view ${slug}/${view}:`, error);
    return null;
  }
}

// Check if a garment exists
export async function garmentExists(slug: string): Promise<boolean> {
  try {
    const garment = await getGarmentDetail(slug);
    return garment !== null;
  } catch {
    return false;
  }
}

// Get available views for a garment
export async function getAvailableViews(slug: string): Promise<string[]> {
  try {
    const garment = await getGarmentDetail(slug);
    return garment ? Object.keys(garment.views) : [];
  } catch {
    return [];
  }
}

// Get available colors for a garment
export async function getAvailableColors(slug: string): Promise<string[]> {
  try {
    const garment = await getGarmentDetail(slug);
    return garment ? garment.colors : [];
  } catch {
    return [];
  }
}