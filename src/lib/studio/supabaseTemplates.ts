import { supabase } from '@/integrations/supabase/client';

export interface SupabaseTemplate {
  name: string;
  url: string;
  garmentType: string;
  view: 'front' | 'back' | 'side' | '45degree';
  color: string;
  metadata?: any;
}

// Map Supabase template names to garment types
const TEMPLATE_MAPPING: Record<string, { garmentType: string; view: string; color: string }> = {
  'White Short-sleeve crewneck T-shirt front.png': { garmentType: 't-shirt', view: 'front', color: 'white' },
  'cropped short-sleeve crewneck T-shirt front.png': { garmentType: 't-shirt', view: 'front', color: 'white' },
  'Cropped short-sleeve crewneck T-shirt, back.png': { garmentType: 't-shirt', view: 'back', color: 'white' },
  'White Long-Sleeve T-Shirt Front_.png': { garmentType: 'long-sleeve-tee', view: 'front', color: 'white' },
  'White Long-Sleeve T-Shirt Back.png': { garmentType: 'long-sleeve-tee', view: 'back', color: 'white' },
  'White Hoodie Front_.png': { garmentType: 'hoodie', view: 'front', color: 'white' },
  'White Hoodie Back.png': { garmentType: 'hoodie', view: 'back', color: 'white' },
  'White Hoodie 45 degree Right.png': { garmentType: 'hoodie', view: '45degree', color: 'white' },
  'White Polo-Shirt Front_.png': { garmentType: 'polo', view: 'front', color: 'white' },
  'White Polo-Shirt Back.png': { garmentType: 'polo', view: 'back', color: 'white' },
  'White Baseball Cap Front _.png': { garmentType: 'cap', view: 'front', color: 'white' },
  'White Baseball Cap Back_.png': { garmentType: 'cap', view: 'back', color: 'white' },
  'White Baseball Cap Side.png': { garmentType: 'cap', view: 'side', color: 'white' },
  'White Beanie_.png': { garmentType: 'beanie', view: 'front', color: 'white' },
  'White Bucket Hat Front.png': { garmentType: 'bucket-hat', view: 'front', color: 'white' },
  'White Cargo Pants Front.png': { garmentType: 'cargo-pants', view: 'front', color: 'white' },
  'White Cargo Pants Back.png': { garmentType: 'cargo-pants', view: 'back', color: 'white' },
  'White Joggers Front.png': { garmentType: 'joggers', view: 'front', color: 'white' },
  'White Joggers Back.png': { garmentType: 'joggers', view: 'back', color: 'white' },
  'White Mini-Skirt_.png': { garmentType: 'mini-skirt', view: 'front', color: 'white' },
};

// Template cache
class TemplateCache {
  private cache = new Map<string, SupabaseTemplate[]>();
  private lastFetch = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  isCacheValid(key: string): boolean {
    const lastFetch = this.lastFetch.get(key);
    return lastFetch ? Date.now() - lastFetch < this.CACHE_TTL : false;
  }

  get(key: string): SupabaseTemplate[] | null {
    return this.isCacheValid(key) ? this.cache.get(key) || null : null;
  }

  set(key: string, data: SupabaseTemplate[]): void {
    this.cache.set(key, data);
    this.lastFetch.set(key, Date.now());
  }

  clear(): void {
    this.cache.clear();
    this.lastFetch.clear();
  }
}

const templateCache = new TemplateCache();

/**
 * Fetch all available templates from Supabase storage
 */
export async function fetchSupabaseTemplates(): Promise<SupabaseTemplate[]> {
  const cacheKey = 'all-templates';
  const cached = templateCache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data: files, error } = await supabase.storage
      .from('design-templates')
      .list('', { limit: 100 });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    const templates: SupabaseTemplate[] = [];

    for (const file of files || []) {
      const mapping = TEMPLATE_MAPPING[file.name];
      if (mapping) {
        const { data: urlData } = supabase.storage
          .from('design-templates')
          .getPublicUrl(file.name);

        templates.push({
          name: file.name,
          url: urlData.publicUrl,
          garmentType: mapping.garmentType,
          view: mapping.view as any,
          color: mapping.color,
          metadata: file.metadata
        });
      }
    }

    templateCache.set(cacheKey, templates);
    return templates;
  } catch (error) {
    console.error('Error in fetchSupabaseTemplates:', error);
    return [];
  }
}

/**
 * Get templates for a specific garment type
 */
export async function getTemplatesForGarment(garmentType: string): Promise<SupabaseTemplate[]> {
  const allTemplates = await fetchSupabaseTemplates();
  return allTemplates.filter(template => template.garmentType === garmentType);
}

/**
 * Get a specific template by garment type, view, and color
 */
export async function getTemplate(
  garmentType: string, 
  view: 'front' | 'back' | 'side' | '45degree' = 'front', 
  color: string = 'white'
): Promise<SupabaseTemplate | null> {
  const templates = await getTemplatesForGarment(garmentType);
  return templates.find(t => t.view === view && t.color === color) || null;
}

/**
 * Get all available garment types from templates
 */
export async function getAvailableGarmentTypes(): Promise<string[]> {
  const allTemplates = await fetchSupabaseTemplates();
  const types = new Set(allTemplates.map(t => t.garmentType));
  return Array.from(types).sort();
}

/**
 * Get available views for a garment type
 */
export async function getAvailableViews(garmentType: string): Promise<string[]> {
  const templates = await getTemplatesForGarment(garmentType);
  const views = new Set(templates.map(t => t.view));
  return Array.from(views).sort();
}

/**
 * Clear template cache (useful for development)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}