// Professional Garment Library with HD Visuals and Color Options

import tshirtBlackFront from '@/assets/garments/tshirt-black-front.jpg';
import tshirtWhiteFront from '@/assets/garments/tshirt-white-front.jpg';
import hoodieCharcoalFront from '@/assets/garments/hoodie-charcoal-front.jpg';
import crewneckHeatherFront from '@/assets/garments/crewneck-heather-front.jpg';
import toteCanvasFront from '@/assets/garments/tote-canvas-front.jpg';
import capBlackFront from '@/assets/garments/cap-black-front.jpg';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  fabric?: string;
  popular?: boolean;
}

export interface GarmentType {
  id: string;
  name: string;
  category: string;
  popular: boolean;
  description: string;
  printAreas: string[];
  basePrice: number;
  colors: GarmentColor[];
  images: {
    front: string;
    back?: string;
    side?: string;
  };
  specs: {
    material: string;
    weight: string;
    sizes: string[];
    printMethods: string[];
  };
}

// Professional Color Palettes
export const PROFESSIONAL_COLORS: GarmentColor[] = [
  { id: 'black', name: 'Black', hex: '#000000', popular: true },
  { id: 'white', name: 'White', hex: '#FFFFFF', popular: true },
  { id: 'charcoal', name: 'Charcoal', hex: '#36454F', popular: true },
  { id: 'heather-gray', name: 'Heather Gray', hex: '#B8B8B8', fabric: 'heather', popular: true },
  { id: 'navy', name: 'Navy', hex: '#1A237E', popular: true },
  { id: 'forest-green', name: 'Forest Green', hex: '#355E3B', popular: false },
  { id: 'burgundy', name: 'Burgundy', hex: '#800020', popular: false },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#4169E1', popular: false },
  { id: 'maroon', name: 'Maroon', hex: '#800000', popular: false },
  { id: 'olive', name: 'Olive', hex: '#808000', popular: false },
  { id: 'purple', name: 'Purple', hex: '#800080', popular: false },
  { id: 'orange', name: 'Orange', hex: '#FFA500', popular: false },
  { id: 'red', name: 'Red', hex: '#DC143C', popular: true },
  { id: 'pink', name: 'Pink', hex: '#FFC0CB', popular: false },
  { id: 'yellow', name: 'Yellow', hex: '#FFD700', popular: false },
  { id: 'light-blue', name: 'Light Blue', hex: '#87CEEB', popular: false },
  { id: 'mint', name: 'Mint', hex: '#98FB98', popular: false },
  { id: 'lavender', name: 'Lavender', hex: '#E6E6FA', popular: false },
  { id: 'sand', name: 'Sand', hex: '#F4A460', popular: false },
  { id: 'slate', name: 'Slate', hex: '#708090', popular: false },
];

// Garment Database
export const GARMENT_TYPES: GarmentType[] = [
  {
    id: 't-shirt',
    name: 'T-Shirt',
    category: 'Basics',
    popular: true,
    description: 'Premium cotton t-shirt perfect for everyday wear and custom designs',
    printAreas: ['Front Center', 'Back Center', 'Left Chest', 'Sleeve'],
    basePrice: 15.99,
    colors: PROFESSIONAL_COLORS,
    images: {
      front: tshirtBlackFront,
    },
    specs: {
      material: '100% Ring-Spun Cotton',
      weight: '4.3 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'Outerwear',
    popular: true,
    description: 'Cozy fleece hoodie with kangaroo pocket and adjustable hood',
    printAreas: ['Front Center', 'Back Center', 'Left Chest', 'Hood'],
    basePrice: 35.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'heather-gray', 'navy', 'forest-green', 'burgundy', 'white'].includes(c.id)
    ),
    images: {
      front: hoodieCharcoalFront,
    },
    specs: {
      material: '80% Cotton, 20% Polyester Fleece',
      weight: '8.5 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'crewneck',
    name: 'Crewneck',
    category: 'Outerwear',
    popular: false,
    description: 'Classic crewneck sweatshirt with ribbed cuffs and waistband',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 29.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'heather-gray', 'navy', 'white', 'burgundy', 'forest-green'].includes(c.id)
    ),
    images: {
      front: crewneckHeatherFront,
    },
    specs: {
      material: '50% Cotton, 50% Polyester',
      weight: '8.0 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'tote',
    name: 'Tote Bag',
    category: 'Accessories',
    popular: false,
    description: 'Durable canvas tote bag perfect for shopping and daily use',
    printAreas: ['Front Panel', 'Back Panel'],
    basePrice: 12.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['white', 'black', 'navy', 'forest-green', 'burgundy', 'sand'].includes(c.id)
    ),
    images: {
      front: toteCanvasFront,
    },
    specs: {
      material: '100% Cotton Canvas',
      weight: '12 oz',
      sizes: ['One Size (15"x16")'],
      printMethods: ['Screen Print', 'Heat Transfer'],
    },
  },
  {
    id: 'cap',
    name: 'Baseball Cap',
    category: 'Accessories',
    popular: true,
    description: 'Classic 6-panel baseball cap with adjustable strap',
    printAreas: ['Front Panel', 'Back Panel', 'Side Panel'],
    basePrice: 18.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'white', 'navy', 'charcoal', 'royal-blue', 'red', 'forest-green'].includes(c.id)
    ),
    images: {
      front: capBlackFront,
    },
    specs: {
      material: '100% Cotton Twill',
      weight: 'Mid-Profile',
      sizes: ['One Size Fits Most'],
      printMethods: ['Embroidery', 'Heat Transfer', 'Screen Print'],
    },
  },
  // Extended garment types with placeholder images for now
  {
    id: 'long-sleeve-tee',
    name: 'Long Sleeve Tee',
    category: 'Basics',
    popular: true,
    description: 'Comfortable long sleeve t-shirt for cooler weather',
    printAreas: ['Front Center', 'Back Center', 'Left Chest', 'Sleeve'],
    basePrice: 21.99,
    colors: PROFESSIONAL_COLORS,
    images: {
      front: tshirtBlackFront, // Using t-shirt as placeholder
    },
    specs: {
      material: '100% Ring-Spun Cotton',
      weight: '4.5 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'tank',
    name: 'Tank Top',
    category: 'Basics',
    popular: false,
    description: 'Lightweight tank top perfect for summer designs',
    printAreas: ['Front Center', 'Back Center'],
    basePrice: 13.99,
    colors: PROFESSIONAL_COLORS,
    images: {
      front: tshirtWhiteFront, // Using t-shirt as placeholder
    },
    specs: {
      material: '100% Combed Ring-Spun Cotton',
      weight: '4.2 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer'],
    },
  },
];

// Helper functions
export const getGarmentById = (id: string): GarmentType | undefined => {
  return GARMENT_TYPES.find(garment => garment.id === id);
};

export const getGarmentsByCategory = (category: string): GarmentType[] => {
  if (category === 'All') return GARMENT_TYPES;
  return GARMENT_TYPES.filter(garment => garment.category === category);
};

export const getPopularGarments = (): GarmentType[] => {
  return GARMENT_TYPES.filter(garment => garment.popular);
};

export const getColorByGarmentAndId = (garmentId: string, colorId: string): GarmentColor | undefined => {
  const garment = getGarmentById(garmentId);
  return garment?.colors.find(color => color.id === colorId);
};