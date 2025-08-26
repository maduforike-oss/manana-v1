import { DesignDoc, PricingConfig } from './types';

export interface PricingBreakdown {
  basePrice: number;
  printSetup: number;
  colorCharges: number;
  surfaceCharges: number;
  quantityDiscount: number;
}

export interface PricingSummary {
  totalColors: number;
  activeSurfaces: number;
  complexityScore: number;
}

export interface PricingResult {
  totalPrice: number;
  pricePerUnit: number;
  breakdown: PricingBreakdown;
  summary: PricingSummary;
  warnings: string[];
}

// Default pricing configuration
const DEFAULT_PRICING: PricingConfig = {
  basePrice: 18.00, // Base garment price
  materialMultiplier: 1.0,
  colorPricing: {
    '1': 0.00,    // First color included
    '2': 2.50,    // Second color
    '3': 4.00,    // Third color
    '4+': 5.50    // Fourth+ colors
  },
  surfacePricing: {
    front: 0.00,      // Front surface included
    back: 8.00,       // Back surface
    sleeve: 5.00,     // Sleeve surface
    additional: 3.00  // Any additional surface
  },
  quantityBreaks: [
    { qty: 1, discount: 0.00 },
    { qty: 12, discount: 0.15 },  // 15% off at 12+
    { qty: 24, discount: 0.25 },  // 25% off at 24+
    { qty: 50, discount: 0.35 },  // 35% off at 50+
    { qty: 100, discount: 0.45 }, // 45% off at 100+
  ]
};

export const calculateDesignPrice = (
  doc: DesignDoc, 
  quantity: number = 1,
  pricingConfig: PricingConfig = DEFAULT_PRICING
): PricingResult => {
  
  const warnings: string[] = [];
  const printSurfaces = doc.canvas.printSurfaces || [];
  const activeSurfaces = printSurfaces.filter(surface => surface.enabled);
  
  // Calculate colors used across all surfaces
  const allColors = new Set<string>();
  let surfaceColorCounts: Record<string, number> = {};
  
  activeSurfaces.forEach(surface => {
    const surfaceNodes = doc.nodes.filter(node => node.surfaceId === surface.id);
    const surfaceColors = new Set<string>();
    
    surfaceNodes.forEach(node => {
      if (node.type === 'text' && node.fill?.color) {
        allColors.add(node.fill.color);
        surfaceColors.add(node.fill.color);
      } else if (node.type === 'shape' && node.fill?.color) {
        allColors.add(node.fill.color);
        surfaceColors.add(node.fill.color);
      }
    });
    
    surfaceColorCounts[surface.id] = surfaceColors.size;
  });

  const totalColors = allColors.size;
  
  // Base pricing
  let basePrice = pricingConfig.basePrice;
  
  // Material multiplier (for premium materials)
  basePrice *= pricingConfig.materialMultiplier;
  
  // Print setup cost (one-time per design)
  const printSetup = 5.00;
  
  // Color charges
  let colorCharges = 0;
  if (totalColors >= 2) {
    colorCharges += pricingConfig.colorPricing['2'];
  }
  if (totalColors >= 3) {
    colorCharges += pricingConfig.colorPricing['3'];
  }
  if (totalColors >= 4) {
    colorCharges += pricingConfig.colorPricing['4+'] * (totalColors - 3);
  }
  
  // Surface charges
  let surfaceCharges = 0;
  activeSurfaces.forEach(surface => {
    switch (surface.id) {
      case 'back':
        surfaceCharges += pricingConfig.surfacePricing.back;
        break;
      case 'sleeve':
      case 'left-sleeve':
      case 'right-sleeve':
        surfaceCharges += pricingConfig.surfacePricing.sleeve;
        break;
      default:
        if (surface.id !== 'front') {
          surfaceCharges += pricingConfig.surfacePricing.additional;
        }
    }
  });
  
  // Complexity warnings
  if (totalColors > 6) {
    warnings.push(`${totalColors} colors may increase production time and cost.`);
  }
  
  if (activeSurfaces.length > 3) {
    warnings.push(`Printing on ${activeSurfaces.length} surfaces requires careful alignment.`);
  }
  
  // Check for small text or fine details
  const hasSmallText = doc.nodes.some(node => 
    node.type === 'text' && node.fontSize < 12
  );
  
  if (hasSmallText) {
    warnings.push('Small text may not print clearly. Consider increasing font size.');
  }

  // Calculate unit price before quantity discount
  const unitPrice = basePrice + colorCharges + surfaceCharges;
  
  // Apply quantity discount
  let discountRate = 0;
  for (const breakpoint of pricingConfig.quantityBreaks) {
    if (quantity >= breakpoint.qty) {
      discountRate = breakpoint.discount;
    }
  }
  
  const quantityDiscount = unitPrice * discountRate;
  const discountedUnitPrice = unitPrice - quantityDiscount;
  
  // Calculate totals
  const totalPrice = (discountedUnitPrice * quantity) + printSetup;
  const pricePerUnit = totalPrice / quantity;
  
  const complexityScore = Math.min(10, (totalColors * 2) + (activeSurfaces.length * 1.5));
  
  return {
    totalPrice,
    pricePerUnit,
    breakdown: {
      basePrice,
      printSetup,
      colorCharges,
      surfaceCharges,
      quantityDiscount: quantityDiscount * quantity
    },
    summary: {
      totalColors,
      activeSurfaces: activeSurfaces.length,
      complexityScore
    },
    warnings
  };
};

export const getPricingEstimate = (
  garmentType: string,
  colors: number,
  surfaces: number,
  quantity: number = 1
): number => {
  // Quick estimate without full design doc
  const basePrice = DEFAULT_PRICING.basePrice;
  let colorCost = 0;
  
  if (colors >= 2) colorCost += DEFAULT_PRICING.colorPricing['2'];
  if (colors >= 3) colorCost += DEFAULT_PRICING.colorPricing['3'];
  if (colors >= 4) colorCost += DEFAULT_PRICING.colorPricing['4+'] * (colors - 3);
  
  const surfaceCost = Math.max(0, surfaces - 1) * DEFAULT_PRICING.surfacePricing.additional;
  const unitPrice = basePrice + colorCost + surfaceCost;
  
  // Apply quantity discount
  let discountRate = 0;
  for (const breakpoint of DEFAULT_PRICING.quantityBreaks) {
    if (quantity >= breakpoint.qty) {
      discountRate = breakpoint.discount;
    }
  }
  
  const discountedPrice = unitPrice * (1 - discountRate);
  return (discountedPrice * quantity) + 5.00; // Add setup cost
};