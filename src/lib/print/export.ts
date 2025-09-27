import { supabase } from '@/integrations/supabase/client';
import { getPrintDimensions, makePixelDims } from './dpi';
import type { ExportRequest, ExportResult } from './types';
import type { DesignDoc } from '../studio/types';

/**
 * Enhanced export utilities for print-ready files
 */

export const exportRaster = async (
  canvas: HTMLCanvasElement, 
  options: ExportRequest
): Promise<Blob> => {
  const { width_px, height_px, dpi, format, transparent = false } = options;
  
  // Create high-resolution canvas
  const exportCanvas = document.createElement('canvas');
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  exportCanvas.width = width_px;
  exportCanvas.height = height_px;
  
  // Set high DPI rendering
  const scaleFactor = dpi / 96; // Browser default DPI
  ctx.scale(scaleFactor, scaleFactor);
  
  // Fill background if not transparent
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width_px / scaleFactor, height_px / scaleFactor);
  }
  
  // Draw original canvas content
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
    0, 0, width_px / scaleFactor, height_px / scaleFactor);
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    if (format === 'pdf') {
      // For PDF, we'll use a library like jsPDF in a real implementation
      // For now, export as high-res PNG
      exportCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    } else {
      exportCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, `image/${format}`, 1.0);
    }
  });
};

export const saveExportToStorage = async (
  blob: Blob,
  filename: string,
  exportData: Partial<ExportResult>
): Promise<string> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Authentication required');
  
  // Upload to Supabase Storage
  const path = `exports/${user.user.id}/${Date.now()}-${filename}`;
  const { data, error } = await supabase.storage
    .from('design-exports')
    .upload(path, blob);
    
  if (error) throw error;
  
  // Record export in database
  const { data: exportRecord, error: dbError } = await supabase
    .from('design_exports')
    .insert({
      user_id: user.user.id,
      storage_path: data.path,
      ...exportData
    })
    .select()
    .single();
    
  if (dbError) throw dbError;
  
  return data.path;
};

export const exportPrintReady = async (
  canvas: HTMLCanvasElement,
  doc: DesignDoc,
  preset: { width_in: number; height_in: number; dpi: number; bleed_in: number }
): Promise<{ files: string[]; specs: any }> => {
  const files: string[] = [];
  
  // Calculate dimensions with bleed
  const printDims = makePixelDims(preset.width_in, preset.height_in, preset.dpi);
  const bleedPx = Math.round(preset.bleed_in * preset.dpi);
  
  // Export main file with bleed
  const mainExport: ExportRequest = {
    width_px: printDims.wPx + (bleedPx * 2),
    height_px: printDims.hPx + (bleedPx * 2),
    dpi: preset.dpi,
    format: 'png',
    transparent: false,
    color_profile: 'sRGB',
    include_bleed: true
  };
  
  const blob = await exportRaster(canvas, mainExport);
  const path = await saveExportToStorage(blob, 'print-ready.png', {
    design_id: doc.id,
    format: 'png',
    width_px: mainExport.width_px,
    height_px: mainExport.height_px,
    dpi: preset.dpi,
    color_profile: 'sRGB'
  });
  
  files.push(path);
  
  // Generate print specifications
  const specs = {
    design_id: doc.id,
    print_dimensions: {
      width_in: preset.width_in,
      height_in: preset.height_in,
      bleed_in: preset.bleed_in
    },
    technical_specs: {
      dpi: preset.dpi,
      color_profile: 'sRGB',
      format: 'PNG',
      transparency: false
    },
    print_notes: [
      'File includes bleed area - do not trim inside bleed margins',
      'Colors calibrated for sRGB color space',
      'Recommended print methods: DTG, Sublimation',
      'For screen printing, convert to spot colors'
    ],
    created_at: new Date().toISOString()
  };
  
  return { files, specs };
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};