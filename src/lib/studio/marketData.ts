import { GARMENT_TYPES, GarmentType } from './garments';

export interface StudioGarmentData {
  id: string;
  name: string;
  garmentId: string;
  orientation: 'front' | 'back' | 'left' | 'right';
  fabric: string;
  baseColor: 'light' | 'dark' | 'colored';
  printArea: { width: number; height: number }; // in mm
  availableOrientations: string[];
  price: number;
  rating: number;
  tags: string[];
  featured: boolean;
  thumbSrc: string;
  dpi: number;
  safeArea: { x: number; y: number; w: number; h: number }; // in mm
  mmToPx: number;
  studioReady: string[]; // badges like "Large print area", "All orientations"
  likes: number;
  views: number;
  downloads: number;
  creator: string;
  avatar: string;
  shippingDays: string;
}

// Convert garment types to studio-ready market data
export function generateStudioMarketData(): StudioGarmentData[] {
  const marketData: StudioGarmentData[] = [];

  GARMENT_TYPES.forEach((garment: GarmentType) => {
    // For each popular color, create a market entry
    const colors = garment.colors.filter(c => c.popular || garment.colors.length <= 4);
    
    colors.forEach((color, index) => {
      const baseColor = determineBaseColor(color.hex);
      const printArea = getPrintAreaForGarment(garment.id);
      const studioReady = getStudioReadyBadges(garment, printArea);
      
      const marketItem: StudioGarmentData = {
        id: `${garment.id}-${color.id}-front`,
        name: `${color.name} ${garment.name}`,
        garmentId: garment.id,
        orientation: 'front',
        fabric: garment.specs.material,
        baseColor,
        printArea,
        availableOrientations: getAvailableOrientations(garment.id),
        price: garment.basePrice,
        rating: 4.3 + Math.random() * 0.7, // 4.3-5.0 range
        tags: getTagsForGarment(garment),
        featured: garment.popular && index === 0, // First popular color is featured
        thumbSrc: garment.images.front,
        dpi: 300,
        safeArea: { x: 20, y: 30, w: printArea.width - 40, h: printArea.height - 60 },
        mmToPx: 3.543307, // 300 DPI conversion
        studioReady,
        likes: Math.floor(Math.random() * 2000) + 100,
        views: Math.floor(Math.random() * 10000) + 500,
        downloads: Math.floor(Math.random() * 500) + 50,
        creator: getCreatorForCategory(garment.category),
        avatar: getCreatorAvatar(getCreatorForCategory(garment.category)),
        shippingDays: getShippingEstimate(garment.category)
      };

      marketData.push(marketItem);
    });
  });

  return marketData.sort((a, b) => {
    // Sort featured first, then by popularity metrics
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (b.likes + b.views / 10) - (a.likes + a.views / 10);
  });
}

function determineBaseColor(hex: string): 'light' | 'dark' | 'colored' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  if (brightness > 200) return 'light';
  if (brightness < 60) return 'dark';
  return 'colored';
}

function getPrintAreaForGarment(garmentId: string): { width: number; height: number } {
  const printAreas: Record<string, { width: number; height: number }> = {
    't-shirt': { width: 280, height: 400 }, // 10x14 inches
    'hoodie': { width: 280, height: 380 },
    'crewneck': { width: 280, height: 380 },
    'polo': { width: 280, height: 360 },
    'vneck': { width: 280, height: 380 },
    'long-sleeve-tee': { width: 280, height: 400 },
    'tank': { width: 250, height: 350 },
    'zip-hoodie': { width: 280, height: 380 },
    'pullover': { width: 280, height: 380 },
    'button-shirt': { width: 200, height: 250 }, // Smaller chest area
    'denim-jacket': { width: 280, height: 350 },
    'bomber-jacket': { width: 280, height: 320 },
    'tote': { width: 300, height: 350 },
    'cap': { width: 120, height: 80 },
    'beanie': { width: 100, height: 60 },
    'snapback': { width: 120, height: 80 },
    'trucker-hat': { width: 120, height: 80 },
    'apron': { width: 250, height: 300 },
    'onesie': { width: 180, height: 250 },
    'womens-fitted-tee': { width: 260, height: 380 }
  };
  
  return printAreas[garmentId] || { width: 280, height: 400 };
}

