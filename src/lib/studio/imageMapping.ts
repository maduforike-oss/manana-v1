// Dynamic Apparel Image Mapping System
// Auto-maps bundled uploads to garment types using filename conventions

import { GarmentType } from './garments';

// Image mapping interface
export interface ImageMap {
  [garmentId: string]: {
    front?: string;
    back?: string;
    side?: string;
  };
}

// Load static garment images (fallbacks)
const staticGarmentImages = import.meta.glob('@/assets/garments/*.{png,jpg,jpeg}', { 
  eager: true, 
  as: 'url' 
});

// Load custom uploaded images (overrides)
const customGarmentImages = import.meta.glob('@/assets/custom/*.{png,jpg,jpeg}', { 
  eager: true, 
  as: 'url' 
});

// Load canvas mockup images for studio
const mockupImages = import.meta.glob('@/assets/mockups/*.{png,jpg,jpeg}', { 
  eager: true, 
  as: 'url' 
});

// Build image maps from glob imports
function buildImageMap(files: Record<string, string>): ImageMap {
  const imageMap: ImageMap = {};
  
  for (const [path, url] of Object.entries(files)) {
    const filename = path.split('/').pop()?.toLowerCase() || '';
    
    // Parse filename: garment-id-orientation-color.ext or garment-id-orientation.ext
    const parts = filename.split('.');
    const nameWithoutExt = parts[0];
    const segments = nameWithoutExt.split('-');
    
    if (segments.length >= 2) {
      // Extract garment ID and orientation
      let garmentId: string;
      let orientation: string;
      
      if (segments.length === 2) {
        // Format: garment-orientation (e.g., tshirt-front)
        [garmentId, orientation] = segments;
      } else if (segments.length >= 3) {
        // Format: garment-id-orientation-color (e.g., tshirt-black-front)
        // or garment-compound-id-orientation (e.g., zip-hoodie-front)
        
        // Check if last segment is an orientation
        const lastSegment = segments[segments.length - 1];
        const secondLastSegment = segments[segments.length - 2];
        
        if (['front', 'back', 'side'].includes(lastSegment)) {
          orientation = lastSegment;
          garmentId = segments.slice(0, -1).join('-');
        } else if (['front', 'back', 'side'].includes(secondLastSegment)) {
          orientation = secondLastSegment;
          garmentId = segments.slice(0, -2).join('-');
        } else {
          // Fallback: assume last segment is orientation
          orientation = lastSegment;
          garmentId = segments.slice(0, -1).join('-');
        }
      } else {
        continue; // Skip invalid filenames
      }
      
      // Normalize garment ID (handle common variations)
      garmentId = normalizeGarmentId(garmentId);
      
      // Validate orientation
      if (!['front', 'back', 'side'].includes(orientation)) {
        continue;
      }
      
      if (!imageMap[garmentId]) {
        imageMap[garmentId] = {};
      }
      
      imageMap[garmentId][orientation as 'front' | 'back' | 'side'] = url;
    }
  }
  
  return imageMap;
}

// Normalize garment IDs to match our garment types
function normalizeGarmentId(id: string): string {
  const normalizations: Record<string, string> = {
    'tshirt': 't-shirt',
    'tee': 't-shirt',
    'tank': 'tank',
    'tanktop': 'tank',
    'tank-top': 'tank',
    'womens-tank': 'tank',
    'womens-tee': 'womens-fitted-tee',
    'womens-fitted': 'womens-fitted-tee',
    'zip-hoodie': 'zip-hoodie',
    'ziphoodie': 'zip-hoodie',
    'crewneck': 'crewneck',
    'crew': 'crewneck',
    'long-sleeve': 'long-sleeve-tee',
    'longsleeve': 'long-sleeve-tee',
    'long-sleeve-tee': 'long-sleeve-tee',
    'vneck': 'vneck',
    'v-neck': 'vneck',
    'button-shirt': 'button-shirt',
    'buttonshirt': 'button-shirt',
    'dress-shirt': 'button-shirt',
    'bomber': 'bomber-jacket',
    'bomber-jacket': 'bomber-jacket',
    'denim': 'denim-jacket',
    'denim-jacket': 'denim-jacket',
    'performance': 'performance-shirt',
    'athletic': 'performance-shirt',
    'snapback': 'snapback',
    'snap-back': 'snapback',
    'trucker': 'trucker-hat',
    'trucker-hat': 'trucker-hat',
    'cap': 'cap',
    'baseball-cap': 'cap',
    'beanie': 'beanie',
    'tote': 'tote',
    'tote-bag': 'tote',
    'apron': 'apron',
    'kitchen-apron': 'apron',
    'onesie': 'onesie',
    'baby-onesie': 'onesie',
  };
  
  return normalizations[id] || id;
}

