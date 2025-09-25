import { DesignDoc } from './types';
import { supabase } from '@/integrations/supabase/client';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'webp' | 'jpeg';
}

export interface ThumbnailResult {
  blob: Blob;
  url: string;
  path: string;
}

/**
 * Generate a thumbnail from the current canvas
 */
export const generateDesignThumbnail = async (
  canvas: HTMLCanvasElement,
  doc: DesignDoc,
  options: ThumbnailOptions = {}
): Promise<Blob> => {
  const {
    width = 300,
    height = 300,
    quality = 0.9,
    format = 'png'
  } = options;

  // Create thumbnail canvas
  const thumbnailCanvas = document.createElement('canvas');
  const ctx = thumbnailCanvas.getContext('2d')!;
  
  // Calculate aspect ratio and dimensions
  const aspectRatio = canvas.width / canvas.height;
  let thumbWidth = width;
  let thumbHeight = height;
  
  if (aspectRatio > 1) {
    thumbHeight = width / aspectRatio;
  } else {
    thumbWidth = height * aspectRatio;
  }
  
  thumbnailCanvas.width = thumbWidth;
  thumbnailCanvas.height = thumbHeight;
  
  // Set white background for non-transparent formats
  if (format !== 'png') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, thumbWidth, thumbHeight);
  }
  
  // Draw scaled canvas
  ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
  
  return new Promise((resolve, reject) => {
    thumbnailCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate thumbnail blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
};

/**
 * Upload thumbnail to Supabase Storage
 */
export const uploadThumbnail = async (
  blob: Blob,
  userId: string,
  designId: string
): Promise<string | null> => {
  try {
    const path = `thumbnails/${userId}/${designId}.png`;
    
    const { error } = await supabase.storage
      .from('design-assets')
      .upload(path, blob, {
        contentType: 'image/png',
        upsert: true // Allow overwriting existing thumbnails
      });

    if (error) {
      console.error('Thumbnail upload error:', error);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('design-assets')
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload thumbnail:', error);
    return null;
  }
};

/**
 * Generate and upload thumbnail in one call
 */
export const generateAndUploadThumbnail = async (
  canvas: HTMLCanvasElement,
  doc: DesignDoc,
  userId: string,
  designId: string,
  options?: ThumbnailOptions
): Promise<string | null> => {
  try {
    const blob = await generateDesignThumbnail(canvas, doc, options);
    return await uploadThumbnail(blob, userId, designId);
  } catch (error) {
    console.error('Failed to generate and upload thumbnail:', error);
    return null;
  }
};

/**
 * Generate print-ready image (high resolution)
 */
export const generatePrintImage = async (
  canvas: HTMLCanvasElement,
  doc: DesignDoc,
  dpi: number = 300
): Promise<Blob> => {
  const scale = dpi / 96; // 96 is default screen DPI
  
  const printCanvas = document.createElement('canvas');
  const ctx = printCanvas.getContext('2d')!;
  
  printCanvas.width = doc.canvas.width * scale;
  printCanvas.height = doc.canvas.height * scale;
  
  // Set background
  if (doc.canvas.background && doc.canvas.background !== 'transparent') {
    ctx.fillStyle = doc.canvas.background;
    ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);
  }
  
  // Scale and draw
  ctx.scale(scale, scale);
  ctx.drawImage(canvas, 0, 0);
  
  return new Promise((resolve, reject) => {
    printCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate print image blob'));
        }
      },
      'image/png'
    );
  });
};