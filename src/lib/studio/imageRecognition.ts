import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser use
env.allowLocalModels = false;
env.useBrowserCache = true;

// Garment detection patterns based on visual characteristics
const GARMENT_PATTERNS = {
  't-shirt': {
    keywords: ['t-shirt', 'tshirt', 'tee', 'short sleeve', 'basic'],
    visualCues: ['short sleeves', 'round neck', 'loose fit'],
    aliases: ['tee', 'basic-tee', 'short-sleeve']
  },
  'polo': {
    keywords: ['polo', 'collared', 'golf shirt', 'pique'],
    visualCues: ['collar', 'button placket', 'short sleeves'],
    aliases: ['polo-shirt', 'golf-shirt']
  },
  'hoodie': {
    keywords: ['hoodie', 'sweatshirt', 'hooded', 'pullover'],
    visualCues: ['hood', 'kangaroo pocket', 'long sleeves'],
    aliases: ['hooded-sweatshirt', 'pullover-hoodie']
  },
  'zip-hoodie': {
    keywords: ['zip hoodie', 'zip-up', 'zipper', 'full zip'],
    visualCues: ['hood', 'zipper', 'front opening'],
    aliases: ['zip-up-hoodie', 'full-zip']
  },
  'crewneck': {
    keywords: ['crewneck', 'crew neck', 'sweatshirt', 'pullover'],
    visualCues: ['round neck', 'no hood', 'long sleeves', 'ribbed cuffs'],
    aliases: ['crew-neck', 'pullover']
  },
  'longsleeve': {
    keywords: ['long sleeve', 'longsleeve', 'long-sleeve tee'],
    visualCues: ['long sleeves', 'fitted', 'round neck'],
    aliases: ['long-sleeve', 'ls-tee']
  },
  'tank': {
    keywords: ['tank', 'tank top', 'sleeveless', 'vest'],
    visualCues: ['no sleeves', 'armholes', 'fitted'],
    aliases: ['tank-top', 'sleeveless']
  },
  'cap': {
    keywords: ['cap', 'hat', 'baseball cap', 'snapback'],
    visualCues: ['brim', 'crown', 'adjustable'],
    aliases: ['baseball-cap', 'snapback']
  }
};

const ORIENTATION_PATTERNS = {
  front: ['front', 'chest', 'logo area', 'buttons'],
  back: ['back', 'rear', 'spine', 'back view'],
  side: ['side', 'profile', 'left', 'right']
};

// Color detection for automatic color mapping
const COLOR_PATTERNS = {
  white: { keywords: ['white', 'cream', 'off-white'], hex: '#ffffff' },
  black: { keywords: ['black', 'charcoal', 'dark'], hex: '#000000' },
  gray: { keywords: ['gray', 'grey', 'heather'], hex: '#808080' },
  navy: { keywords: ['navy', 'dark blue', 'midnight'], hex: '#001f3f' },
  red: { keywords: ['red', 'crimson', 'scarlet'], hex: '#ff4136' },
  blue: { keywords: ['blue', 'royal', 'cerulean'], hex: '#0074d9' },
  green: { keywords: ['green', 'forest', 'emerald'], hex: '#2ecc40' }
};

export interface RecognitionResult {
  garmentType: string;
  confidence: number;
  orientation: 'front' | 'back' | 'side';
  suggestedFilename: string;
  detectedColor?: string;
  reasoning: string[];
}

export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  dominantColors: string[];
  features: string[];
}

/**
 * Analyzes an image file and attempts to recognize the garment type and orientation
 */
export const recognizeGarmentFromImage = async (
  file: File, 
  filename?: string
): Promise<RecognitionResult> => {
  try {
    const imageAnalysis = await analyzeImageFeatures(file);
    const filenameAnalysis = filename ? analyzeFilename(filename) : null;
    
    // Combine visual analysis with filename hints
    const garmentType = detectGarmentType(imageAnalysis, filenameAnalysis, filename);
    const orientation = detectOrientation(imageAnalysis, filenameAnalysis);
    const detectedColor = detectColor(imageAnalysis, filename);
    
    const suggestedFilename = generateFilename(garmentType, orientation);
    
    return {
      garmentType,
      confidence: calculateConfidence(imageAnalysis, filenameAnalysis),
      orientation,
      suggestedFilename,
      detectedColor,
      reasoning: generateReasoning(imageAnalysis, filenameAnalysis, garmentType, orientation)
    };
  } catch (error) {
    console.error('Error recognizing garment:', error);
    
    // Fallback to filename-based recognition
    const fallback = analyzeFilename(filename || file.name);
    return {
      garmentType: fallback?.garmentType || 't-shirt',
      confidence: 0.3,
      orientation: fallback?.orientation || 'front',
      suggestedFilename: generateFilename(fallback?.garmentType || 't-shirt', fallback?.orientation || 'front'),
      reasoning: ['Fallback to filename analysis due to image processing error']
    };
  }
};

/**
 * Analyzes image features using computer vision
 */
