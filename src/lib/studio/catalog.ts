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

// Swappable data source. Today: static file. Later: Supabase.
export async function getCatalog(): Promise<Catalog> {
  const res = await fetch("/catalog/manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load catalog");
  return res.json();
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