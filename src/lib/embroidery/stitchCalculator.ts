/**
 * Stitch count calculator for embroidery
 * Estimates stitch count based on design area, density, and complexity
 */

import { Node } from "@/lib/studio/types";

export interface StitchEstimate {
  fillStitches: number;
  satinStitches: number;
  runningStitches: number;
  totalStitches: number;
  estimatedTime: number; // in minutes
  estimatedCost: number; // base cost multiplier
}

export interface StitchDensity {
  fillDensity: number; // stitches per mm²
  satinWidth: number; // average satin stitch width in mm
  runningStitchLength: number; // average stitch length in mm
}

const DEFAULT_DENSITY: StitchDensity = {
  fillDensity: 4.5, // typical: 4-5 stitches per mm²
  satinWidth: 6, // typical satin column width
  runningStitchLength: 3, // typical running stitch length
};

const STITCH_SPEED = 1000; // stitches per minute (typical commercial machine)
const COST_PER_1000_STITCHES = 0.50; // base cost multiplier

/**
 * Calculate stitch count for a single node
 */
export function calculateNodeStitches(
  node: Node,
  dpi: number = 300,
  density: StitchDensity = DEFAULT_DENSITY
): StitchEstimate {
  const widthMm = pixelsToMm(node.width, dpi);
  const heightMm = pixelsToMm(node.height, dpi);
  const areaMm2 = widthMm * heightMm;

  let fillStitches = 0;
  let satinStitches = 0;
  let runningStitches = 0;

  if (node.type === "text") {
    // Text typically uses satin stitches for letters
    const textNode = node as any;
    const fontSize = textNode.fontSize || 12;
    const textLength = textNode.text?.length || 0;
    
    // Estimate based on character count and size
    fillStitches = areaMm2 * density.fillDensity * 0.3; // 30% fill
    satinStitches = textLength * fontSize * 2; // Approximate satin for outlines
    runningStitches = textLength * fontSize * 0.5; // Underlay stitches
  } else if (node.type === "shape") {
    const shapeNode = node as any;
    const hasFill = shapeNode.fill?.type === "solid";
    const hasStroke = shapeNode.stroke?.width > 0;

    if (hasFill) {
      fillStitches = areaMm2 * density.fillDensity;
    }

    if (hasStroke) {
      const perimeterMm = 2 * (widthMm + heightMm); // Approximate perimeter
      satinStitches = (perimeterMm / density.satinWidth) * density.satinWidth;
    }
  } else if (node.type === "path") {
    const pathNode = node as any;
    const strokeWidth = pathNode.stroke?.width || 1;
    const strokeWidthMm = pixelsToMm(strokeWidth, dpi);

    // Paths are typically running or satin stitches
    if (strokeWidthMm < 2) {
      // Thin lines = running stitch
      const pathLengthMm = estimatePathLength(node, dpi);
      runningStitches = pathLengthMm / density.runningStitchLength;
    } else {
      // Thick lines = satin stitch
      const pathLengthMm = estimatePathLength(node, dpi);
      satinStitches = (pathLengthMm / density.satinWidth) * density.satinWidth;
    }
  } else if (node.type === "image") {
    // Images require heavy fill stitching (simplified estimate)
    fillStitches = areaMm2 * density.fillDensity * 1.5; // Higher density for images
  }

  const totalStitches = Math.round(fillStitches + satinStitches + runningStitches);
  const estimatedTime = totalStitches / STITCH_SPEED;
  const estimatedCost = (totalStitches / 1000) * COST_PER_1000_STITCHES;

  return {
    fillStitches: Math.round(fillStitches),
    satinStitches: Math.round(satinStitches),
    runningStitches: Math.round(runningStitches),
    totalStitches,
    estimatedTime: Math.round(estimatedTime * 10) / 10, // Round to 1 decimal
    estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Calculate total stitches for all nodes
 */
export function calculateDesignStitches(
  nodes: Node[],
  dpi: number = 300,
  density: StitchDensity = DEFAULT_DENSITY
): StitchEstimate {
  const totals: StitchEstimate = {
    fillStitches: 0,
    satinStitches: 0,
    runningStitches: 0,
    totalStitches: 0,
    estimatedTime: 0,
    estimatedCost: 0,
  };

  for (const node of nodes) {
    if (node.hidden) continue;

    const estimate = calculateNodeStitches(node, dpi, density);
    totals.fillStitches += estimate.fillStitches;
    totals.satinStitches += estimate.satinStitches;
    totals.runningStitches += estimate.runningStitches;
    totals.totalStitches += estimate.totalStitches;
    totals.estimatedTime += estimate.estimatedTime;
    totals.estimatedCost += estimate.estimatedCost;
  }

  return totals;
}

/**
 * Convert pixels to millimeters based on DPI
 */
function pixelsToMm(pixels: number, dpi: number): number {
  return (pixels / dpi) * 25.4;
}

/**
 * Estimate path length in millimeters
 */
function estimatePathLength(node: Node, dpi: number): number {
  if (node.type !== "path") return 0;

  const pathNode = node as any;
  const points = pathNode.points || [];
  
  let length = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const dx = points[i + 2] - points[i];
    const dy = points[i + 3] - points[i + 1];
    length += Math.sqrt(dx * dx + dy * dy);
  }

  return pixelsToMm(length, dpi);
}

/**
 * Get stitch complexity rating
 */
export function getStitchComplexity(estimate: StitchEstimate): {
  level: "Low" | "Medium" | "High" | "Very High";
  description: string;
} {
  const { totalStitches } = estimate;

  if (totalStitches < 5000) {
    return {
      level: "Low",
      description: "Simple design, quick production",
    };
  } else if (totalStitches < 15000) {
    return {
      level: "Medium",
      description: "Moderate complexity, standard production",
    };
  } else if (totalStitches < 30000) {
    return {
      level: "High",
      description: "Complex design, longer production time",
    };
  } else {
    return {
      level: "Very High",
      description: "Very complex, significant production time and cost",
    };
  }
}
