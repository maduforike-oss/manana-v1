import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStudioStore } from '@/lib/studio/store';
import { calculateDesignPrice, PricingBreakdown } from '@/lib/studio/pricing';
import { DollarSign, Palette, Layers, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingEngineProps {
  className?: string;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export const PricingEngine: React.FC<PricingEngineProps> = ({ 
  className, 
  quantity = 1,
  onQuantityChange 
}) => {
  const { doc, getPrintSurfaces } = useStudioStore();

  const pricing = useMemo(() => {
    return calculateDesignPrice(doc, quantity);
  }, [doc, quantity]);

  const surfaces = getPrintSurfaces();
  const activeSurfaces = surfaces.filter(s => s.enabled);

  const handleQuantitySelect = (qty: number) => {
    onQuantityChange?.(qty);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getColorIcon = (count: number) => {
    if (count <= 1) return "text-green-500";
    if (count <= 3) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Quantity Selector */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Quantity</h3>
        <div className="grid grid-cols-4 gap-2">
          {[1, 12, 24, 50].map((qty) => (
            <Button
              key={qty}
              variant={quantity === qty ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuantitySelect(qty)}
              className="text-xs"
            >
              {qty}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Design Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Design Summary</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <div className="text-xs">
              <div className="font-medium">{activeSurfaces.length}</div>
              <div className="text-muted-foreground">Surfaces</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Palette className={cn("w-4 h-4", getColorIcon(pricing.summary.totalColors))} />
            <div className="text-xs">
              <div className="font-medium">{pricing.summary.totalColors}</div>
              <div className="text-muted-foreground">Colors</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" />
            <div className="text-xs">
              <div className="font-medium">{doc.canvas.garmentType}</div>
              <div className="text-muted-foreground">Garment</div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pricing Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Pricing Breakdown</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Price</span>
            <span className="font-medium">{formatPrice(pricing.breakdown.basePrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Print Setup</span>
            <span className="font-medium">{formatPrice(pricing.breakdown.printSetup)}</span>
          </div>
          
          {pricing.breakdown.colorCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Color Charges ({pricing.summary.totalColors} colors)
              </span>
              <span className="font-medium">{formatPrice(pricing.breakdown.colorCharges)}</span>
            </div>
          )}
          
          {pricing.breakdown.surfaceCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Additional Surfaces ({activeSurfaces.length - 1})
              </span>
              <span className="font-medium">{formatPrice(pricing.breakdown.surfaceCharges)}</span>
            </div>
          )}
          
          {pricing.breakdown.quantityDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Quantity Discount</span>
              <span className="font-medium">-{formatPrice(pricing.breakdown.quantityDiscount)}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center pt-2">
          <span className="font-semibold text-foreground">
            Total ({quantity} {quantity === 1 ? 'piece' : 'pieces'})
          </span>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {formatPrice(pricing.totalPrice)}
            </div>
            {quantity > 1 && (
              <div className="text-xs text-muted-foreground">
                {formatPrice(pricing.pricePerUnit)} each
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Alerts */}
      {pricing.warnings.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Pricing Notes</h4>
            {pricing.warnings.map((warning, index) => (
              <div key={index} className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                {warning}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Savings Opportunities */}
      {quantity < 12 && (
        <>
          <Separator />
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-xs font-semibold text-primary mb-1">
              💡 Save with Higher Quantities
            </div>
            <div className="text-xs text-muted-foreground">
              Order 12+ pieces and save {((1 - calculateDesignPrice(doc, 12).pricePerUnit / pricing.pricePerUnit) * 100).toFixed(0)}% per piece
            </div>
          </div>
        </>
      )}
    </div>
  );
};