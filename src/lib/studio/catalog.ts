export interface CatalogPrintArea {
  unit: "mm";
  safe: Array<{ x: number; y: number }>;
  mmToPx: number;
}

export interface CatalogGarmentView {
  mockup: string;
}

export interface CatalogGarmentColor {
  name: string;
  hex: string;
  views: {
    front?: CatalogGarmentView;
    back?: CatalogGarmentView;
    side?: CatalogGarmentView;
  };
  printArea: CatalogPrintArea;
}

export interface CatalogGarment {
  slug: string;
  name: string;
  colors: CatalogGarmentColor[];
  sizes: string[];
}

export interface GarmentCatalog {
  dpi: number;
  garments: CatalogGarment[];
}

// Default catalog data
export const DEFAULT_CATALOG: GarmentCatalog = {
  "dpi": 300,
  "garments": [
    {
      "slug": "t-shirt",
      "name": "T-Shirt",
      "colors": [
        {
          "name": "White",
          "hex": "#FFFFFF",
          "views": {
            "front": { "mockup": "/catalog/t-shirt/white/front.png" },
            "back":  { "mockup": "/catalog/t-shirt/white/back.png" }
          },
          "printArea": {
            "unit": "mm",
            "safe": [ {"x":-140,"y":-200},{"x":140,"y":-200},{"x":140,"y":200},{"x":-140,"y":200} ],
            "mmToPx": 3.543307
          }
        }
      ],
      "sizes": ["S","M","L","XL","XXL"]
    },
    {
      "slug": "hoodie",
      "name": "Hoodie (Pullover)",
      "colors": [
        {
          "name": "White",
          "hex": "#FFFFFF",
          "views": {
            "front": { "mockup": "/catalog/hoodie/white/front.png" }
          },
          "printArea": {
            "unit": "mm",
            "safe": [ {"x":-140,"y":-190},{"x":140,"y":-190},{"x":140,"y":190},{"x":-140,"y":190} ],
            "mmToPx": 3.543307
          }
        }
      ],
      "sizes": ["S","M","L","XL","XXL"]
    }
  ]
};

// Catalog utilities
export function getCatalogGarment(slug: string): CatalogGarment | undefined {
  return DEFAULT_CATALOG.garments.find(g => g.slug === slug);
}

export function getCatalogGarmentColor(slug: string, colorName: string): CatalogGarmentColor | undefined {
  const garment = getCatalogGarment(slug);
  return garment?.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
}

export function getCatalogImageUrl(slug: string, color: string, orientation: "front" | "back" | "side"): string | null {
  const garmentColor = getCatalogGarmentColor(slug, color);
  return garmentColor?.views[orientation]?.mockup || null;
}

export function getPrintArea(slug: string, color: string): CatalogPrintArea | null {
  const garmentColor = getCatalogGarmentColor(slug, color);
  return garmentColor?.printArea || null;
}