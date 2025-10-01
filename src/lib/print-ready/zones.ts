/**
 * Print zone management with physical unit support
 */

import { PhysicalDimensions, PixelDimensions } from "./physicalUnits";

export type ZoneType = "safe" | "bleed" | "margin" | "no-go" | "print";

export interface PhysicalZone {
  id: string;
  name: string;
  type: ZoneType;
  physical: PhysicalDimensions;
  pixels: PixelDimensions;
  position: { x: number; y: number }; // pixels
  color: string;
  visible: boolean;
  locked?: boolean;
}

export interface ZoneConstraint {
  type: ZoneType;
  message: string;
  severity: "error" | "warning" | "info";
}

/**
 * Check if a point is within a zone
 */
export function isPointInZone(
  point: { x: number; y: number },
  zone: PhysicalZone
): boolean {
  return (
    point.x >= zone.position.x &&
    point.x <= zone.position.x + zone.pixels.width &&
    point.y >= zone.position.y &&
    point.y <= zone.position.y + zone.pixels.height
  );
}

/**
 * Check if a rectangle overlaps with a zone
 */
export function isRectInZone(
  rect: { x: number; y: number; width: number; height: number },
  zone: PhysicalZone
): boolean {
  return !(
    rect.x + rect.width < zone.position.x ||
    rect.x > zone.position.x + zone.pixels.width ||
    rect.y + rect.height < zone.position.y ||
    rect.y > zone.position.y + zone.pixels.height
  );
}

/**
 * Validate if a design element respects zone constraints
 */
export function validateZoneConstraints(
  element: { x: number; y: number; width: number; height: number },
  zones: PhysicalZone[]
): ZoneConstraint[] {
  const constraints: ZoneConstraint[] = [];

  const safeZone = zones.find((z) => z.type === "safe");
  const noGoZones = zones.filter((z) => z.type === "no-go");
  const bleedZone = zones.find((z) => z.type === "bleed");

  // Check if element is outside safe zone
  if (safeZone && !isRectInZone(element, safeZone)) {
    constraints.push({
      type: "safe",
      message: "Element extends outside safe print area",
      severity: "warning",
    });
  }

  // Check if element overlaps with no-go zones
  for (const noGo of noGoZones) {
    if (isRectInZone(element, noGo)) {
      constraints.push({
        type: "no-go",
        message: `Element overlaps with restricted area: ${noGo.name}`,
        severity: "error",
      });
    }
  }

  // Check if element extends beyond bleed
  if (bleedZone && !isRectInZone(element, bleedZone)) {
    constraints.push({
      type: "bleed",
      message: "Element extends beyond bleed area - will be trimmed",
      severity: "error",
    });
  }

  return constraints;
}

/**
 * Get zone display properties
 */
export function getZoneStyle(type: ZoneType): {
  strokeColor: string;
  fillOpacity: number;
  strokeWidth: number;
  strokeDashArray?: number[];
} {
  switch (type) {
    case "safe":
      return {
        strokeColor: "hsl(var(--primary))",
        fillOpacity: 0.05,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      };
    case "bleed":
      return {
        strokeColor: "hsl(var(--destructive))",
        fillOpacity: 0,
        strokeWidth: 1,
        strokeDashArray: [3, 3],
      };
    case "margin":
      return {
        strokeColor: "hsl(var(--muted-foreground))",
        fillOpacity: 0,
        strokeWidth: 1,
        strokeDashArray: [2, 2],
      };
    case "no-go":
      return {
        strokeColor: "hsl(var(--destructive))",
        fillOpacity: 0.1,
        strokeWidth: 2,
      };
    case "print":
      return {
        strokeColor: "hsl(var(--accent))",
        fillOpacity: 0,
        strokeWidth: 2,
      };
  }
}
