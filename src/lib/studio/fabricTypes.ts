// Fabric type mapping for different garment types
export const GARMENT_FABRIC_MAPPING: Record<string, string> = {
  't-shirt': 'cotton',
  'tank': 'cotton',
  'v-neck': 'cotton',
  'long-sleeve': 'cotton',
  'polo': 'cotton',
  'hoodie': 'fleece',
  'pullover': 'fleece',
  'zip-hoodie': 'fleece',
  'crewneck': 'fleece',
  'jacket': 'polyester',
  'bomber': 'polyester',
  'denim-jacket': 'denim',
  'performance': 'performance',
  'athletic': 'performance',
  'cap': 'cotton',
  'beanie': 'cotton',
  'snapback': 'cotton',
  'trucker': 'cotton',
  'tote': 'cotton',
  'button-shirt': 'cotton',
  'apron': 'cotton',
  'onesie': 'cotton'
};

export const getFabricType = (garmentType: string): string => {
  const normalized = garmentType.toLowerCase().replace(/[-_\s]/g, '-');
  return GARMENT_FABRIC_MAPPING[normalized] || 'cotton';
};

export const FABRIC_PROPERTIES = {
  cotton: {
    displayName: 'Cotton',
    texture: 'soft, matte',
    printQuality: 'excellent',
    durability: 'high'
  },
  polyester: {
    displayName: 'Polyester',
    texture: 'smooth, slightly shiny',
    printQuality: 'good',
    durability: 'very high'
  },
  blend: {
    displayName: 'Cotton/Poly Blend',
    texture: 'soft with slight sheen',
    printQuality: 'excellent',
    durability: 'very high'
  },
  fleece: {
    displayName: 'Fleece',
    texture: 'soft, brushed',
    printQuality: 'good',
    durability: 'high'
  },
  denim: {
    displayName: 'Denim',
    texture: 'textured, sturdy',
    printQuality: 'limited',
    durability: 'very high'
  },
  performance: {
    displayName: 'Performance',
    texture: 'smooth, moisture-wicking',
    printQuality: 'good',
    durability: 'high'
  }
};