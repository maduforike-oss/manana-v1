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
  // T-Shirts
  'White Short-sleeve crewneck T-shirt front.png': { garmentType: 't-shirt', view: 'front', color: 'white' },
  'cropped short-sleeve crewneck T-shirt front.png': { garmentType: 't-shirt', view: 'front', color: 'white' },
  'Cropped short-sleeve crewneck T-shirt, back.png': { garmentType: 't-shirt', view: 'back', color: 'white' },
  'White Short-Sleeve T-Shirt Back_.png': { garmentType: 't-shirt', view: 'back', color: 'white' },
  
  // Long Sleeve Tees
  'White Long-Sleeve T-Shirt Front_.png': { garmentType: 'long-sleeve-tee', view: 'front', color: 'white' },
  'White Long-Sleeve T-Shirt Back.png': { garmentType: 'long-sleeve-tee', view: 'back', color: 'white' },
  
  // Hoodies
  'White Hoodie Front_.png': { garmentType: 'hoodie', view: 'front', color: 'white' },
  'White Hoodie Back.png': { garmentType: 'hoodie', view: 'back', color: 'white' },
  'White Hoodie 45 degree Right.png': { garmentType: 'hoodie', view: 'side', color: 'white' },
  
  // Zip Hoodies
  'White Zip-Up Hoodie Front_.png': { garmentType: 'zip-hoodie', view: 'front', color: 'white' },
  'White Zip-up Hoodie Back.png': { garmentType: 'zip-hoodie', view: 'back', color: 'white' },
  
  // Polo Shirts
  'White Polo-Shirt Front_.png': { garmentType: 'polo', view: 'front', color: 'white' },
  'White Polo-Shirt Back.png': { garmentType: 'polo', view: 'back', color: 'white' },
  
  // Tank Tops
  'White Tank-Top Front_.png': { garmentType: 'tank-top', view: 'front', color: 'white' },
  'White Tank-Top Back.png': { garmentType: 'tank-top', view: 'back', color: 'white' },
  
  // Sweatshirts
  'White Sweatshirt Front.png': { garmentType: 'sweatshirt', view: 'front', color: 'white' },
  'White Sweatshirt back.png': { garmentType: 'sweatshirt', view: 'back', color: 'white' },
  
  // Caps and Hats
  'White Baseball Cap Front _.png': { garmentType: 'cap', view: 'front', color: 'white' },
  'White Baseball Cap Back_.png': { garmentType: 'cap', view: 'back', color: 'white' },
  'White Baseball Cap Side.png': { garmentType: 'cap', view: 'side', color: 'white' },
  'White Beanie_.png': { garmentType: 'beanie', view: 'front', color: 'white' },
  'White Bucket Hat Front.png': { garmentType: 'bucket-hat', view: 'front', color: 'white' },
  
  // Pants and Bottoms
  'White Cargo Pants Front.png': { garmentType: 'cargo-pants', view: 'front', color: 'white' },
  'White Cargo Pants Back.png': { garmentType: 'cargo-pants', view: 'back', color: 'white' },
  'White Joggers Front.png': { garmentType: 'joggers', view: 'front', color: 'white' },
  'White Joggers Back.png': { garmentType: 'joggers', view: 'back', color: 'white' },
  'White Sweat Shorts front.png': { garmentType: 'sweat-shorts', view: 'front', color: 'white' },
  'White Sweat Shorts Back.png': { garmentType: 'sweat-shorts', view: 'back', color: 'white' },
  
  // Skirts and Dresses
  'White Mini-Skirt_.png': { garmentType: 'mini-skirt', view: 'front', color: 'white' },
  'White Tennis Skirt Front.png': { garmentType: 'tennis-skirt', view: 'front', color: 'white' },
  'White Slip Dress Front.png': { garmentType: 'slip-dress', view: 'front', color: 'white' },
  'White Slip Dress Back_.png': { garmentType: 'slip-dress', view: 'back', color: 'white' },
  'White Summer Dress front_.png': { garmentType: 'summer-dress', view: 'front', color: 'white' },
  'White Summer Dress Back_.png': { garmentType: 'summer-dress', view: 'back', color: 'white' },
  
  // Jackets
  'White Track Jacket Front.png': { garmentType: 'track-jacket', view: 'front', color: 'white' },
  'White Track jacket Back.png': { garmentType: 'track-jacket', view: 'back', color: 'white' },
  'White Windbreaker Jacket Front_.png': { garmentType: 'windbreaker', view: 'front', color: 'white' },
  'White Windbreaker Back.png': { garmentType: 'windbreaker', view: 'back', color: 'white' },
  
  // Accessories
  'White Tote Bag Front_.png': { garmentType: 'tote-bag', view: 'front', color: 'white' },
  'White Tote bag Back_.png': { garmentType: 'tote-bag', view: 'back', color: 'white' },
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