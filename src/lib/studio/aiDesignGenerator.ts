import { Node, TextNode, ImageNode, ShapeNode } from './types';

export interface DesignPromptAnalysis {
  style: 'minimalist' | 'vintage' | 'modern' | 'grunge' | 'elegant' | 'playful';
  colors: string[];
  elements: string[];
  layout: 'centered' | 'left-aligned' | 'scattered' | 'grid';
  mood: 'professional' | 'casual' | 'bold' | 'subtle';
}

export interface DesignElement {
  type: 'text' | 'shape' | 'image';
  content?: string;
  shape?: 'circle' | 'rect' | 'triangle' | 'star' | 'square';
  color: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  priority: number;
}

/**
 * Analyzes a text prompt to extract design intentions
 */
export function analyzeDesignPrompt(prompt: string): DesignPromptAnalysis {
  const lowerPrompt = prompt.toLowerCase();
  
  // Style analysis
  let style: DesignPromptAnalysis['style'] = 'modern';
  if (lowerPrompt.includes('minimalist') || lowerPrompt.includes('clean') || lowerPrompt.includes('simple')) {
    style = 'minimalist';
  } else if (lowerPrompt.includes('vintage') || lowerPrompt.includes('retro') || lowerPrompt.includes('classic')) {
    style = 'vintage';
  } else if (lowerPrompt.includes('grunge') || lowerPrompt.includes('rough') || lowerPrompt.includes('distressed')) {
    style = 'grunge';
  } else if (lowerPrompt.includes('elegant') || lowerPrompt.includes('luxury') || lowerPrompt.includes('sophisticated')) {
    style = 'elegant';
  } else if (lowerPrompt.includes('playful') || lowerPrompt.includes('fun') || lowerPrompt.includes('cartoon')) {
    style = 'playful';
  }

  // Color extraction
  const colorMap: Record<string, string> = {
    red: '#ef4444', crimson: '#dc2626', scarlet: '#fee2e2',
    blue: '#3b82f6', navy: '#1e40af', sky: '#0ea5e9', cyan: '#06b6d4',
    green: '#22c55e', forest: '#15803d', lime: '#84cc16', emerald: '#10b981',
    yellow: '#eab308', gold: '#f59e0b', amber: '#f97316',
    purple: '#a855f7', violet: '#8b5cf6', indigo: '#6366f1',
    pink: '#ec4899', rose: '#f43f5e',
    orange: '#f97316', coral: '#fb7185',
    black: '#000000', white: '#ffffff', gray: '#6b7280', grey: '#6b7280',
    brown: '#a3744f', beige: '#f5f5dc', cream: '#fffdd0'
  };

  const colors: string[] = [];
  Object.entries(colorMap).forEach(([colorName, hex]) => {
    if (lowerPrompt.includes(colorName)) {
      colors.push(hex);
    }
  });

  // Default colors if none found
  if (colors.length === 0) {
    colors.push('#3b82f6', '#000000'); // blue and black default
  }

  // Element extraction
  const elements: string[] = [];
  const elementKeywords = [
    'text', 'typography', 'logo', 'icon', 'mountain', 'tree', 'sun', 'moon',
    'star', 'circle', 'square', 'triangle', 'arrow', 'line', 'wave',
    'flower', 'leaf', 'animal', 'bird', 'fish', 'heart', 'skull',
    'lightning', 'fire', 'water', 'earth', 'air'
  ];

  elementKeywords.forEach(keyword => {
    if (lowerPrompt.includes(keyword)) {
      elements.push(keyword);
    }
  });

  // Layout analysis
  let layout: DesignPromptAnalysis['layout'] = 'centered';
  if (lowerPrompt.includes('left') || lowerPrompt.includes('align left')) {
    layout = 'left-aligned';
  } else if (lowerPrompt.includes('scattered') || lowerPrompt.includes('random')) {
    layout = 'scattered';
  } else if (lowerPrompt.includes('grid') || lowerPrompt.includes('organized')) {
    layout = 'grid';
  }

  // Mood analysis
  let mood: DesignPromptAnalysis['mood'] = 'casual';
  if (lowerPrompt.includes('professional') || lowerPrompt.includes('business') || lowerPrompt.includes('corporate')) {
    mood = 'professional';
  } else if (lowerPrompt.includes('bold') || lowerPrompt.includes('strong') || lowerPrompt.includes('powerful')) {
    mood = 'bold';
  } else if (lowerPrompt.includes('subtle') || lowerPrompt.includes('soft') || lowerPrompt.includes('gentle')) {
    mood = 'subtle';
  }

  return { style, colors, elements, layout, mood };
}

/**
 * Generates design elements based on prompt analysis
 */
