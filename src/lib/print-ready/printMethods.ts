/**
 * Print method constraints and validation
 */

import { Node } from "@/lib/studio/types";

export type PrintMethod = "DTG" | "Embroidery" | "Screen" | "Sublimation" | "Vinyl";

export interface PrintMethodConstraints {
  method: PrintMethod;
  allowGradients: boolean;
  maxColors?: number;
  minLineWidth?: number; // in pixels at 300 DPI
  minTextSize?: number; // in points
  requiresVector?: boolean;
  colorMode?: "RGB" | "CMYK" | "Spot";
}

export interface PrintMethodValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get constraints for a print method
 */
export function getPrintMethodConstraints(method: PrintMethod): PrintMethodConstraints {
  switch (method) {
    case "DTG":
      return {
        method: "DTG",
        allowGradients: true,
        minLineWidth: 2, // ~0.5pt at 300 DPI
        colorMode: "RGB",
      };
    
    case "Embroidery":
      return {
        method: "Embroidery",
        allowGradients: false,
        maxColors: 15,
        minLineWidth: 6, // ~1.5pt at 300 DPI
        minTextSize: 10,
        requiresVector: true,
        colorMode: "Spot",
      };
    
    case "Screen":
      return {
        method: "Screen",
        allowGradients: false,
        maxColors: 6,
        minLineWidth: 3,
        colorMode: "Spot",
      };
    
    case "Sublimation":
      return {
        method: "Sublimation",
        allowGradients: true,
        colorMode: "CMYK",
      };
    
    case "Vinyl":
      return {
        method: "Vinyl",
        allowGradients: false,
        maxColors: 1,
        minLineWidth: 4,
        minTextSize: 8,
        requiresVector: true,
        colorMode: "Spot",
      };
  }
}

/**
 * Validate if a node meets print method constraints
 */
export function validateNodeForPrintMethod(
  node: Node,
  method: PrintMethod
): PrintMethodValidation {
  const constraints = getPrintMethodConstraints(method);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check gradients
  if (!constraints.allowGradients) {
    if (node.type === "text" || node.type === "shape") {
      const fill = (node as any).fill;
      if (fill?.type === "linear") {
        errors.push(`${method} does not support gradients. Use solid colors only.`);
      }
    }
  }

  // Check line width for paths and strokes
  if (constraints.minLineWidth) {
    if (node.type === "path") {
      const stroke = (node as any).stroke;
      if (stroke && stroke.width < constraints.minLineWidth) {
        warnings.push(
          `Line width too small for ${method}. Minimum: ${constraints.minLineWidth}px at 300 DPI.`
        );
      }
    }
  }

  // Check text size
  if (constraints.minTextSize && node.type === "text") {
    const fontSize = (node as any).fontSize;
    if (fontSize < constraints.minTextSize) {
      warnings.push(
        `Text size too small for ${method}. Minimum: ${constraints.minTextSize}pt.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract unique colors from a node
 */
export function extractNodeColors(node: Node): string[] {
  const colors = new Set<string>();

  if (node.type === "text" || node.type === "shape") {
    const fill = (node as any).fill;
    if (fill?.type === "solid" && fill.color) {
      colors.add(fill.color);
    } else if (fill?.type === "linear" && fill.stops) {
      fill.stops.forEach((stop: any) => colors.add(stop.color));
    }

    const stroke = (node as any).stroke;
    if (stroke?.color) {
      colors.add(stroke.color);
    }
  } else if (node.type === "path") {
    const stroke = (node as any).stroke;
    if (stroke?.color) {
      colors.add(stroke.color);
    }
  }

  return Array.from(colors);
}

/**
 * Validate color count for a print method
 */
export function validateColorCount(
  nodes: Node[],
  method: PrintMethod
): PrintMethodValidation {
  const constraints = getPrintMethodConstraints(method);
  const allColors = new Set<string>();
  
  nodes.forEach(node => {
    extractNodeColors(node).forEach(color => allColors.add(color));
  });

  const colorCount = allColors.size;
  const errors: string[] = [];

  if (constraints.maxColors && colorCount > constraints.maxColors) {
    errors.push(
      `Too many colors for ${method}. Used: ${colorCount}, Maximum: ${constraints.maxColors}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}
