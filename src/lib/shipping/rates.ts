// Shipping rates calculation stub
// TODO: Integrate with actual shipping providers (FedEx, UPS, USPS, etc.)

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimated_delivery_days: number;
  rate: number;
  currency: string;
  carrier?: string;
  service_type?: string;
}

export interface ShippingCalculationParams {
  origin_address: ShippingAddress;
  destination_address: ShippingAddress;
  items: Array<{
    weight: number; // in pounds
    dimensions?: {
      length: number; // in inches
      width: number;
      height: number;
    };
    value: number; // for insurance
    quantity: number;
  }>;
}

// Default origin address (warehouse/fulfillment center)
const DEFAULT_ORIGIN: ShippingAddress = {
  line1: '123 Warehouse St',
  city: 'Los Angeles',
  state: 'CA',
  postal_code: '90210',
  country: 'US'
};

// Flat rate shipping zones
const SHIPPING_ZONES = {
  'domestic': {
    countries: ['US'],
    methods: [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        estimated_delivery_days: 7,
        rate: 5.99,
        currency: 'USD',
        carrier: 'USPS'
      },
      {
        id: 'expedited',
        name: 'Expedited Shipping',
        description: '2-3 business days',
        estimated_delivery_days: 3,
        rate: 12.99,
        currency: 'USD',
        carrier: 'UPS'
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        estimated_delivery_days: 1,
        rate: 24.99,
        currency: 'USD',
        carrier: 'FedEx'
      }
    ]
  },
  'international': {
    countries: ['CA', 'MX', 'GB', 'FR', 'DE', 'AU', 'JP'],
    methods: [
      {
        id: 'international_standard',
        name: 'International Standard',
        description: '7-14 business days',
        estimated_delivery_days: 14,
        rate: 19.99,
        currency: 'USD',
        carrier: 'USPS'
      },
      {
        id: 'international_express',
        name: 'International Express',
        description: '3-5 business days',
        estimated_delivery_days: 5,
        rate: 39.99,
        currency: 'USD',
        carrier: 'DHL'
      }
    ]
  }
};

// Calculate shipping rates
export async function calculateShippingRates(
  destinationAddress: ShippingAddress,
  items: ShippingCalculationParams['items'] = [],
  originAddress: ShippingAddress = DEFAULT_ORIGIN
): Promise<ShippingMethod[]> {
  try {
    // STUB: Simple zone-based shipping calculation
    console.log('Calculating shipping rates for:', {
      origin: originAddress,
      destination: destinationAddress,
      items
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Determine shipping zone
    const isDomestic = SHIPPING_ZONES.domestic.countries.includes(destinationAddress.country.toUpperCase());
    const isInternational = SHIPPING_ZONES.international.countries.includes(destinationAddress.country.toUpperCase());

    if (isDomestic) {
      return SHIPPING_ZONES.domestic.methods.map(method => ({
        ...method,
        rate: calculateRateWithWeight(method.rate, items)
      }));
    } else if (isInternational) {
      return SHIPPING_ZONES.international.methods.map(method => ({
        ...method,
        rate: calculateRateWithWeight(method.rate, items)
      }));
    } else {
      // Unsupported country
      throw new Error(`Shipping not available to ${destinationAddress.country}`);
    }
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    throw error;
  }
}

// Calculate rate based on weight
function calculateRateWithWeight(baseRate: number, items: ShippingCalculationParams['items']): number {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  
  // Add weight surcharge for packages over 5 lbs
  if (totalWeight > 5) {
    const additionalPounds = Math.ceil(totalWeight - 5);
    return baseRate + (additionalPounds * 1.50);
  }
  
  return baseRate;
}

// Get estimated delivery date
export function getEstimatedDeliveryDate(method: ShippingMethod, shipDate?: Date): Date {
  const ship = shipDate || new Date();
  const deliveryDate = new Date(ship);
  
  // Add business days (skip weekends)
  let daysAdded = 0;
  while (daysAdded < method.estimated_delivery_days) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return deliveryDate;
}

// Validate shipping address
export function validateShippingAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!address.line1?.trim()) {
    errors.push('Address line 1 is required');
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required');
  }
  
  if (!address.state?.trim()) {
    errors.push('State/Province is required');
  }
  
  if (!address.postal_code?.trim()) {
    errors.push('Postal code is required');
  }
  
  if (!address.country?.trim()) {
    errors.push('Country is required');
  }
  
  // Basic postal code validation for US
  if (address.country?.toUpperCase() === 'US' && address.postal_code) {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    if (!usZipRegex.test(address.postal_code)) {
      errors.push('Invalid US postal code format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get supported shipping countries
export function getSupportedCountries(): Array<{ code: string; name: string; zone: string }> {
  return [
    // Domestic
    { code: 'US', name: 'United States', zone: 'domestic' },
    
    // International
    { code: 'CA', name: 'Canada', zone: 'international' },
    { code: 'MX', name: 'Mexico', zone: 'international' },
    { code: 'GB', name: 'United Kingdom', zone: 'international' },
    { code: 'FR', name: 'France', zone: 'international' },
    { code: 'DE', name: 'Germany', zone: 'international' },
    { code: 'AU', name: 'Australia', zone: 'international' },
    { code: 'JP', name: 'Japan', zone: 'international' }
  ];
}

// Track package (stub implementation)
// TODO: Integrate with carrier tracking APIs
export async function trackPackage(trackingNumber: string, carrier: string): Promise<{
  status: string;
  location?: string;
  estimated_delivery?: Date;
  events: Array<{
    timestamp: Date;
    status: string;
    location?: string;
    description: string;
  }>;
}> {
  try {
    console.log('Tracking package:', { trackingNumber, carrier });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return fake tracking data
    return {
      status: 'in_transit',
      location: 'Los Angeles, CA',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      events: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: 'shipped',
          location: 'Los Angeles, CA',
          description: 'Package shipped from facility'
        },
        {
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          status: 'in_transit',
          location: 'Phoenix, AZ',
          description: 'Package in transit'
        }
      ]
    };
  } catch (error) {
    console.error('Error tracking package:', error);
    throw error;
  }
}

// Calculate dimensional weight (for carriers that use it)
export function calculateDimensionalWeight(
  length: number,
  width: number,
  height: number,
  divisor: number = 139 // Standard for most carriers
): number {
  return (length * width * height) / divisor;
}