function getAvailableOrientations(garmentId: string): string[] {
  // Most garments have front/back
  const hasBack = !['cap', 'beanie', 'snapback', 'trucker-hat', 'apron'].includes(garmentId);
  const orientations = ['front'];
  if (hasBack) orientations.push('back');
  
  // Some have side views
  if (['t-shirt', 'hoodie', 'polo', 'long-sleeve-tee'].includes(garmentId)) {
    orientations.push('left', 'right');
  }
  
  return orientations;
}

function getStudioReadyBadges(garment: GarmentType, printArea: { width: number; height: number }): string[] {
  const badges: string[] = [];
  
  // Large print area
  if (printArea.width >= 280 && printArea.height >= 380) {
    badges.push('Large print area');
  }
  
  // All orientations
  const orientations = getAvailableOrientations(garment.id);
  if (orientations.length >= 4) {
    badges.push('All orientations');
  }
  
  // Dark base for contrast
  const darkColors = garment.colors.filter(c => 
    ['black', 'charcoal', 'navy'].includes(c.id)
  );
  if (darkColors.length > 0) {
    badges.push('Dark base');
  }
  
  // Premium fabric
  if (garment.specs.material.includes('Ring-Spun') || garment.specs.material.includes('Combed')) {
    badges.push('Premium fabric');
  }
  
  // Multiple print methods
  if (garment.specs.printMethods.length >= 3) {
    badges.push('Multi-method');
  }
  
  return badges;
}

function getTagsForGarment(garment: GarmentType): string[] {
  const categoryTags: Record<string, string[]> = {
    'Basics': ['minimalist', 'versatile', 'everyday'],
    'Outerwear': ['layering', 'streetwear', 'casual'],
    'Accessories': ['statement', 'branding', 'functional'],
    'Professional': ['corporate', 'formal', 'business'],
    'Specialty': ['unique', 'creative', 'niche'],
    'Baby & Kids': ['cute', 'soft', 'gift'],
    "Women's": ['fitted', 'fashionable', 'trendy']
  };
  
  const tags = categoryTags[garment.category] || ['custom'];
  
  // Add fabric-based tags
  if (garment.specs.material.includes('Cotton')) tags.push('cotton');
  if (garment.specs.material.includes('Polyester')) tags.push('durable');
  if (garment.specs.material.includes('Fleece')) tags.push('cozy');
  
  // Add print method tags
  if (garment.specs.printMethods.includes('DTG')) tags.push('full-color');
  if (garment.specs.printMethods.includes('Embroidery')) tags.push('premium');
  
  return tags.slice(0, 4); // Limit to 4 tags
}

function getCreatorForCategory(category: string): string {
  const creators: Record<string, string> = {
    'Basics': 'Studio Essentials',
    'Outerwear': 'Urban Threads',
    'Accessories': 'Brand Focus',
    'Professional': 'Corporate Style',
    'Specialty': 'Creative Lab',
    'Baby & Kids': 'Little Designs',
    "Women's": 'Style Studio'
  };
  
  return creators[category] || 'Design Co';
}

function getCreatorAvatar(creator: string): string {
  const avatars: Record<string, string> = {
    'Studio Essentials': 'SE',
    'Urban Threads': 'UT',
    'Brand Focus': 'BF',
    'Corporate Style': 'CS',
    'Creative Lab': 'CL',
    'Little Designs': 'LD',
    'Style Studio': 'SS',
    'Design Co': 'DC'
  };
  
  return avatars[creator] || 'DC';
}

function getShippingEstimate(category: string): string {
  const estimates: Record<string, string> = {
    'Basics': '3-5 days',
    'Outerwear': '4-6 days',
    'Accessories': '2-4 days',
    'Professional': '3-5 days',
    'Specialty': '5-7 days',
    'Baby & Kids': '3-5 days',
    "Women's": '3-5 days'
  };
  
  return estimates[category] || '3-5 days';
}

// Filter presets for quick selection
export const FILTER_PRESETS = {
  'Streetwear Pack': {
    garmentTypes: ['t-shirt', 'hoodie', 'cap'],
    baseColors: ['dark'],
    tags: ['streetwear', 'urban']
  },
  'Monochrome Bases': {
    garmentTypes: ['t-shirt', 'hoodie', 'crewneck'],
    baseColors: ['light', 'dark'],
    tags: ['minimalist']
  },
  'Logo-Friendly': {
    garmentTypes: ['t-shirt', 'hoodie'],
    baseColors: ['light'],
    tags: ['branding'],
    printAreaSize: 'large'
  },
  'Professional Set': {
    garmentTypes: ['polo', 'button-shirt'],
    baseColors: ['light', 'colored'],
    tags: ['corporate', 'business']
  }
} as const;