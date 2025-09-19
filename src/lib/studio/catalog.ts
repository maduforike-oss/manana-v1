export type ViewName = "front" | "back" | "left" | "right";

export interface PrintArea {
  unit: "mm";
  safe: { x: number; y: number }[];  // polygon
  mmToPx: number;                     // scale for the chosen size (simple MVP)
}

export interface GarmentColor {
  name: string;
  hex: string;
  views: Record<ViewName, { mockup: string }>;
  printArea: PrintArea;
}

export interface Garment {
  slug: string;
  name: string;
  colors: GarmentColor[];
  sizes: string[];
}

export interface Catalog {
  dpi: number;
  garments: Garment[];
}

// Dynamic data source: Generate catalog from Supabase templates
export async function getCatalog(): Promise<Catalog> {
  try {
    // Import Supabase functions
    const { fetchSupabaseTemplates } = await import('./supabaseTemplates');
    const templates = await fetchSupabaseTemplates();
    
    // Group templates by garment type
    const garmentGroups = new Map<string, any[]>();
    
    templates.forEach(template => {
      if (!garmentGroups.has(template.garmentType)) {
        garmentGroups.set(template.garmentType, []);
      }
      garmentGroups.get(template.garmentType)?.push(template);
    });
    
    // Build garments array
    const garments: Garment[] = Array.from(garmentGroups.entries()).map(([type, typeTemplates]) => {
      // Create views mapping for this garment type
      const views: Partial<Record<ViewName, { mockup: string }>> = {};
      
      typeTemplates.forEach(template => {
        const viewName = mapTemplateViewToViewName(template.view);
        if (viewName) {
          views[viewName] = { mockup: template.url };
        }
      });
      
      // Ensure all required views exist with fallbacks
      const completeViews: Record<ViewName, { mockup: string }> = {
        front: views.front || { mockup: typeTemplates[0]?.url || '' },
        back: views.back || views.front || { mockup: typeTemplates[0]?.url || '' },
        left: views.left || views.front || { mockup: typeTemplates[0]?.url || '' },
        right: views.right || views.left || views.front || { mockup: typeTemplates[0]?.url || '' }
      };
      
      return {
        slug: type,
        name: formatGarmentName(type),
        colors: [{
          name: 'White',
          hex: '#ffffff',
          views: completeViews,
          printArea: {
            unit: "mm" as const,
            safe: [
              { x: 100, y: 100 }, 
              { x: 200, y: 100 }, 
              { x: 200, y: 200 }, 
              { x: 100, y: 200 }
            ],
            mmToPx: 3.78 // 300 DPI conversion
          }
        }],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      };
    });
    
    return {
      dpi: 300,
      garments: garments.sort((a, b) => a.name.localeCompare(b.name))
    };
  } catch (error) {
    console.error('Failed to load Supabase catalog, falling back to static:', error);
    // Fallback to static catalog
    const res = await fetch("/catalog/manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load catalog");
    return res.json();
  }
}

// Helper to map template view names to ViewName type
function mapTemplateViewToViewName(templateView: string): ViewName | null {
  switch (templateView) {
    case 'front': return 'front';
    case 'back': return 'back';
    case 'side': return 'left'; // Map side to left for consistency
    default: return null;
  }
}

// Helper to format garment type names for display
function formatGarmentName(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getGarment(slug: string): Promise<Garment | undefined> {
  const cat = await getCatalog();
  return cat.garments.find(g => g.slug === slug);
}

// Utility functions for backward compatibility
export async function getCatalogGarmentColor(slug: string, colorName: string): Promise<GarmentColor | undefined> {
  const garment = await getGarment(slug);
  return garment?.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
}

export async function getCatalogImageUrl(slug: string, color: string, view: ViewName): Promise<string | null> {
  const garmentColor = await getCatalogGarmentColor(slug, color);
  return garmentColor?.views[view]?.mockup || null;
}

export async function getPrintArea(slug: string, color: string): Promise<PrintArea | null> {
  const garmentColor = await getCatalogGarmentColor(slug, color);
  return garmentColor?.printArea || null;
}