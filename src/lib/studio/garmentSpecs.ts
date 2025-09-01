export type Orientation = "front" | "back" | "left" | "right";

export interface GarmentSpec {
  size: { w: number; h: number }; // px
  dpi: number;
  safeArea: { x: number; y: number; w: number; h: number }; // px
  angle: "front" | "back" | "left" | "right";
}

export function buildSpec(input: { garmentId: string; orientation: Orientation }): GarmentSpec {
  // Keep it consistent; you can vary by garment later.
  const size = { w: 2048, h: 2048 };
  const margin = 256; // safe inset
  return {
    size,
    dpi: 300,
    safeArea: { x: margin, y: margin, w: size.w - margin * 2, h: size.h - margin * 2 },
    angle: input.orientation,
  };
}

// Standard garment specs for consistent generation
export const GARMENT_NAMES: Record<string, string> = {
  'tshirt': 'T-Shirt',
  't-shirt': 'T-Shirt',
  'hoodie': 'Hoodie',
  'crewneck': 'Crewneck',
  'polo': 'Polo',
  'longsleeve': 'Long Sleeve',
  'long-sleeve-tee': 'Long Sleeve'
};

export const getGarmentName = (garmentId: string): string => {
  return GARMENT_NAMES[garmentId] || 'T-Shirt';
};