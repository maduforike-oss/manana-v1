import { useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FiltersSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    garmentTypes: string[];
    baseColors: string[];
    tags: string[];
    priceRange: [number, number];
    inStock: boolean;
    size: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearAll: () => void;
}

export const FiltersSheet = ({ 
  isOpen, 
  onOpenChange, 
  filters, 
  onFiltersChange,
  onClearAll 
}: FiltersSheetProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    const emptyFilters = {
      garmentTypes: [],
      baseColors: [],
      tags: [],
      priceRange: [0, 100] as [number, number],
      inStock: false,
      size: []
    };
    setLocalFilters(emptyFilters);
    onClearAll();
  };

  const garmentTypeOptions = [
    { id: 'tshirt', label: 'T-Shirts', count: 245 },
    { id: 'hoodie', label: 'Hoodies', count: 128 },
    { id: 'crewneck', label: 'Crewnecks', count: 89 },
    { id: 'tank', label: 'Tank Tops', count: 67 },
    { id: 'longsleeve', label: 'Long Sleeves', count: 156 },
    { id: 'polo', label: 'Polo Shirts', count: 43 }
  ];

  const colorOptions = [
    { id: 'black', label: 'Black', color: '#000000', count: 189 },
    { id: 'white', label: 'White', color: '#FFFFFF', count: 234 },
    { id: 'gray', label: 'Gray', color: '#6B7280', count: 145 },
    { id: 'navy', label: 'Navy', color: '#1E3A8A', count: 98 },
    { id: 'red', label: 'Red', color: '#DC2626', count: 76 },
    { id: 'blue', label: 'Blue', color: '#2563EB', count: 134 }
  ];

  const sizeOptions = [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
    { id: 'xxl', label: 'XXL' }
  ];

  const tagOptions = [
    { id: 'minimalist', label: 'Minimalist', count: 156 },
    { id: 'streetwear', label: 'Streetwear', count: 234 },
    { id: 'vintage', label: 'Vintage', count: 89 },
    { id: 'abstract', label: 'Abstract', count: 145 },
    { id: 'typography', label: 'Typography', count: 198 },
    { id: 'nature', label: 'Nature', count: 87 },
    { id: 'geometric', label: 'Geometric', count: 112 },
    { id: 'retro', label: 'Retro', count: 76 }
  ];

  const hasActiveFilters = localFilters.garmentTypes.length > 0 || 
                          localFilters.baseColors.length > 0 || 
                          localFilters.tags.length > 0 || 
                          localFilters.size.length > 0 ||
                          localFilters.inStock ||
                          localFilters.priceRange[0] > 0 || 
                          localFilters.priceRange[1] < 100;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={!hasActiveFilters}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </SheetHeader>

          {/* Filters Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-6 space-y-8">
              {/* Garment Types */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Garment Type</h3>
                <div className="space-y-3">
                  {garmentTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`garment-${option.id}`}
                          checked={localFilters.garmentTypes.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLocalFilters(prev => ({
                                ...prev,
                                garmentTypes: [...prev.garmentTypes, option.id]
                              }));
                            } else {
                              setLocalFilters(prev => ({
                                ...prev,
                                garmentTypes: prev.garmentTypes.filter(type => type !== option.id)
                              }));
                            }
                          }}
                          className="border-border/50"
                        />
                        <label 
                          htmlFor={`garment-${option.id}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Colors</h3>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => {
                        if (localFilters.baseColors.includes(option.id)) {
                          setLocalFilters(prev => ({
                            ...prev,
                            baseColors: prev.baseColors.filter(color => color !== option.id)
                          }));
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            baseColors: [...prev.baseColors, option.id]
                          }));
                        }
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        localFilters.baseColors.includes(option.id)
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-primary/30"
                      )}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-xs font-medium">{option.label}</span>
                      {localFilters.baseColors.includes(option.id) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Size */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((option) => (
                    <Badge
                      key={option.id}
                      variant={localFilters.size.includes(option.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-4 py-2",
                        localFilters.size.includes(option.id)
                          ? "bg-primary text-primary-foreground"
                          : "border-border/40 hover:border-primary/30"
                      )}
                      onClick={() => {
                        if (localFilters.size.includes(option.id)) {
                          setLocalFilters(prev => ({
                            ...prev,
                            size: prev.size.filter(s => s !== option.id)
                          }));
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            size: [...prev.size, option.id]
                          }));
                        }
                      }}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Price Range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
                </h3>
                <div className="px-2">
                  <Slider
                    value={localFilters.priceRange}
                    onValueChange={(value) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: value as [number, number]
                    }))}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Tags/Categories */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Categories</h3>
                <div className="space-y-3">
                  {tagOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`tag-${option.id}`}
                          checked={localFilters.tags.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLocalFilters(prev => ({
                                ...prev,
                                tags: [...prev.tags, option.id]
                              }));
                            } else {
                              setLocalFilters(prev => ({
                                ...prev,
                                tags: prev.tags.filter(tag => tag !== option.id)
                              }));
                            }
                          }}
                          className="border-border/50"
                        />
                        <label 
                          htmlFor={`tag-${option.id}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Availability</h3>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="in-stock"
                    checked={localFilters.inStock}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({
                      ...prev,
                      inStock: checked as boolean
                    }))}
                    className="border-border/50"
                  />
                  <label 
                    htmlFor="in-stock"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    In stock only
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/20">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border-border/40"
              >
                Cancel
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                Apply Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary text-xs h-5 px-2">
                    {[
                      ...localFilters.garmentTypes,
                      ...localFilters.baseColors,
                      ...localFilters.tags,
                      ...localFilters.size
                    ].length + (localFilters.inStock ? 1 : 0) + (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};