/**
 * Physical unit conversion and DPI validation utilities
 */

export type PhysicalUnit = "in" | "mm" | "cm";

export interface PhysicalDimensions {
  width: number;
  height: number;
  unit: PhysicalUnit;
}

export interface PixelDimensions {
  width: number;
  height: number;
}

export interface DPIInfo {
  current: number;
  target: number;
  isValid: boolean;
  warning?: string;
}

// Conversion constants
const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;

/**
 * Convert physical dimensions to pixels at a given DPI
 */
export function physicalToPixels(
  physical: PhysicalDimensions,
  dpi: number
): PixelDimensions {
  const inches = toInches(physical.width, physical.unit);
  const inchesHeight = toInches(physical.height, physical.unit);
  
  return {
    width: Math.round(inches * dpi),
    height: Math.round(inchesHeight * dpi),
  };
}

/**
 * Convert pixels to physical dimensions at a given DPI
 */
export function pixelsToPhysical(
  pixels: PixelDimensions,
  dpi: number,
  unit: PhysicalUnit = "in"
): PhysicalDimensions {
  const widthInches = pixels.width / dpi;
  const heightInches = pixels.height / dpi;
  
  return {
    width: fromInches(widthInches, unit),
    height: fromInches(heightInches, unit),
    unit,
  };
}

/**
 * Calculate current DPI based on pixel and physical dimensions
 */
export function calculateDPI(
  pixels: PixelDimensions,
  physical: PhysicalDimensions
): number {
  const widthInches = toInches(physical.width, physical.unit);
  return pixels.width / widthInches;
}

/**
 * Validate DPI and provide warnings
 */
export function validateDPI(
  currentDPI: number,
  targetDPI: number = 300,
  minDPI: number = 150
): DPIInfo {
  const info: DPIInfo = {
    current: currentDPI,
    target: targetDPI,
    isValid: currentDPI >= minDPI,
  };

  if (currentDPI < minDPI) {
    info.warning = `Resolution too low (${Math.round(currentDPI)} DPI). Print may appear blurry. Recommended: ${targetDPI} DPI minimum.`;
  } else if (currentDPI < targetDPI) {
    info.warning = `Resolution below recommended (${Math.round(currentDPI)} DPI). Target: ${targetDPI} DPI for best quality.`;
  }

  return info;
}

/**
 * Convert any unit to inches
 */
export function toInches(value: number, unit: PhysicalUnit): number {
  switch (unit) {
    case "in":
      return value;
    case "mm":
      return value / MM_PER_INCH;
    case "cm":
      return value / CM_PER_INCH;
  }
}

/**
 * Convert inches to any unit
 */
export function fromInches(inches: number, unit: PhysicalUnit): number {
  switch (unit) {
    case "in":
      return inches;
    case "mm":
      return inches * MM_PER_INCH;
    case "cm":
      return inches * CM_PER_INCH;
  }
}

/**
 * Format physical dimensions for display
 */
export function formatPhysicalDimensions(dims: PhysicalDimensions): string {
  const w = dims.width.toFixed(2);
  const h = dims.height.toFixed(2);
  return `${w} × ${h} ${dims.unit}`;
}
