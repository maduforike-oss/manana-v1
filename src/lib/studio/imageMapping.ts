import { getTemplate } from './supabaseTemplates';

export type Orientation = "front" | "back" | "left" | "right";

const runtimeOverride = new Map<string,string>();
const supabaseTemplateCache = new Map<string,string>();

export function setRuntimeGarmentImage(garmentId: string, o: Orientation, url: string) {
  runtimeOverride.set(`${garmentId}:${o}`, url);
}

const aliases: Record<string,string> = {
  tshirt: "t-shirt", tee: "t-shirt", longsleeve: "long-sleeve-tee",
  ziphoodie: "zip-hoodie", "snap-back": "snapback", tanktop: "tank"
};
const normalize = (s: string) => aliases[s] ?? s;

const path = (folder: string, id: string, o: Orientation, ext: string = "png") =>
  `/assets/${folder}/${id}-${o}.${ext}`;

// Map orientations to template views
const orientationToView = (o: Orientation) => {
  switch (o) {
    case 'front': return 'front';
    case 'back': return 'back';
    case 'left':
    case 'right': return 'side';
    default: return 'front';
  }
};

export async function getCandidateUrls(garmentId: string, o: Orientation = "front", color: string = "white") {
  const id = normalize(garmentId);
  const rt = runtimeOverride.get(`${id}:${o}`);
  
  // Try to get Supabase template with priority
  let supabaseUrl = supabaseTemplateCache.get(`${id}:${o}:${color}`);
  if (!supabaseUrl) {
    try {
      const template = await getTemplate(id, orientationToView(o) as any, color);
      if (template) {
        supabaseUrl = template.url;
        supabaseTemplateCache.set(`${id}:${o}:${color}`, supabaseUrl);
      }
    } catch (error) {
      console.warn('Failed to fetch Supabase template:', error);
    }
  }
  
  const list = [
    rt,                                // runtime override beats everything
    supabaseUrl,                       // Supabase templates (HIGHEST PRIORITY)
    `/catalog/${id}/${color}/${o}.png`, // new catalog structure
    path("custom", id, o),
    path("garments", id, o),
    path("mockups", id, o),
    `/src/assets/garments/${id}-${color}-${o}.png`, // Try src assets
    `/src/assets/custom/${id}-${o}.png`,            // Try custom assets
  ].filter(Boolean);
  return list;
}

// Helper to get the currently active image for a garment
export function getActiveGarmentImage(garmentId: string, o: Orientation = "front"): string | null {
  const id = normalize(garmentId);
  const rt = runtimeOverride.get(`${id}:${o}`);
  return rt || null;
}

// Helper to clear runtime overrides (useful for testing or reset)
export function clearRuntimeGarmentImage(garmentId: string, o: Orientation) {
  const id = normalize(garmentId);
  runtimeOverride.delete(`${id}:${o}`);
}

// Helper to clear all runtime overrides
export function clearAllRuntimeGarmentImages() {
  runtimeOverride.clear();
}

// Legacy compatibility exports
export async function getGarmentImage(garmentId: string, orientation: Orientation = "front", color: string = "white"): Promise<string | null> {
  const urls = await getCandidateUrls(garmentId, orientation, color);
  return urls[0] || null;
}

export function getAllGarmentImages(garmentId?: string) {
  return {};
}

export const staticImageMap = new Map<string, string>();
export const customImageMap = new Map<string, string>();
export const mockupImageMap = new Map<string, string>();

export function validateImageFileName(fileName: string) {
  return {
    valid: /\.(png|jpg|jpeg|gif|webp)$/i.test(fileName),
    error: !(/\.(png|jpg|jpeg|gif|webp)$/i.test(fileName)) ? 'Invalid file type' : null
  };
}

export function createImageMetadata(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
}

export interface UploadProgress {
  filename: string;
  loaded?: number;
  total?: number;
  percentage?: number;
  status: string;
  error?: any;
  progress: number;
}

export function mergeImagesWithGarment(garment: any) {
  return garment;
}

export function mergeImagesWithGarments(garments: any[]) {
  return garments;
}