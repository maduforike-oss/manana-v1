import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { MarketFilters } from '@/hooks/useMarketQueryState';
import { useCategories } from '@/hooks/useProducts';

interface FiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MarketFilters;
  onFiltersChange: (filters: MarketFilters) => void;
  onClear: () => void;
  resultCount: number;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Pink', 'Yellow'];

export function FiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClear,
  resultCount,
}: FiltersModalProps) {
  const { data: categories } = useCategories();

  const updateFilters = (key: keyof MarketFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-base font-medium mb-3 block">Categories</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      updateFilters(
                        'categories',
                        checked
                          ? [...filters.categories, category.id]
                          : filters.categories.filter(id => id !== category.id)
                      );
                    }}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sizes */}
          <div>
            <Label className="text-base font-medium mb-3 block">Sizes</Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <Button
                  key={size}
                  variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters('sizes', toggleArrayItem(filters.sizes, size))}
                  className="h-8 min-w-[2.5rem]"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <Label className="text-base font-medium mb-3 block">Colors</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  variant={filters.colors.includes(color) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters('colors', toggleArrayItem(filters.colors, color))}
                  className="h-8"
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <Label className="text-base font-medium mb-3 block">Price Range</Label>
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  value={[filters.price_min || 0, filters.price_max || 200]}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={([min, max]) => {
                    updateFilters('price_min', min);
                    updateFilters('price_max', max);
                  }}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.price_min || 0}</span>
                <span>${filters.price_max || 200}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClear}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Show {resultCount} Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}