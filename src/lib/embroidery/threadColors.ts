/**
 * Embroidery thread color library
 * Based on common commercial thread standards (Madeira, Isacord, etc.)
 */

export interface ThreadColor {
  id: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  brand: "Madeira" | "Isacord" | "Robison-Anton" | "Generic";
  code: string;
}

export const THREAD_LIBRARY: ThreadColor[] = [
  // Whites & Neutrals
  { id: "t001", name: "Snow White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 }, brand: "Madeira", code: "1001" },
  { id: "t002", name: "Eggshell", hex: "#F0EAD6", rgb: { r: 240, g: 234, b: 214 }, brand: "Madeira", code: "1002" },
  { id: "t003", name: "Cream", hex: "#FFFDD0", rgb: { r: 255, g: 253, b: 208 }, brand: "Madeira", code: "1003" },
  { id: "t004", name: "Beige", hex: "#D4C5B9", rgb: { r: 212, g: 197, b: 185 }, brand: "Madeira", code: "1004" },
  { id: "t005", name: "Light Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 }, brand: "Madeira", code: "1005" },
  { id: "t006", name: "Gray", hex: "#808080", rgb: { r: 128, g: 128, b: 128 }, brand: "Madeira", code: "1006" },
  { id: "t007", name: "Charcoal", hex: "#36454F", rgb: { r: 54, g: 69, b: 79 }, brand: "Madeira", code: "1007" },
  { id: "t008", name: "Black", hex: "#000000", rgb: { r: 0, g: 0, b: 0 }, brand: "Madeira", code: "1008" },

  // Reds
  { id: "t010", name: "Light Pink", hex: "#FFB6C1", rgb: { r: 255, g: 182, b: 193 }, brand: "Madeira", code: "1010" },
  { id: "t011", name: "Pink", hex: "#FFC0CB", rgb: { r: 255, g: 192, b: 203 }, brand: "Madeira", code: "1011" },
  { id: "t012", name: "Rose", hex: "#FF007F", rgb: { r: 255, g: 0, b: 127 }, brand: "Madeira", code: "1012" },
  { id: "t013", name: "Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 }, brand: "Madeira", code: "1013" },
  { id: "t014", name: "Dark Red", hex: "#8B0000", rgb: { r: 139, g: 0, b: 0 }, brand: "Madeira", code: "1014" },
  { id: "t015", name: "Burgundy", hex: "#800020", rgb: { r: 128, g: 0, b: 32 }, brand: "Madeira", code: "1015" },
  { id: "t016", name: "Maroon", hex: "#800000", rgb: { r: 128, g: 0, b: 0 }, brand: "Madeira", code: "1016" },

  // Oranges & Yellows
  { id: "t020", name: "Peach", hex: "#FFDAB9", rgb: { r: 255, g: 218, b: 185 }, brand: "Isacord", code: "2020" },
  { id: "t021", name: "Coral", hex: "#FF7F50", rgb: { r: 255, g: 127, b: 80 }, brand: "Isacord", code: "2021" },
  { id: "t022", name: "Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 }, brand: "Isacord", code: "2022" },
  { id: "t023", name: "Dark Orange", hex: "#FF8C00", rgb: { r: 255, g: 140, b: 0 }, brand: "Isacord", code: "2023" },
  { id: "t024", name: "Light Yellow", hex: "#FFFFE0", rgb: { r: 255, g: 255, b: 224 }, brand: "Isacord", code: "2024" },
  { id: "t025", name: "Yellow", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 }, brand: "Isacord", code: "2025" },
  { id: "t026", name: "Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 }, brand: "Isacord", code: "2026" },
  { id: "t027", name: "Mustard", hex: "#FFDB58", rgb: { r: 255, g: 219, b: 88 }, brand: "Isacord", code: "2027" },

  // Greens
  { id: "t030", name: "Light Green", hex: "#90EE90", rgb: { r: 144, g: 238, b: 144 }, brand: "Robison-Anton", code: "3030" },
  { id: "t031", name: "Lime", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 }, brand: "Robison-Anton", code: "3031" },
  { id: "t032", name: "Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 }, brand: "Robison-Anton", code: "3032" },
  { id: "t033", name: "Forest Green", hex: "#228B22", rgb: { r: 34, g: 139, b: 34 }, brand: "Robison-Anton", code: "3033" },
  { id: "t034", name: "Dark Green", hex: "#006400", rgb: { r: 0, g: 100, b: 0 }, brand: "Robison-Anton", code: "3034" },
  { id: "t035", name: "Olive", hex: "#808000", rgb: { r: 128, g: 128, b: 0 }, brand: "Robison-Anton", code: "3035" },
  { id: "t036", name: "Mint", hex: "#98FF98", rgb: { r: 152, g: 255, b: 152 }, brand: "Robison-Anton", code: "3036" },

  // Blues
  { id: "t040", name: "Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 }, brand: "Madeira", code: "1040" },
  { id: "t041", name: "Sky Blue", hex: "#87CEEB", rgb: { r: 135, g: 206, b: 235 }, brand: "Madeira", code: "1041" },
  { id: "t042", name: "Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 }, brand: "Madeira", code: "1042" },
  { id: "t043", name: "Royal Blue", hex: "#4169E1", rgb: { r: 65, g: 105, b: 225 }, brand: "Madeira", code: "1043" },
  { id: "t044", name: "Navy Blue", hex: "#000080", rgb: { r: 0, g: 0, b: 128 }, brand: "Madeira", code: "1044" },
  { id: "t045", name: "Teal", hex: "#008080", rgb: { r: 0, g: 128, b: 128 }, brand: "Madeira", code: "1045" },
  { id: "t046", name: "Turquoise", hex: "#40E0D0", rgb: { r: 64, g: 224, b: 208 }, brand: "Madeira", code: "1046" },

  // Purples
  { id: "t050", name: "Lavender", hex: "#E6E6FA", rgb: { r: 230, g: 230, b: 250 }, brand: "Isacord", code: "2050" },
  { id: "t051", name: "Light Purple", hex: "#DDA0DD", rgb: { r: 221, g: 160, b: 221 }, brand: "Isacord", code: "2051" },
  { id: "t052", name: "Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 }, brand: "Isacord", code: "2052" },
  { id: "t053", name: "Violet", hex: "#8B00FF", rgb: { r: 139, g: 0, b: 255 }, brand: "Isacord", code: "2053" },
  { id: "t054", name: "Magenta", hex: "#FF00FF", rgb: { r: 255, g: 0, b: 255 }, brand: "Isacord", code: "2054" },

  // Browns
  { id: "t060", name: "Tan", hex: "#D2B48C", rgb: { r: 210, g: 180, b: 140 }, brand: "Generic", code: "4060" },
  { id: "t061", name: "Light Brown", hex: "#B5651D", rgb: { r: 181, g: 101, b: 29 }, brand: "Generic", code: "4061" },
  { id: "t062", name: "Brown", hex: "#8B4513", rgb: { r: 139, g: 69, b: 19 }, brand: "Generic", code: "4062" },
  { id: "t063", name: "Dark Brown", hex: "#654321", rgb: { r: 101, g: 67, b: 33 }, brand: "Generic", code: "4063" },
];

/**
 * Find the closest thread color to a given hex color
 */
export function findClosestThreadColor(hex: string): ThreadColor {
  const rgb = hexToRgb(hex);
  if (!rgb) return THREAD_LIBRARY[0]; // Default to white

  let closestColor = THREAD_LIBRARY[0];
  let minDistance = Infinity;

  for (const thread of THREAD_LIBRARY) {
    const distance = colorDistance(rgb, thread.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = thread;
    }
  }

  return closestColor;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Get unique thread colors from design
 */
export function getDesignThreadColors(colors: string[]): ThreadColor[] {
  const uniqueThreads = new Map<string, ThreadColor>();

  for (const hex of colors) {
    const thread = findClosestThreadColor(hex);
    uniqueThreads.set(thread.id, thread);
  }

  return Array.from(uniqueThreads.values());
}

/**
 * Check if design exceeds max thread colors
 */
export function validateThreadColorCount(
  colors: string[],
  maxColors: number = 15
): { valid: boolean; count: number; maxColors: number } {
  const threads = getDesignThreadColors(colors);
  return {
    valid: threads.length <= maxColors,
    count: threads.length,
    maxColors,
  };
}
