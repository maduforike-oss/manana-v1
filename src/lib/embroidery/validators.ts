/**
 * Embroidery-specific validation
 */

import { Node } from "@/lib/studio/types";
import { extractNodeColors } from "@/lib/print-ready/printMethods";
import { getDesignThreadColors } from "./threadColors";

export interface EmbroideryValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export interface EmbroideryConstraints {
  maxColors: number;
  minTextSize: number; // in points
  minLineWidth: number; // in mm at 300 DPI
  allowGradients: boolean;
  maxStitchCount?: number;
  minFeatureSize: number; // in mm
}

const DEFAULT_CONSTRAINTS: EmbroideryConstraints = {
  maxColors: 15,
  minTextSize: 10,
  minLineWidth: 0.5,
  allowGradients: false,
  maxStitchCount: 50000, // Commercial limit
  minFeatureSize: 1.5, // Minimum detail size in mm
};

/**
 * Validate a single node for embroidery
 */
export function validateNodeForEmbroidery(
  node: Node,
  constraints: EmbroideryConstraints = DEFAULT_CONSTRAINTS
): EmbroideryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Check gradients
  if (!constraints.allowGradients) {
    if (node.type === "text" || node.type === "shape") {
      const fill = (node as any).fill;
      if (fill?.type === "linear") {
        errors.push("Embroidery does not support gradients. Convert to solid colors.");
      }
    }
  }

  // Check text size
  if (node.type === "text") {
    const textNode = node as any;
    const fontSize = textNode.fontSize || 12;

    if (fontSize < constraints.minTextSize) {
      warnings.push(
        `Text size ${fontSize}pt is below minimum ${constraints.minTextSize}pt. Letters may not stitch clearly.`
      );
    }

    if (fontSize < 6) {
      errors.push(`Text size ${fontSize}pt is too small for embroidery. Minimum: 6pt.`);
    }

    // Check for complex fonts
    const fontFamily = textNode.fontFamily || "";
    if (fontFamily.toLowerCase().includes("script") || fontFamily.toLowerCase().includes("cursive")) {
      info.push("Script fonts may require manual digitization for best results.");
    }
  }

  // Check line width for paths
  if (node.type === "path") {
    const pathNode = node as any;
    const strokeWidth = pathNode.stroke?.width || 0;
    const strokeWidthMm = (strokeWidth / 300) * 25.4; // Convert to mm

    if (strokeWidthMm < constraints.minLineWidth) {
      warnings.push(
        `Line width ${strokeWidthMm.toFixed(2)}mm is very thin. Minimum recommended: ${constraints.minLineWidth}mm.`
      );
    }

    if (strokeWidthMm < 0.3) {
      errors.push(`Line width ${strokeWidthMm.toFixed(2)}mm is too thin for embroidery. Minimum: 0.3mm.`);
    }
  }

  // Check feature size
  const minDimension = Math.min(node.width, node.height);
  const minDimensionMm = (minDimension / 300) * 25.4;

  if (minDimensionMm < constraints.minFeatureSize) {
    warnings.push(
      `Feature size ${minDimensionMm.toFixed(2)}mm is very small. Details may be lost. Minimum: ${constraints.minFeatureSize}mm.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Validate entire design for embroidery
 */
export function validateDesignForEmbroidery(
  nodes: Node[],
  constraints: EmbroideryConstraints = DEFAULT_CONSTRAINTS
): EmbroideryValidation {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allInfo: string[] = [];

  // Validate each node
  for (const node of nodes) {
    if (node.hidden) continue;

    const validation = validateNodeForEmbroidery(node, constraints);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
    allInfo.push(...validation.info);
  }

  // Check total color count
  const allColors: string[] = [];
  nodes.forEach((node) => {
    if (!node.hidden) {
      allColors.push(...extractNodeColors(node));
    }
  });

  const threadColors = getDesignThreadColors(allColors);
  if (threadColors.length > constraints.maxColors) {
    allErrors.push(
      `Design uses ${threadColors.length} thread colors. Maximum: ${constraints.maxColors}. Reduce colors or split into multiple designs.`
    );
  } else if (threadColors.length > 10) {
    allWarnings.push(
      `Design uses ${threadColors.length} thread colors. More colors = higher cost and longer production time.`
    );
  }

  // Remove duplicates
  const uniqueErrors = Array.from(new Set(allErrors));
  const uniqueWarnings = Array.from(new Set(allWarnings));
  const uniqueInfo = Array.from(new Set(allInfo));

  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors,
    warnings: uniqueWarnings,
    info: uniqueInfo,
  };
}

/**
 * Auto-simplify design for embroidery
 */
export function getSimplificationSuggestions(node: Node): string[] {
  const suggestions: string[] = [];

  if (node.type === "text" || node.type === "shape") {
    const fill = (node as any).fill;
    if (fill?.type === "linear") {
      suggestions.push("Convert gradient to solid color (use dominant color)");
    }
  }

  if (node.type === "text") {
    const textNode = node as any;
    const fontSize = textNode.fontSize || 12;

    if (fontSize < 10) {
      suggestions.push("Increase text size to at least 10pt");
    }
  }

  if (node.type === "path") {
    const pathNode = node as any;
    const strokeWidth = pathNode.stroke?.width || 0;

    if (strokeWidth < 2) {
      suggestions.push("Increase line width to at least 2px (0.5mm)");
    }
  }

  if (node.type === "image") {
    suggestions.push("Convert image to vector shapes for best embroidery results");
    suggestions.push("Simplify image to 6-8 solid colors maximum");
  }

  return suggestions;
}
