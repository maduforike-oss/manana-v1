// Professional Garment Library with HD Visuals and Color Options

import tshirtBlackFront from '@/assets/garments/tshirt-black-front.jpg';
import tshirtWhiteFront from '@/assets/garments/tshirt-white-front.jpg';
import hoodieCharcoalFront from '@/assets/garments/hoodie-charcoal-front.jpg';
import crewneckHeatherFront from '@/assets/garments/crewneck-heather-front.jpg';
import toteCanvasFront from '@/assets/garments/tote-canvas-front.jpg';
import capBlackFront from '@/assets/garments/cap-black-front.jpg';
import poloNavyFront from '@/assets/garments/polo-navy-front.jpg';
import vneckWhiteFront from '@/assets/garments/vneck-white-front.jpg';
import zipHoodieCharcoalFront from '@/assets/garments/zip-hoodie-charcoal-front.jpg';
import pulloverBlackFront from '@/assets/garments/pullover-black-front.jpg';
import buttonShirtWhiteFront from '@/assets/garments/button-shirt-white-front.jpg';
import denimJacketBlueFront from '@/assets/garments/denim-jacket-blue-front.jpg';
import bomberBlackFront from '@/assets/garments/bomber-black-front.jpg';
import beanieBlackFront from '@/assets/garments/beanie-black-front.jpg';
import snapbackNavyFront from '@/assets/garments/snapback-navy-front.jpg';
import truckerBlackFront from '@/assets/garments/trucker-black-front.jpg';
import apronWhiteFront from '@/assets/garments/apron-white-front.jpg';
import onesieWhiteFront from '@/assets/garments/onesie-white-front.jpg';
import womensTeePinkFront from '@/assets/garments/womens-tee-pink-front.jpg';
import womensTankWhiteFront from '@/assets/garments/womens-tank-white-front.jpg';
import performanceBlackFront from '@/assets/garments/performance-black-front.jpg';
import longsleeveHeatherFront from '@/assets/garments/longsleeve-heather-front.jpg';

// Load any images dropped into src/assets/custom at build time.
// as: 'url' means Vite will return the resolved URL string.
const customFiles = import.meta.glob('@/assets/custom/*.{png,jpg,jpeg}', { eager: true, as: 'url' });

interface CustomMap { [id: string]: { [side: string]: string } }
const customImageMap: CustomMap = {};

