import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudioStore } from '../../lib/studio/store';
import { calculateDesignPrice } from '../../lib/studio/pricing';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PricingCalculator = () => {
  const { doc } = useStudioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [garmentType, setGarmentType] = useState('t-shirt');
  const [pricing, setPricing] = useState<any>(null);

  useEffect(() => {
    if (doc && quantity > 0) {
      const result = calculateDesignPrice(doc, quantity);
      setPricing(result);
    }
  }, [doc, quantity, garmentType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDiscountBadge = () => {
    if (!pricing || quantity < 10) return null;
    
    const discount = Math.round(((pricing.summary.basePrice - pricing.summary.unitPrice) / pricing.summary.basePrice) * 100);
    if (discount > 0) {
      return (
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {discount}% off
        </span>
      );
    }
    return null;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-8 gap-2 transition-all duration-200",
            pricing && "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          )}
        >
          <Calculator className="w-4 h-4" />
          {pricing ? formatCurrency(pricing.summary.unitPrice) : 'Pricing'}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Live Pricing Calculator
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-center"
              />
            </div>

            {/* Garment Type */}
            <div className="space-y-2">
              <Label>Garment Type</Label>
              <Select value={garmentType} onValueChange={setGarmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t-shirt">T-Shirt</SelectItem>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="tank-top">Tank Top</SelectItem>
                  <SelectItem value="long-sleeve">Long Sleeve</SelectItem>
                  <SelectItem value="polo">Polo Shirt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Results */}
            {pricing && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unit Price:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatCurrency(pricing.summary.unitPrice)}
                    </span>
                    {getDiscountBadge()}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(pricing.summary.totalPrice)}
                  </span>
                </div>

                {/* Color Count */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Colors Used:</span>
                  <span className="font-medium">{pricing.breakdown.colors}</span>
                </div>

                {/* Print Surfaces */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Print Areas:</span>
                  <span className="font-medium">{pricing.breakdown.surfaces}</span>
                </div>

                {/* Quantity Discounts */}
                {quantity >= 10 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Volume Discount Applied!</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Save more with larger quantities
                    </p>
                  </div>
                )}

                {/* Warnings */}
                {pricing.warnings.length > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="text-sm text-orange-700 font-medium mb-1">
                      Cost Optimization Tips:
                    </div>
                    {pricing.warnings.map((warning, index) => (
                      <p key={index} className="text-xs text-orange-600">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};