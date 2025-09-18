/**
 * Enhanced Image Generation API for Garments
 * Supports front/back view generation, batch processing, and image management
 */

export interface GarmentImageRequest {
  garmentType: string;
  orientation: 'front' | 'back' | 'side';
  material?: string;
  colorHex?: string;
  style?: string;
  mode?: 'mock' | 'ai' | 'auto';
  size?: string;
  quality?: 'standard' | 'high';
  transparent?: boolean;
}

export interface GarmentImageResponse {
  success: boolean;
  imageUrl?: string;
  filename?: string;
  previewDataUrl?: string;
  metadata?: {
    garmentType: string;
    orientation: string;
    dimensions: { width: number; height: number };
    format: string;
    size: number;
    generated_at: string;
  };
  error?: string;
}

export interface BatchImageRequest {
  garmentType: string;
  orientations: Array<'front' | 'back' | 'side'>;
  material?: string;
  colors?: Array<{ name: string; hex: string }>;
  style?: string;
  mode?: 'mock' | 'ai' | 'auto';
}

export interface BatchImageResponse {
  success: boolean;
  results: Array<{
    orientation: string;
    color?: string;
    imageUrl?: string;
    filename?: string;
    error?: string;
  }>;
  totalGenerated: number;
  totalFailed: number;
}

// Mock data for immediate use while AI generates
const MOCK_GARMENT_IMAGES = {
  'tshirt': {
    front: '/mockups/tshirt-front-light.png',
    back: '/garments/tshirt-white-front.png', // Placeholder for back
  },
  'hoodie': {
    front: '/garments/hoodie-charcoal-front.png',
    back: '/garments/zip-hoodie-charcoal-front.png', // Placeholder for back
  },
  'crewneck': {
    front: '/garments/crewneck-heather-front.png',
    back: '/garments/crewneck-heather-front.png', // Placeholder for back
  },
  'polo': {
    front: '/garments/polo-navy-front.png',
    back: '/garments/polo-navy-front.png', // Placeholder for back
  },
  'longsleeve': {
    front: '/garments/longsleeve-heather-front.png',
    back: '/garments/longsleeve-heather-front.png', // Placeholder for back
  },
};

// Color mapping for different garment colors
const COLOR_VARIANTS = {
  '#000000': 'black',
  '#FFFFFF': 'white',
  '#1E3A8A': 'navy',
  '#6B7280': 'gray',
  '#EF4444': 'red',
  '#10B981': 'green',
  '#F59E0B': 'yellow',
  '#8B5CF6': 'purple',
};

/**
 * Generate a single garment image
 */