// Build a map: { 'tshirt': { front: '...url...', back: '...url...' }, ... }
for (const [path, url] of Object.entries(customFiles)) {
  const filename = path.split('/').pop()!.toLowerCase();
  const [id, sideWithExt] = filename.split('-', 2);
  const side = sideWithExt.split('.')[0]; // front, back, etc.
  if (!customImageMap[id]) customImageMap[id] = {};
  customImageMap[id][side] = url as string;
}

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
  // Polo Shirts
  {
    id: 'polo',
    name: 'Polo Shirt',
    category: 'Basics',
    popular: true,
    description: 'Classic polo shirt with collar and button placket',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 24.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['navy', 'black', 'white', 'charcoal', 'royal-blue', 'forest-green', 'burgundy'].includes(c.id)
    ),
    images: {
      front: poloNavyFront,
    },
    specs: {
      material: '100% Pique Cotton',
      weight: '6.1 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'vneck',
    name: 'V-Neck T-Shirt',
    category: 'Basics',
    popular: true,
    description: 'Classic v-neck t-shirt with flattering neckline',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 17.99,
    colors: PROFESSIONAL_COLORS,
    images: {
      front: vneckWhiteFront,
    },
    specs: {
      material: '100% Ring-Spun Cotton',
      weight: '4.3 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer'],
    },
  },
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
      front: longsleeveHeatherFront,
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
      front: womensTankWhiteFront,
    },
    specs: {
      material: '100% Combed Ring-Spun Cotton',
      weight: '4.2 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer'],
    },
  },
  // Outerwear
  {
    id: 'zip-hoodie',
    name: 'Zip-Up Hoodie',
    category: 'Outerwear',
    popular: true,
    description: 'Full-zip hoodie with drawstring hood and kangaroo pocket',
    printAreas: ['Front Center', 'Back Center', 'Left Chest', 'Hood'],
    basePrice: 42.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'heather-gray', 'navy', 'forest-green', 'burgundy'].includes(c.id)
    ),
    images: {
      front: zipHoodieCharcoalFront,
    },
    specs: {
      material: '80% Cotton, 20% Polyester Fleece',
      weight: '8.5 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'pullover',
    name: 'Pullover Sweatshirt',
    category: 'Outerwear',
    popular: false,
    description: 'Classic pullover sweatshirt with ribbed cuffs',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 32.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'heather-gray', 'navy', 'white', 'burgundy'].includes(c.id)
    ),
    images: {
      front: pulloverBlackFront,
    },
    specs: {
      material: '50% Cotton, 50% Polyester',
      weight: '8.0 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'button-shirt',
    name: 'Button-Up Shirt',
    category: 'Professional',
    popular: false,
    description: 'Professional dress shirt with button-down collar',
    printAreas: ['Left Chest', 'Back Center'],
    basePrice: 39.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['white', 'light-blue', 'charcoal', 'navy'].includes(c.id)
    ),
    images: {
      front: buttonShirtWhiteFront,
    },
    specs: {
      material: '60% Cotton, 40% Polyester',
      weight: '4.5 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Embroidery', 'Heat Transfer'],
    },
  },
  {
    id: 'denim-jacket',
    name: 'Denim Jacket',
    category: 'Outerwear',
    popular: false,
    description: 'Classic denim jacket with button front and chest pockets',
    printAreas: ['Back Center', 'Left Chest'],
    basePrice: 49.99,
    colors: [
      { id: 'light-wash', name: 'Light Wash', hex: '#B0C4DE' },
      { id: 'dark-wash', name: 'Dark Wash', hex: '#2F4F4F' },
      { id: 'black-denim', name: 'Black Denim', hex: '#1C1C1C' },
    ],
    images: {
      front: denimJacketBlueFront,
    },
    specs: {
      material: '100% Cotton Denim',
      weight: '12 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'bomber-jacket',
    name: 'Bomber Jacket',
    category: 'Outerwear',
    popular: false,
    description: 'Modern bomber jacket with ribbed cuffs and hem',
    printAreas: ['Back Center', 'Left Chest', 'Sleeve'],
    basePrice: 54.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'navy', 'olive', 'burgundy'].includes(c.id)
    ),
    images: {
      front: bomberBlackFront,
    },
    specs: {
      material: '100% Polyester',
      weight: '6.5 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'Heat Transfer', 'Embroidery'],
    },
  },
  // Headwear
  {
    id: 'beanie',
    name: 'Beanie',
    category: 'Accessories',
    popular: true,
    description: 'Warm knit beanie hat perfect for cold weather',
    printAreas: ['Front Panel'],
    basePrice: 14.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'charcoal', 'navy', 'heather-gray', 'burgundy', 'forest-green'].includes(c.id)
    ),
    images: {
      front: beanieBlackFront,
    },
    specs: {
      material: '100% Acrylic Knit',
      weight: 'One Size',
      sizes: ['One Size Fits Most'],
      printMethods: ['Embroidery', 'Heat Transfer'],
    },
  },
  {
    id: 'snapback',
    name: 'Snapback Cap',
    category: 'Accessories',
    popular: true,
    description: 'Flat-brimmed snapback cap with adjustable closure',
    printAreas: ['Front Panel', 'Back Panel', 'Side Panel'],
    basePrice: 22.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'white', 'navy', 'charcoal', 'royal-blue', 'red'].includes(c.id)
    ),
    images: {
      front: snapbackNavyFront,
    },
    specs: {
      material: '100% Cotton Twill',
      weight: 'Structured Crown',
      sizes: ['One Size Fits Most'],
      printMethods: ['Embroidery', 'Heat Transfer', 'Screen Print'],
    },
  },
  {
    id: 'trucker-hat',
    name: 'Trucker Hat',
    category: 'Accessories',
    popular: false,
    description: 'Classic trucker hat with mesh back and foam front',
    printAreas: ['Front Panel', 'Back Panel'],
    basePrice: 19.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'white', 'navy', 'red', 'royal-blue'].includes(c.id)
    ),
    images: {
      front: truckerBlackFront,
    },
    specs: {
      material: 'Foam Front, Mesh Back',
      weight: 'Mid-Profile',
      sizes: ['One Size Fits Most'],
      printMethods: ['Embroidery', 'Heat Transfer', 'Screen Print'],
    },
  },
  // Specialty Items
  {
    id: 'apron',
    name: 'Kitchen Apron',
    category: 'Specialty',
    popular: false,
    description: 'Professional kitchen apron with adjustable neck and waist ties',
    printAreas: ['Front Center', 'Chest Area'],
    basePrice: 16.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['white', 'black', 'navy', 'burgundy', 'forest-green'].includes(c.id)
    ),
    images: {
      front: apronWhiteFront,
    },
    specs: {
      material: '65% Polyester, 35% Cotton',
      weight: '7.5 oz',
      sizes: ['One Size'],
      printMethods: ['Screen Print', 'Heat Transfer', 'Embroidery'],
    },
  },
  {
    id: 'onesie',
    name: 'Baby Onesie',
    category: 'Baby & Kids',
    popular: false,
    description: 'Soft baby onesie with lap shoulder design',
    printAreas: ['Front Center', 'Back Center'],
    basePrice: 11.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['white', 'pink', 'light-blue', 'yellow', 'mint'].includes(c.id)
    ),
    images: {
      front: onesieWhiteFront,
    },
    specs: {
      material: '100% Combed Ring-Spun Cotton',
      weight: '4.5 oz',
      sizes: ['Newborn', '6M', '12M', '18M', '24M'],
      printMethods: ['DTG', 'Heat Transfer'],
    },
  },
  {
    id: 'womens-fitted-tee',
    name: "Women's Fitted Tee",
    category: "Women's",
    popular: true,
    description: 'Fitted women\'s t-shirt with flattering silhouette',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 17.99,
    colors: PROFESSIONAL_COLORS,
    images: {
      front: womensTeePinkFront,
    },
    specs: {
      material: '100% Ring-Spun Cotton',
      weight: '4.2 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      printMethods: ['Screen Print', 'DTG', 'Heat Transfer'],
    },
  },
  {
    id: 'performance-shirt',
    name: 'Performance Shirt',
    category: 'Athletic',
    popular: false,
    description: 'Moisture-wicking athletic performance shirt',
    printAreas: ['Front Center', 'Back Center', 'Left Chest'],
    basePrice: 26.99,
    colors: PROFESSIONAL_COLORS.filter(c => 
      ['black', 'white', 'navy', 'royal-blue', 'red', 'forest-green'].includes(c.id)
    ),
    images: {
      front: performanceBlackFront,
    },
    specs: {
      material: '100% Polyester Performance',
      weight: '3.8 oz',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      printMethods: ['DTG', 'Heat Transfer', 'Sublimation'],
    },
  },
];

// Helper function to merge custom images
function mergeCustomImages(g: GarmentType): GarmentType {
  const custom = customImageMap[g.id];
  if (!custom) return g;
  return {
    ...g,
    images: {
      ...g.images,
      ...custom, // overrides front/back/side if provided
    },
  };
}

// Helper functions
export const getGarmentById = (id: string): GarmentType | undefined => {
  const garment = GARMENT_TYPES.find(garment => garment.id === id);
  return garment ? mergeCustomImages(garment) : undefined;
};

export const getGarmentsByCategory = (category: string): GarmentType[] => {
  if (category === 'All') return GARMENT_TYPES.map(mergeCustomImages);
  return GARMENT_TYPES.filter(garment => garment.category === category).map(mergeCustomImages);
};

export const getPopularGarments = (): GarmentType[] => {
  return GARMENT_TYPES.filter(garment => garment.popular).map(mergeCustomImages);
};

export const getColorByGarmentAndId = (garmentId: string, colorId: string): GarmentColor | undefined => {
  const garment = getGarmentById(garmentId);
  return garment?.colors.find(color => color.id === colorId);
};