// Build the image maps
export const staticImageMap = buildImageMap(staticGarmentImages);
export const customImageMap = buildImageMap(customGarmentImages);
export const mockupImageMap = buildImageMap(mockupImages);

// Master image resolver - custom images override static ones
export function getGarmentImage(garmentId: string, orientation: 'front' | 'back' | 'side' = 'front'): string | undefined {
  // First check custom images (user uploads)
  const customImage = customImageMap[garmentId]?.[orientation];
  if (customImage) return customImage;
  
  // Then check static garment images
  const staticImage = staticImageMap[garmentId]?.[orientation];
  if (staticImage) return staticImage;
  
  // Fallback to mockup images for canvas use
  const mockupImage = mockupImageMap[garmentId]?.[orientation];
  if (mockupImage) return mockupImage;
  
  return undefined;
}

// Get all available images for a garment
export function getAllGarmentImages(garmentId: string): { front?: string; back?: string; side?: string } {
  const staticImages = staticImageMap[garmentId] || {};
  const customImages = customImageMap[garmentId] || {};
  const mockupImages = mockupImageMap[garmentId] || {};
  
  // Merge with custom taking priority
  return {
    front: customImages.front || staticImages.front || mockupImages.front,
    back: customImages.back || staticImages.back || mockupImages.back,
    side: customImages.side || staticImages.side || mockupImages.side,
  };
}

// Apply images to garment type
export function mergeImagesWithGarment(garment: GarmentType): GarmentType {
  const images = getAllGarmentImages(garment.id);
  
  return {
    ...garment,
    images: {
      ...garment.images,
      ...images, // Override with dynamic images
    },
  };
}

// Batch apply to multiple garments
export function mergeImagesWithGarments(garments: GarmentType[]): GarmentType[] {
  return garments.map(mergeImagesWithGarment);
}

// Upload handling utilities
export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

// Validate uploaded file naming
export function validateImageFileName(filename: string): { valid: boolean; garmentId?: string; orientation?: string; error?: string } {
  const lowerFilename = filename.toLowerCase();
  
  // Check file extension
  if (!/\.(png|jpg|jpeg)$/i.test(filename)) {
    return { valid: false, error: 'File must be PNG, JPG, or JPEG' };
  }
  
  // Parse filename
  const nameWithoutExt = lowerFilename.replace(/\.(png|jpg|jpeg)$/, '');
  const segments = nameWithoutExt.split('-');
  
  if (segments.length < 2) {
    return { valid: false, error: 'Filename must follow pattern: garment-orientation.ext (e.g., tshirt-front.png)' };
  }
  
  // Extract orientation
  const lastSegment = segments[segments.length - 1];
  const secondLastSegment = segments[segments.length - 2];
  
  let orientation: string;
  let garmentId: string;
  
  if (['front', 'back', 'side'].includes(lastSegment)) {
    orientation = lastSegment;
    garmentId = segments.slice(0, -1).join('-');
  } else if (['front', 'back', 'side'].includes(secondLastSegment)) {
    orientation = secondLastSegment;
    garmentId = segments.slice(0, -2).join('-');
  } else {
    return { valid: false, error: 'Filename must include orientation: front, back, or side' };
  }
  
  return { 
    valid: true, 
    garmentId: normalizeGarmentId(garmentId), 
    orientation 
  };
}

// Create metadata for uploaded images
export function createImageMetadata(files: File[]): Array<{
  file: File;
  garmentId: string;
  orientation: string;
  targetPath: string;
}> {
  const metadata: Array<{
    file: File;
    garmentId: string;
    orientation: string;
    targetPath: string;
  }> = [];
  
  for (const file of files) {
    const validation = validateImageFileName(file.name);
    if (validation.valid && validation.garmentId && validation.orientation) {
      metadata.push({
        file,
        garmentId: validation.garmentId,
        orientation: validation.orientation,
        targetPath: `src/assets/custom/${validation.garmentId}-${validation.orientation}.${file.name.split('.').pop()}`,
      });
    }
  }
  
  return metadata;
}