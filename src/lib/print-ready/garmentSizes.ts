/**
 * Garment size scaling and multi-size design management
 */

export type GarmentSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";

export interface SizeScale {
  size: GarmentSize;
  scaleX: number;
  scaleY: number;
  offsetX?: number;
  offsetY?: number;
}

export interface SizeScalingRecommendation {
  targetSize: GarmentSize;
  suggestedScale: number;
  warning?: string;
}

/**
 * Get default scaling factors for garment sizes relative to M
 */
export function getSizeScalingFactors(size: GarmentSize): SizeScale {
  const scales: Record<GarmentSize, SizeScale> = {
    XS: { size: "XS", scaleX: 0.85, scaleY: 0.85 },
    S: { size: "S", scaleX: 0.92, scaleY: 0.92 },
    M: { size: "M", scaleX: 1.0, scaleY: 1.0 },
    L: { size: "L", scaleX: 1.08, scaleY: 1.08 },
    XL: { size: "XL", scaleX: 1.15, scaleY: 1.15 },
    XXL: { size: "XXL", scaleX: 1.23, scaleY: 1.23 },
    XXXL: { size: "XXXL", scaleX: 1.30, scaleY: 1.30 },
  };

  return scales[size];
}

/**
 * Calculate recommended scaling when switching sizes
 */
export function getScalingRecommendation(
  fromSize: GarmentSize,
  toSize: GarmentSize,
  designWidth: number,
  designHeight: number
): SizeScalingRecommendation {
  const fromScale = getSizeScalingFactors(fromSize);
  const toScale = getSizeScalingFactors(toSize);
  
  const relativeScale = toScale.scaleX / fromScale.scaleX;
  const newWidth = designWidth * relativeScale;
  const newHeight = designHeight * relativeScale;

  const recommendation: SizeScalingRecommendation = {
    targetSize: toSize,
    suggestedScale: relativeScale,
  };

  // Add warnings for extreme size changes
  if (relativeScale < 0.7) {
    recommendation.warning = 
      "Scaling down significantly. Check that text and details remain readable.";
  } else if (relativeScale > 1.4) {
    recommendation.warning = 
      "Scaling up significantly. Ensure design resolution remains adequate.";
  }

  return recommendation;
}

/**
 * Apply size-specific design adjustments
 */
export function applySizeAdjustments(
  nodes: any[],
  fromSize: GarmentSize,
  toSize: GarmentSize
): any[] {
  const scaling = getScalingRecommendation(fromSize, toSize, 100, 100);
  const scale = scaling.suggestedScale;

  return nodes.map(node => ({
    ...node,
    x: node.x * scale,
    y: node.y * scale,
    width: node.width * scale,
    height: node.height * scale,
    // Scale text size if applicable
    fontSize: node.fontSize ? node.fontSize * scale : node.fontSize,
  }));
}

/**
 * Get print zone dimensions for a specific size
 */
export function getPrintZoneForSize(
  baseZone: { width: number; height: number },
  size: GarmentSize
): { width: number; height: number } {
  const scale = getSizeScalingFactors(size);
  
  return {
    width: baseZone.width * scale.scaleX,
    height: baseZone.height * scale.scaleY,
  };
}
