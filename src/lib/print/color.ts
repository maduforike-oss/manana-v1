import type { ColorInfo } from './types';

/**
 * Color management utilities for print-ready designs
 */

// sRGB color gamut boundaries (simplified)
const SRGB_GAMUT = {
  red: { min: 0, max: 255 },
  green: { min: 0, max: 255 },
  blue: { min: 0, max: 255 }
};

export const clampToSRGB = (rgb: [number, number, number]): [number, number, number] => {
  return [
    Math.max(0, Math.min(255, Math.round(rgb[0]))),
    Math.max(0, Math.min(255, Math.round(rgb[1]))),
    Math.max(0, Math.min(255, Math.round(rgb[2])))
  ];
};

export const isOutOfGamut = (rgb: [number, number, number]): boolean => {
  // Simple check for extreme colors that might not print well
  const [r, g, b] = rgb;
  
  // Check for very saturated colors
  const maxComponent = Math.max(r, g, b);
  const minComponent = Math.min(r, g, b);
  const saturation = maxComponent > 0 ? (maxComponent - minComponent) / maxComponent : 0;
  
  // Check for very bright saturated colors (often problematic for printing)
  if (saturation > 0.9 && maxComponent > 200) {
    return true;
  }
  
  // Check for very dark colors with high saturation
  if (saturation > 0.8 && maxComponent < 50) {
    return true;
  }
  
  return false;
};

export const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};

export const rgbToHex = (rgb: [number, number, number]): string => {
  const [r, g, b] = clampToSRGB(rgb);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Basic Pantone color mapping (subset for demonstration)
const PANTONE_COLORS = [
  { pantone: 'PANTONE 186 C', hex: '#CE1141', name: 'Red 032' },
  { pantone: 'PANTONE 280 C', hex: '#002F6C', name: 'Blue 072' },
  { pantone: 'PANTONE 349 C', hex: '#009639', name: 'Green 348' },
  { pantone: 'PANTONE 151 C', hex: '#FF8200', name: 'Orange 021' },
  { pantone: 'PANTONE 253 C', hex: '#B83DBA', name: 'Purple 513' },
  { pantone: 'PANTONE 109 C', hex: '#FFE135', name: 'Yellow 012' },
  { pantone: 'PANTONE Cool Gray 11 C', hex: '#53565A', name: 'Cool Gray 11' },
  { pantone: 'PANTONE Black C', hex: '#2D2926', name: 'Process Black' }
];

export const mapToPantone = (hex: string): { pantone: string; hex: string; name: string } | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  let closestColor = PANTONE_COLORS[0];
  let minDistance = Infinity;
  
  for (const pantone of PANTONE_COLORS) {
    const pantoneRgb = hexToRgb(pantone.hex);
    if (!pantoneRgb) continue;
    
    // Calculate color distance using Delta E simplified formula
    const distance = Math.sqrt(
      Math.pow(rgb[0] - pantoneRgb[0], 2) +
      Math.pow(rgb[1] - pantoneRgb[1], 2) +
      Math.pow(rgb[2] - pantoneRgb[2], 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = pantone;
    }
  }
  
  return closestColor;
};

export const getColorInfo = (hex: string): ColorInfo => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return { rgb: [0, 0, 0], hex: '#000000', isOutOfGamut: false };
  }
  
  const pantoneMatch = mapToPantone(hex);
  
  return {
    rgb,
    hex,
    name: pantoneMatch?.name,
    pantone: pantoneMatch?.pantone,
    isOutOfGamut: isOutOfGamut(rgb)
  };
};

export const generateColorWarning = (colorInfo: ColorInfo): string | null => {
  if (colorInfo.isOutOfGamut) {
    const suggestion = colorInfo.pantone ? 
      `Consider using ${colorInfo.pantone} (${colorInfo.name}) for better print results.` :
      'This color may not print accurately. Consider a less saturated alternative.';
    
    return `⚠️ Out-of-gamut color detected. ${suggestion}`;
  }
  
  return null;
};