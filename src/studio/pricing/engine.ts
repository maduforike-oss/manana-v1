import { QuoteInput, QuoteOutput, GarmentSize, PrintMethod } from '../types';

// Base prices per garment type and size
const BASE_PRICES: Record<string, Record<GarmentSize, number>> = {
  't-shirt': {
    'XS': 12.99,
    'S': 12.99,
    'M': 12.99,
    'L': 12.99,
    'XL': 14.49,
    'XXL': 14.49
  },
  'hoodie': {
    'XS': 32.99,
    'S': 32.99,
    'M': 32.99,
    'L': 32.99,
    'XL': 34.49,
    'XXL': 34.49
  },
  'polo': {
    'XS': 18.99,
    'S': 18.99,
    'M': 18.99,
    'L': 18.99,
    'XL': 20.49,
    'XXL': 20.49
  }
};

// Quantity tier discounts
const QUANTITY_TIERS = [
  { min: 1, max: 11, discount: 0 },
  { min: 12, max: 23, discount: 0.32 },
  { min: 24, max: 49, discount: 0.40 },
  { min: 50, max: 99, discount: 0.49 },
  { min: 100, max: Infinity, discount: 0.55 }
];

// Print method pricing
const PRINT_METHOD_PRICING = {
  DTG: {
    baseAdd: 0,
    perLocationAdd: 2.00,
    setupFee: 0,
    perColorFee: 0
  },
  Screen: {
    baseAdd: 0,
    perLocationAdd: 2.00,
    setupFee: 25.00,
    perColorFee: 3.00
  },
  Vinyl: {
    baseAdd: 3.00,
    perLocationAdd: 2.50,
    setupFee: 0,
    perColorFee: 0
  }
};

// Rush order pricing
const RUSH_PRICING = {
  7: 0.10, // 7 days: +10%
  5: 0.20, // 5 days: +20%
  3: 0.35  // 3 days: +35%
};

// Size upcharges
const SIZE_UPCHARGES: Record<GarmentSize, number> = {
  'XS': 0,
  'S': 0,
  'M': 0,
  'L': 0,
  'XL': 1.50,
  'XXL': 1.50
};

// Shipping costs by region
const SHIPPING_COSTS = {
  'UK': 5.00,
  'EU': 9.00,
  'US': 12.00
};

// VAT rate
const VAT_RATE = 0.20;

// Fabric upcharges
const FABRIC_UPCHARGES = {
  'standard': 0,
  'premium': 3.00
};

export function calculateQuote(input: QuoteInput): QuoteOutput {
  // Get base garment price
  const garmentPrices = BASE_PRICES[input.garmentType] || BASE_PRICES['t-shirt'];
  let basePrice = garmentPrices[input.size] || garmentPrices['M'];
  
  // Add fabric upcharge
  basePrice += FABRIC_UPCHARGES[input.fabric];
  
  // Size upcharge
  const sizeUpcharge = SIZE_UPCHARGES[input.size] * input.quantity;
  
  // Calculate placement fees
  let placementFees = 0;
  let screenFees = 0;
  let vinylFees = 0;
  
  input.placements.forEach((placement, index) => {
    const methodPricing = PRINT_METHOD_PRICING[placement.method];
    
    if (index === 0) {
      // First placement included in base DTG/Screen, but Vinyl has base add
      if (placement.method === 'Vinyl') {
        vinylFees += methodPricing.baseAdd * input.quantity;
      }
    } else {
      // Additional placements
      placementFees += methodPricing.perLocationAdd * input.quantity;
    }
    
    // Screen printing setup and color fees
    if (placement.method === 'Screen') {
      screenFees += methodPricing.setupFee; // One-time setup fee
      screenFees += methodPricing.perColorFee * placement.colors; // Per color fee
    }
  });
  
  // Calculate quantity discount
  const tier = QUANTITY_TIERS.find(t => input.quantity >= t.min && input.quantity <= t.max);
  const quantityDiscount = tier ? tier.discount : 0;
  
  // Base subtotal before discounts
  const baseSubtotal = basePrice * input.quantity;
  const discountedSubtotal = baseSubtotal * (1 - quantityDiscount);
  
  // Rush order upcharge
  let rushUpcharge = 0;
  if (input.rush && input.rushDays) {
    const rushRate = RUSH_PRICING[input.rushDays as keyof typeof RUSH_PRICING] || 0;
    rushUpcharge = discountedSubtotal * rushRate;
  }
  
  // Calculate final amounts
  const subtotal = discountedSubtotal + placementFees + screenFees + vinylFees + sizeUpcharge + rushUpcharge;
  const shipping = SHIPPING_COSTS[input.region];
  const vat = subtotal * VAT_RATE;
  const total = subtotal + shipping + vat;
  const unitPrice = total / input.quantity;
  
  // Build breakdown
  const breakdown = [
    { label: `${input.garmentType} (${input.fabric}) x${input.quantity}`, amount: baseSubtotal },
  ];
  
  if (quantityDiscount > 0) {
    breakdown.push({ 
      label: `Quantity discount (${Math.round(quantityDiscount * 100)}%)`, 
      amount: -(baseSubtotal * quantityDiscount) 
    });
  }
  
  if (placementFees > 0) {
    breakdown.push({ label: 'Additional placement fees', amount: placementFees });
  }
  
  if (screenFees > 0) {
    breakdown.push({ label: 'Screen printing fees', amount: screenFees });
  }
  
  if (vinylFees > 0) {
    breakdown.push({ label: 'Vinyl printing fees', amount: vinylFees });
  }
  
  if (sizeUpcharge > 0) {
    breakdown.push({ label: 'Size upcharge (XL/XXL)', amount: sizeUpcharge });
  }
  
  if (rushUpcharge > 0) {
    const days = input.rushDays || 7;
    breakdown.push({ label: `Rush order (${days} days)`, amount: rushUpcharge });
  }
  
  breakdown.push({ label: 'Shipping', amount: shipping });
  breakdown.push({ label: 'VAT (20%)', amount: vat });
  
  return {
    basePrice: baseSubtotal,
    placementFees,
    screenFees,
    vinylFees,
    rushUpcharge,
    sizeUpcharge,
    subtotal,
    shipping,
    vat,
    total,
    unitPrice,
    breakdown
  };
}