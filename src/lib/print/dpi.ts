/**
 * DPI conversion utilities for print-ready exports
 */

export const inToPx = (inches: number, dpi: number): number => {
  return Math.round(inches * dpi);
};

export const pxToIn = (px: number, dpi: number): number => {
  return px / dpi;
};

export const makePixelDims = (width_in: number, height_in: number, dpi: number) => {
  return {
    wPx: inToPx(width_in, dpi),
    hPx: inToPx(height_in, dpi)
  };
};

export const validateDPI = (dpi: number): boolean => {
  return dpi >= 72 && dpi <= 600;
};

export const getPrintDimensions = (canvas: HTMLCanvasElement, targetDPI: number = 300) => {
  const currentDPI = 96; // Browser default
  const scaleFactor = targetDPI / currentDPI;
  
  return {
    width: Math.round(canvas.width * scaleFactor),
    height: Math.round(canvas.height * scaleFactor),
    scaleFactor
  };
};

export const mmToPx = (mm: number, dpi: number): number => {
  const inches = mm / 25.4; // 25.4mm = 1 inch
  return inToPx(inches, dpi);
};

export const pxToMm = (px: number, dpi: number): number => {
  const inches = pxToIn(px, dpi);
  return inches * 25.4;
};