export function generateDesignElements(analysis: DesignPromptAnalysis, garmentType: string): DesignElement[] {
  const elements: DesignElement[] = [];
  const canvasWidth = 600;
  const canvasHeight = 400;

  // Calculate base positions based on layout
  const getPosition = (index: number, total: number) => {
    switch (analysis.layout) {
      case 'centered':
        return {
          x: canvasWidth / 2 - 100,
          y: canvasHeight / 2 - 30 + (index - total / 2) * 60
        };
      case 'left-aligned':
        return {
          x: 50,
          y: 100 + index * 60
        };
      case 'scattered':
        return {
          x: Math.random() * (canvasWidth - 200) + 100,
          y: Math.random() * (canvasHeight - 100) + 50
        };
      case 'grid':
        const cols = Math.ceil(Math.sqrt(total));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          x: (canvasWidth / (cols + 1)) * (col + 1) - 50,
          y: (canvasHeight / (Math.ceil(total / cols) + 1)) * (row + 1) - 30
        };
      default:
        return { x: canvasWidth / 2 - 100, y: canvasHeight / 2 - 30 };
    }
  };

  let elementIndex = 0;

  // Generate text elements
  analysis.elements.forEach(element => {
    if (element === 'text' || element === 'typography') {
      elements.push({
        type: 'text',
        content: generateTextContent(analysis, garmentType),
        color: analysis.colors[0] || '#000000',
        size: analysis.mood === 'bold' ? 'large' : 'medium',
        position: getPosition(elementIndex++, analysis.elements.length + 1),
        priority: 1
      });
    }
  });

  // Generate shape elements
  analysis.elements.forEach(element => {
    if (['circle', 'square', 'rect', 'triangle', 'star'].includes(element)) {
      const shapeType = element === 'square' ? 'rect' : element as 'circle' | 'rect' | 'triangle' | 'star';
      elements.push({
        type: 'shape',
        shape: shapeType,
        color: analysis.colors[1] || analysis.colors[0] || '#3b82f6',
        size: analysis.style === 'minimalist' ? 'small' : 'medium',
        position: getPosition(elementIndex++, analysis.elements.length + 1),
        priority: 2
      });
    }
  });

  // Add default text if no specific elements found
  if (elements.length === 0) {
    elements.push({
      type: 'text',
      content: generateTextContent(analysis, garmentType),
      color: analysis.colors[0] || '#000000',
      size: 'medium',
      position: getPosition(0, 1),
      priority: 1
    });
  }

  return elements;
}

/**
 * Converts design elements to studio nodes
 */
export function elementsToNodes(elements: DesignElement[]): Node[] {
  const nodes: Node[] = [];

  elements.forEach((element, index) => {
    const baseId = `ai_${Date.now()}_${index}`;
    
    if (element.type === 'text') {
      const textNode: TextNode = {
        id: baseId,
        type: 'text',
        name: `AI Text ${index + 1}`,
        x: element.position.x,
        y: element.position.y,
        width: getSizeValue(element.size, 'width'),
        height: getSizeValue(element.size, 'height'),
        rotation: 0,
        opacity: 1,
        text: element.content || 'AI Generated Text',
        fontFamily: 'Inter',
        fontSize: getSizeValue(element.size, 'fontSize'),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: 0,
        align: 'center',
        fill: { type: 'solid', color: element.color }
      };
      nodes.push(textNode);
    } else if (element.type === 'shape') {
      const shapeNode: ShapeNode = {
        id: baseId,
        type: 'shape',
        name: `AI Shape ${index + 1}`,
        x: element.position.x,
        y: element.position.y,
        width: getSizeValue(element.size, 'width'),
        height: getSizeValue(element.size, 'height'),
        rotation: 0,
        opacity: 1,
        shape: element.shape === 'square' ? 'rect' : (element.shape === 'rect' || element.shape === 'triangle' || element.shape === 'star') ? element.shape : 'circle',
        fill: { type: 'solid', color: element.color }
      };
      nodes.push(shapeNode);
    }
  });

  return nodes;
}

/**
 * Analyzes an uploaded image for design extraction
 */
export async function analyzeImageForDesign(file: File): Promise<DesignElement[]> {
  // In a real implementation, this would use computer vision APIs
  // For now, we'll simulate with basic analysis
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const elements: DesignElement[] = [];
      
      // Simulate color extraction
      const dominantColors = ['#3b82f6', '#22c55e', '#ef4444']; // Simulated
      
      // Add the uploaded image as an element
      elements.push({
        type: 'image',
        color: dominantColors[0],
        size: 'large',
        position: { x: 150, y: 100 },
        priority: 1
      });
      
      // Add complementary shapes based on aspect ratio
      if (img.width > img.height) {
        elements.push({
          type: 'shape',
          shape: 'rect',
          color: dominantColors[1],
          size: 'small',
          position: { x: 400, y: 200 },
          priority: 2
        });
      } else {
        elements.push({
          type: 'shape',
          shape: 'circle',
          color: dominantColors[1],
          size: 'medium',
          position: { x: 350, y: 150 },
          priority: 2
        });
      }
      
      resolve(elements);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Helper functions
function generateTextContent(analysis: DesignPromptAnalysis, garmentType: string): string {
  const templates = {
    minimalist: ['LESS IS MORE', 'SIMPLICITY', 'CLEAN', 'PURE'],
    vintage: ['ESTABLISHED', 'CLASSIC', 'HERITAGE', 'TIMELESS'],
    modern: ['FUTURE', 'INNOVATION', 'PROGRESS', 'NOW'],
    grunge: ['REBEL', 'ROUGH', 'RAW', 'URBAN'],
    elegant: ['LUXURY', 'REFINED', 'ELEGANT', 'PREMIUM'],
    playful: ['FUN', 'PLAY', 'JOY', 'HAPPY']
  };

  const styleTexts = templates[analysis.style] || templates.modern;
  return styleTexts[Math.floor(Math.random() * styleTexts.length)];
}

function getSizeValue(size: 'small' | 'medium' | 'large', property: 'width' | 'height' | 'fontSize'): number {
  const sizes = {
    small: { width: 80, height: 40, fontSize: 16 },
    medium: { width: 160, height: 60, fontSize: 24 },
    large: { width: 240, height: 80, fontSize: 32 }
  };
  
  return sizes[size][property];
}