import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';
import { QuoteInput, QuoteOutput, GarmentSize, PrintMethod, ViewName } from './types';
import { calculateQuote } from './pricing/engine';
import { useStudioStore } from './store';

interface Placement {
  view: ViewName;
  method: PrintMethod;
  colors: number;
}

export const PricingTab: React.FC = () => {
  const { garment } = useStudioStore();
  
  const [quantity, setQuantity] = useState(24);
  const [size, setSize] = useState<GarmentSize>('M');
  const [fabric, setFabric] = useState<'standard' | 'premium'>('standard');
  const [placements, setPlacements] = useState<Placement[]>([
    { view: 'front', method: 'DTG', colors: 3 }
  ]);
  const [rush, setRush] = useState(false);
  const [rushDays, setRushDays] = useState<number>(7);
  const [region, setRegion] = useState<'UK' | 'EU' | 'US'>('UK');
  const [quote, setQuote] = useState<QuoteOutput | null>(null);

  // Calculate quote whenever inputs change
  useEffect(() => {
    const input: QuoteInput = {
      garmentType: garment.slug,
      size,
      quantity,
      fabric,
      placements,
      rush,
      rushDays: rush ? rushDays : undefined,
      region
    };
    
    setQuote(calculateQuote(input));
  }, [garment.slug, size, quantity, fabric, placements, rush, rushDays, region]);

  const addPlacement = () => {
    setPlacements([...placements, { view: 'back', method: 'DTG', colors: 1 }]);
  };

  const removePlacement = (index: number) => {
    if (placements.length > 1) {
      setPlacements(placements.filter((_, i) => i !== index));
    }
  };

  const updatePlacement = (index: number, updates: Partial<Placement>) => {
    setPlacements(placements.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const saveDraft = () => {
    const draft = {
      id: `draft_${Date.now()}`,
      timestamp: new Date().toISOString(),
      garment: garment.slug,
      size,
      quantity,
      fabric,
      placements,
      rush,
      rushDays,
      region,
      quote
    };
    
    // Save to localStorage (in a real app, this would go to your backend)
    const drafts = JSON.parse(localStorage.getItem('pricingDrafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('pricingDrafts', JSON.stringify(drafts));
    
    console.log('Draft saved:', draft);
    // You could show a toast notification here
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getQuantityTierBadge = () => {
    if (quantity >= 100) return { label: '55% OFF', color: 'bg-green-600' };
    if (quantity >= 50) return { label: '49% OFF', color: 'bg-green-500' };
    if (quantity >= 24) return { label: '40% OFF', color: 'bg-blue-500' };
    if (quantity >= 12) return { label: '32% OFF', color: 'bg-blue-400' };
    return null;
  };

  const tierBadge = getQuantityTierBadge();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Pricing Calculator</h2>
        <p className="text-muted-foreground">
          Configure your order details to get an instant quote with full pricing breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Configuration */}
        <div className="space-y-6">
          {/* Basic Options */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min={1}
                      max={1000}
                      className="pr-20"
                    />
                    {tierBadge && (
                      <Badge 
                        className={`absolute right-1 top-1/2 -translate-y-1/2 text-xs ${tierBadge.color} text-white`}
                      >
                        {tierBadge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Discounts: 12+ (32%), 24+ (40%), 50+ (49%), 100+ (55%)
                  </p>
                </div>

                <div>
                  <Label>Size</Label>
                  <Select value={size} onValueChange={(value) => setSize(value as GarmentSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL (+£1.50)</SelectItem>
                      <SelectItem value="XXL">XXL (+£1.50)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Fabric Quality</Label>
                <Select value={fabric} onValueChange={(value) => setFabric(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium (+£3.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Shipping Region</Label>
                <Select value={region} onValueChange={(value) => setRegion(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UK">UK (£5.00)</SelectItem>
                    <SelectItem value="EU">EU (£9.00)</SelectItem>
                    <SelectItem value="US">US (£12.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Placements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Print Placements</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPlacement}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Placement
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {placements.map((placement, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Placement {index + 1}</h4>
                    {placements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlacement(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">View</Label>
                      <Select 
                        value={placement.view} 
                        onValueChange={(value) => updatePlacement(index, { view: value as ViewName })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="front">Front</SelectItem>
                          <SelectItem value="back">Back</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Method</Label>
                      <Select 
                        value={placement.method} 
                        onValueChange={(value) => updatePlacement(index, { method: value as PrintMethod })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DTG">DTG</SelectItem>
                          <SelectItem value="Screen">Screen</SelectItem>
                          <SelectItem value="Vinyl">Vinyl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Colors</Label>
                      <Input
                        type="number"
                        value={placement.colors}
                        onChange={(e) => updatePlacement(index, { colors: parseInt(e.target.value) || 1 })}
                        min={1}
                        max={placement.method === 'Screen' ? 6 : 999}
                      />
                    </div>
                  </div>

                  {index === 0 && (
                    <p className="text-xs text-muted-foreground">
                      First placement included. Additional placements +£2.00 each.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rush Order */}
          <Card>
            <CardHeader>
              <CardTitle>Rush Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch checked={rush} onCheckedChange={setRush} />
                <Label>Rush order required</Label>
              </div>

              {rush && (
                <div>
                  <Label>Rush timeline</Label>
                  <Select 
                    value={rushDays.toString()} 
                    onValueChange={(value) => setRushDays(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days (+10%)</SelectItem>
                      <SelectItem value="5">5 days (+20%)</SelectItem>
                      <SelectItem value="3">3 days (+35%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote */}
        <div className="space-y-6">
          {quote && (
            <>
              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-accent/20 rounded-lg">
                      <div className="text-3xl font-bold">{formatCurrency(quote.total)}</div>
                      <div className="text-sm text-muted-foreground">Total Order</div>
                      <div className="text-lg font-medium mt-2">{formatCurrency(quote.unitPrice)}</div>
                      <div className="text-xs text-muted-foreground">per item</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 border rounded">
                        <div className="font-semibold">{quantity}</div>
                        <div className="text-muted-foreground">Quantity</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="font-semibold">{placements.length}</div>
                        <div className="text-muted-foreground">Placements</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quote.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={item.amount < 0 ? 'text-green-600' : ''}>{item.label}</span>
                        <span className={`font-medium ${item.amount < 0 ? 'text-green-600' : ''}`}>
                          {item.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                        </span>
                      </div>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={saveDraft} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Quote valid for 30 days. Final pricing confirmed at checkout.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};