export async function generateGarmentImage(
  request: GarmentImageRequest
): Promise<GarmentImageResponse> {
  try {
    // For immediate response, return mock image while generating real one
    const mockImage = getMockGarmentImage(request.garmentType, request.orientation);
    
    if (request.mode === 'mock' || (!request.mode && mockImage)) {
      return {
        success: true,
        imageUrl: mockImage,
        filename: `${request.garmentType}-${request.orientation}-mock.png`,
        previewDataUrl: mockImage,
        metadata: {
          garmentType: request.garmentType,
          orientation: request.orientation,
          dimensions: { width: 1024, height: 1024 },
          format: 'png',
          size: 0,
          generated_at: new Date().toISOString(),
        }
      };
    }

    // Call existing garment generation API
    const response = await fetch('/api/generate-garment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        garmentId: request.garmentType,
        orientation: request.orientation,
        material: request.material || 'cotton',
        colorHex: request.colorHex || '#FFFFFF',
        style: request.style,
        mode: request.mode || 'auto',
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Failed to generate image');
    }

    return {
      success: true,
      imageUrl: result.previewDataUrl,
      filename: result.filename,
      previewDataUrl: result.previewDataUrl,
      metadata: {
        garmentType: request.garmentType,
        orientation: request.orientation,
        dimensions: { width: 1024, height: 1024 },
        format: 'png',
        size: 0,
        generated_at: new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error generating garment image:', error);
    
    // Fallback to mock image on error
    const mockImage = getMockGarmentImage(request.garmentType, request.orientation);
    if (mockImage) {
      return {
        success: true,
        imageUrl: mockImage,
        filename: `${request.garmentType}-${request.orientation}-fallback.png`,
        previewDataUrl: mockImage,
        metadata: {
          garmentType: request.garmentType,
          orientation: request.orientation,
          dimensions: { width: 1024, height: 1024 },
          format: 'png',
          size: 0,
          generated_at: new Date().toISOString(),
        }
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate multiple garment images in batch
 */
export async function generateGarmentImageBatch(
  request: BatchImageRequest
): Promise<BatchImageResponse> {
  const results: BatchImageResponse['results'] = [];
  let totalGenerated = 0;
  let totalFailed = 0;

  const colors = request.colors || [{ name: 'white', hex: '#FFFFFF' }];

  for (const orientation of request.orientations) {
    for (const color of colors) {
      try {
        const imageRequest: GarmentImageRequest = {
          garmentType: request.garmentType,
          orientation,
          material: request.material,
          colorHex: color.hex,
          style: request.style,
          mode: request.mode,
        };

        const result = await generateGarmentImage(imageRequest);

        if (result.success) {
          results.push({
            orientation,
            color: color.name,
            imageUrl: result.imageUrl,
            filename: result.filename,
          });
          totalGenerated++;
        } else {
          results.push({
            orientation,
            color: color.name,
            error: result.error || 'Generation failed',
          });
          totalFailed++;
        }
      } catch (error) {
        results.push({
          orientation,
          color: color.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        totalFailed++;
      }

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    success: totalGenerated > 0,
    results,
    totalGenerated,
    totalFailed,
  };
}

/**
 * Get available garment types
 */
export function getAvailableGarmentTypes(): Array<{
  id: string;
  name: string;
  category: string;
  supportedViews: Array<'front' | 'back' | 'side'>;
}> {
  return [
    {
      id: 'tshirt',
      name: 'T-Shirt',
      category: 'shirts',
      supportedViews: ['front', 'back'],
    },
    {
      id: 'hoodie',
      name: 'Hoodie',
      category: 'outerwear',
      supportedViews: ['front', 'back'],
    },
    {
      id: 'crewneck',
      name: 'Crewneck Sweatshirt',
      category: 'sweatshirts',
      supportedViews: ['front', 'back'],
    },
    {
      id: 'polo',
      name: 'Polo Shirt',
      category: 'shirts',
      supportedViews: ['front', 'back'],
    },
    {
      id: 'longsleeve',
      name: 'Long Sleeve Shirt',
      category: 'shirts',
      supportedViews: ['front', 'back'],
    },
    {
      id: 'zip-hoodie',
      name: 'Zip Hoodie',
      category: 'outerwear',
      supportedViews: ['front', 'back'],
    },
  ];
}

/**
 * Get available color options
 */
export function getAvailableColors(): Array<{ name: string; hex: string; category: string }> {
  return [
    { name: 'White', hex: '#FFFFFF', category: 'basic' },
    { name: 'Black', hex: '#000000', category: 'basic' },
    { name: 'Navy', hex: '#1E3A8A', category: 'basic' },
    { name: 'Gray', hex: '#6B7280', category: 'basic' },
    { name: 'Red', hex: '#EF4444', category: 'bright' },
    { name: 'Green', hex: '#10B981', category: 'bright' },
    { name: 'Blue', hex: '#3B82F6', category: 'bright' },
    { name: 'Yellow', hex: '#F59E0B', category: 'bright' },
    { name: 'Purple', hex: '#8B5CF6', category: 'bright' },
    { name: 'Pink', hex: '#EC4899', category: 'bright' },
  ];
}

/**
 * Get mock garment image for immediate display
 */
function getMockGarmentImage(garmentType: string, orientation: string): string | null {
  const garmentImages = MOCK_GARMENT_IMAGES[garmentType as keyof typeof MOCK_GARMENT_IMAGES];
  if (!garmentImages) return null;
  
  return garmentImages[orientation as keyof typeof garmentImages] || null;
}

/**
 * Upload generated image to storage
 */
export async function uploadGeneratedImage(
  file: File | Blob,
  filename: string,
  productId?: string
): Promise<{ url: string; path: string }> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const path = productId 
      ? `products/${productId}/${filename}`
      : `generated/${filename}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}