export type Orientation = "front" | "back" | "side";

const runtimeOverride = new Map<string,string>();
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

export function getCandidateUrls(garmentId: string, o: Orientation = "front") {
  const id = normalize(garmentId);
  const rt = runtimeOverride.get(`${id}:${o}`);
  const list = [
    rt ?? path("custom", id, o),      // runtime override beats everything
    path("garments", id, o),
    path("mockups", id, o),
  ];
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
export function getGarmentImage(garmentId: string, orientation: Orientation = "front"): string | null {
  const urls = getCandidateUrls(garmentId, orientation);
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