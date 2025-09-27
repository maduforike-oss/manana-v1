import type { BlendMode } from './types';

/**
 * Blend mode utilities for print-safe rendering
 */

export const SUPPORTED_BLEND_MODES: BlendMode[] = [
  { name: 'Normal', value: 'normal', printSafe: true },
  { name: 'Multiply', value: 'multiply', printSafe: true },
  { name: 'Screen', value: 'screen', printSafe: true },
  { name: 'Overlay', value: 'overlay', printSafe: false }
];

export const applyBlendMode = (
  baseCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  mode: BlendMode['value']
): HTMLCanvasElement => {
  const result = document.createElement('canvas');
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  result.width = baseCanvas.width;
  result.height = baseCanvas.height;
  
  // Draw base layer
  ctx.drawImage(baseCanvas, 0, 0);
  
  // Apply blend mode and draw overlay
  ctx.globalCompositeOperation = mode as GlobalCompositeOperation;
  ctx.drawImage(overlayCanvas, 0, 0);
  
  return result;
};

export const bakeBlendModes = (
  layers: { canvas: HTMLCanvasElement; blendMode: BlendMode['value'] }[]
): HTMLCanvasElement => {
  if (layers.length === 0) {
    throw new Error('No layers to bake');
  }
  
  let result = layers[0].canvas;
  
  for (let i = 1; i < layers.length; i++) {
    const layer = layers[i];
    result = applyBlendMode(result, layer.canvas, layer.blendMode);
  }
  
  return result;
};

export const isBlendModePrintSafe = (mode: BlendMode['value']): boolean => {
  const blendMode = SUPPORTED_BLEND_MODES.find(m => m.value === mode);
  return blendMode?.printSafe ?? false;
};

export const getBlendModeWarning = (mode: BlendMode['value']): string | null => {
  if (!isBlendModePrintSafe(mode)) {
    return `⚠️ ${mode} blend mode may not print accurately. Consider baking the effect before export.`;
  }
  return null;
};