const analyzeImageFeatures = async (file: File): Promise<ImageAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const dominantColors = extractDominantColors(imageData);
      
      // Simple feature detection based on image properties
      const features = [];
      const aspectRatio = img.width / img.height;
      
      if (aspectRatio > 1.2) features.push('wide');
      if (aspectRatio < 0.8) features.push('tall');
      if (img.width > 800) features.push('high-res');
      
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio,
        dominantColors,
        features
      });
    };
    
    img.onerror = () => {
      resolve({
        width: 0,
        height: 0,
        aspectRatio: 1,
        dominantColors: [],
        features: []
      });
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Analyzes filename for garment type and orientation hints
 */
const analyzeFilename = (filename: string) => {
  const cleanName = filename.toLowerCase().replace(/[._-]/g, ' ');
  
  let garmentType = 't-shirt'; // default
  let orientation: 'front' | 'back' | 'side' = 'front'; // default
  
  // Check for garment type in filename
  for (const [type, pattern] of Object.entries(GARMENT_PATTERNS)) {
    const allKeywords = [...pattern.keywords, ...pattern.aliases];
    if (allKeywords.some(keyword => cleanName.includes(keyword))) {
      garmentType = type;
      break;
    }
  }
  
  // Check for orientation in filename
  for (const [orient, keywords] of Object.entries(ORIENTATION_PATTERNS)) {
    if (keywords.some(keyword => cleanName.includes(keyword))) {
      orientation = orient as 'front' | 'back' | 'side';
      break;
    }
  }
  
  return { garmentType, orientation };
};

/**
 * Detects garment type from combined analysis
 */
const detectGarmentType = (
  imageAnalysis: ImageAnalysis, 
  filenameAnalysis: any, 
  filename?: string
): string => {
  // Prioritize filename analysis if available
  if (filenameAnalysis?.garmentType && filenameAnalysis.garmentType !== 't-shirt') {
    return filenameAnalysis.garmentType;
  }
  
  // Use image analysis as backup
  const { aspectRatio, features } = imageAnalysis;
  
  // Simple heuristics based on image properties
  if (features.includes('wide') && aspectRatio > 1.5) {
    return 'cap'; // Caps tend to be wider
  }
  
  if (aspectRatio < 0.9) {
    return 'longsleeve'; // Tall images often show long sleeves
  }
  
  // Default fallback
  return filenameAnalysis?.garmentType || 't-shirt';
};

/**
 * Detects orientation from analysis
 */
const detectOrientation = (
  imageAnalysis: ImageAnalysis, 
  filenameAnalysis: any
): 'front' | 'back' | 'side' => {
  return filenameAnalysis?.orientation || 'front';
};

/**
 * Detects color from image and filename
 */
const detectColor = (imageAnalysis: ImageAnalysis, filename?: string): string | undefined => {
  if (filename) {
    const cleanName = filename.toLowerCase();
    for (const [color, pattern] of Object.entries(COLOR_PATTERNS)) {
      if (pattern.keywords.some(keyword => cleanName.includes(keyword))) {
        return color;
      }
    }
  }
  
  // Could analyze dominant colors from imageAnalysis.dominantColors
  return undefined;
};

/**
 * Generates appropriate filename based on recognition
 */
const generateFilename = (garmentType: string, orientation: string): string => {
  return `${garmentType}-${orientation}.png`;
};

/**
 * Calculates confidence score
 */
const calculateConfidence = (imageAnalysis: ImageAnalysis, filenameAnalysis: any): number => {
  let confidence = 0.5; // base confidence
  
  if (filenameAnalysis?.garmentType) confidence += 0.3;
  if (filenameAnalysis?.orientation) confidence += 0.2;
  if (imageAnalysis.features.length > 0) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
};

/**
 * Generates human-readable reasoning
 */
const generateReasoning = (
  imageAnalysis: ImageAnalysis, 
  filenameAnalysis: any, 
  garmentType: string, 
  orientation: string
): string[] => {
  const reasoning = [];
  
  if (filenameAnalysis?.garmentType) {
    reasoning.push(`Detected '${garmentType}' from filename analysis`);
  }
  
  if (filenameAnalysis?.orientation) {
    reasoning.push(`Detected '${orientation}' orientation from filename`);
  }
  
  if (imageAnalysis.aspectRatio > 1.5) {
    reasoning.push(`Wide aspect ratio (${imageAnalysis.aspectRatio.toFixed(2)}) suggests cap or wide garment`);
  }
  
  if (imageAnalysis.aspectRatio < 0.9) {
    reasoning.push(`Tall aspect ratio (${imageAnalysis.aspectRatio.toFixed(2)}) suggests long-sleeve garment`);
  }
  
  reasoning.push(`Generated filename: ${generateFilename(garmentType, orientation)}`);
  
  return reasoning;
};

/**
 * Extracts dominant colors from image data
 */
const extractDominantColors = (imageData: ImageData | undefined): string[] => {
  if (!imageData) return [];
  
  const colorMap = new Map<string, number>();
  const data = imageData.data;
  
  // Sample every 10th pixel to avoid performance issues
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    if (alpha > 128) { // Only count non-transparent pixels
      const color = `rgb(${r},${g},${b})`;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
  }
  
  // Return top 3 colors
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color);
};

/**
 * Batch recognition for multiple files
 */
export const recognizeMultipleGarments = async (files: File[]): Promise<RecognitionResult[]> => {
  const results = await Promise.all(
    files.map(file => recognizeGarmentFromImage(file, file.name))
  );
  
  return results;
};