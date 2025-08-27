import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useStudioStore } from '@/lib/studio/store';
import { calculateDesignPrice } from '@/lib/studio/pricing';
import { DollarSign, Package, ChevronDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedPricingEngineProps {
  className?: string;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export const OptimizedPricingEngine: React.FC<OptimizedPricingEngineProps> = ({ 
  className, 
  quantity = 1,
  onQuantityChange 
}) => {
  const { doc, getPrintSurfaces } = useStudioStore();
  const [showBreakdown, setShowBreakdown] = useState(false);

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

  const calculateSavings = (newQty: number) => {
    const newPricing = calculateDesignPrice(doc, newQty);
    return ((pricing.pricePerUnit - newPricing.pricePerUnit) / pricing.pricePerUnit * 100).toFixed(0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Summary Card */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Total Price</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(pricing.totalPrice)}
              </div>
              {quantity > 1 && (
                <div className="text-xs text-muted-foreground">
                  {formatPrice(pricing.pricePerUnit)} each
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-semibold">{quantity}</div>
              <div className="text-xs text-muted-foreground">Pieces</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-semibold">{activeSurfaces.length}</div>
              <div className="text-xs text-muted-foreground">Surfaces</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-semibold">{pricing.summary.totalColors}</div>
              <div className="text-xs text-muted-foreground">Colors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantity Selector */}
      <Card className="border-0 bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4" />
            Quantity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 12, 24, 50].map((qty) => (
              <Button
                key={qty}
                variant={quantity === qty ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuantitySelect(qty)}
                className="text-xs relative"
              >
                {qty}
                {qty > quantity && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0 h-5 min-w-5"
                  >
                    -{calculateSavings(qty)}%
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown - Collapsible */}
      <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto font-medium text-sm border border-dashed border-muted-foreground/50 hover:bg-muted/50"
          >
            Pricing Breakdown
            <ChevronDown className={cn("w-4 h-4 transition-transform", showBreakdown && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4 space-y-3">
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
                      Additional Surfaces
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
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Savings Opportunity */}
      {quantity < 12 && (
        <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                  💡 Save with Higher Quantities
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Order 12+ pieces and save up to {calculateSavings(24)}% per piece
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {pricing.warnings.length > 0 && (
        <Card className="border-0 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Pricing Notes
            </div>
            {pricing.warnings.map((warning, index) => (
              <div key={index} className="text-xs text-amber-600 dark:text-amber-400">
                {warning}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};