/**
 * Design digitization utilities
 * Converts designs to embroidery-friendly formats
 */

import { Node } from "@/lib/studio/types";
import { findClosestThreadColor } from "./threadColors";

export interface DigitizedNode {
  originalId: string;
  type: "fill" | "satin" | "running";
  threadColor: string;
  coordinates: number[][];
  stitchType: "fill" | "satin" | "running" | "underlay";
}

export interface DigitizationResult {
  nodes: DigitizedNode[];
  threadColors: string[];
  totalStitches: number;
  warnings: string[];
}

/**
 * Simplify gradient to solid color
 */
export function simplifyGradient(fill: any): string {
  if (fill?.type === "linear" && fill.stops && fill.stops.length > 0) {
    // Use the first color stop as the solid color
    return fill.stops[0].color;
  }
  return fill?.color || "#000000";
}

/**
 * Convert node to embroidery-friendly format
 */
export function digitizeNode(node: Node): DigitizedNode | null {
  if (node.hidden) return null;

  const digitized: Partial<DigitizedNode> = {
    originalId: node.id,
    coordinates: [],
  };

  if (node.type === "text") {
    const textNode = node as any;
    const fillColor = simplifyGradient(textNode.fill);
    const threadColor = findClosestThreadColor(fillColor);

    digitized.type = "satin"; // Text typically uses satin stitches
    digitized.threadColor = threadColor.hex;
    digitized.stitchType = "satin";
    
    // Simplified coordinate representation (would need proper text-to-path conversion)
    digitized.coordinates = [
      [node.x, node.y],
      [node.x + node.width, node.y],
      [node.x + node.width, node.y + node.height],
      [node.x, node.y + node.height],
    ];
  } else if (node.type === "shape") {
    const shapeNode = node as any;
    const fillColor = simplifyGradient(shapeNode.fill);
    const threadColor = findClosestThreadColor(fillColor);

    digitized.type = "fill";
    digitized.threadColor = threadColor.hex;
    digitized.stitchType = "fill";

    // Create bounding box coordinates
    digitized.coordinates = [
      [node.x, node.y],
      [node.x + node.width, node.y],
      [node.x + node.width, node.y + node.height],
      [node.x, node.y + node.height],
    ];
  } else if (node.type === "path") {
    const pathNode = node as any;
    const strokeColor = pathNode.stroke?.color || "#000000";
    const threadColor = findClosestThreadColor(strokeColor);
    const strokeWidth = pathNode.stroke?.width || 1;

    // Determine stitch type based on stroke width
    if (strokeWidth < 2) {
      digitized.type = "running";
      digitized.stitchType = "running";
    } else {
      digitized.type = "satin";
      digitized.stitchType = "satin";
    }

    digitized.threadColor = threadColor.hex;

    // Convert path points to coordinates
    const points = pathNode.points || [];
    digitized.coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      digitized.coordinates.push([points[i], points[i + 1]]);
    }
  }

  return digitized as DigitizedNode;
}

/**
 * Digitize entire design
 */
export function digitizeDesign(nodes: Node[]): DigitizationResult {
  const digitizedNodes: DigitizedNode[] = [];
  const threadColorsSet = new Set<string>();
  const warnings: string[] = [];

  for (const node of nodes) {
    const digitized = digitizeNode(node);
    if (digitized) {
      digitizedNodes.push(digitized);
      threadColorsSet.add(digitized.threadColor);
    }
  }

  // Check for images (not directly supported)
  const imageNodes = nodes.filter((n) => n.type === "image" && !n.hidden);
  if (imageNodes.length > 0) {
    warnings.push(
      `${imageNodes.length} image(s) detected. Images require manual vectorization for embroidery.`
    );
  }

  // Estimate total stitches (simplified)
  const totalStitches = digitizedNodes.reduce((sum, node) => {
    const area = node.coordinates.length * 100; // Simplified estimation
    return sum + area;
  }, 0);

  return {
    nodes: digitizedNodes,
    threadColors: Array.from(threadColorsSet),
    totalStitches: Math.round(totalStitches),
    warnings,
  };
}

/**
 * Auto-vectorize simple shapes (simplified)
 */
export function autoVectorize(node: Node): Node | null {
  // This is a placeholder for auto-vectorization
  // In a real implementation, this would convert images to vector paths
  if (node.type === "image") {
    return null; // Not implemented yet
  }
  return node;
}

/**
 * Simplify path for embroidery (reduce points)
 */
export function simplifyPath(points: number[], tolerance: number = 2): number[] {
  // Douglas-Peucker algorithm (simplified)
  if (points.length < 6) return points; // Need at least 3 points (x,y pairs)

  // Simple decimation - keep every Nth point
  const simplified: number[] = [];
  for (let i = 0; i < points.length; i += tolerance * 2) {
    simplified.push(points[i], points[i + 1]);
  }

  // Always include last point
  if (simplified.length < points.length) {
    simplified.push(points[points.length - 2], points[points.length - 1]);
  }

  return simplified;
}
