import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X } from 'lucide-react';
import { MarketFilters } from '@/hooks/useMarketQueryState';
import { useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';

interface FiltersSheetProps {
  children?: React.ReactNode;
  filters: MarketFilters;
  onFiltersChange: (filters: MarketFilters) => void;
  onClear: () => void;
  resultCount: number;
  onApply?: (filters: MarketFilters) => void;
  onClose?: () => void;
  open?: boolean;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Pink', 'Yellow'];

export function FiltersSheet({
  children,
  filters,
  onFiltersChange,
  onClear,
  resultCount,
  onApply,
  onClose,
  open = false,
}: FiltersSheetProps) {
  const { data: categories } = useCategories();
  const isMobile = useIsMobile();

  const updateFilters = (key: keyof MarketFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const hasActiveFilters = () => {
    return filters.categories.length > 0 || 
           filters.sizes.length > 0 || 
           filters.colors.length > 0 || 
           filters.price_min !== undefined || 
           filters.price_max !== undefined;
  };

  const getFilterCount = () => {
    return filters.categories.length + filters.sizes.length + filters.colors.length + 
           (filters.price_min !== undefined || filters.price_max !== undefined ? 1 : 0);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Categories</Label>
        <ScrollArea className="h-32">
          <div className="space-y-3 pr-4">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-3">
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
                  className="rounded-md"
                />
                <Label 
                  htmlFor={`category-${category.id}`} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="my-6" />

      {/* Sizes */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Sizes</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={filters.sizes.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('sizes', toggleArrayItem(filters.sizes, size))}
              className="h-9 min-w-[3rem] text-sm hover:scale-105 transition-transform"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Colors */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Colors</Label>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((color) => (
            <Button
              key={color}
              variant={filters.colors.includes(color) ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('colors', toggleArrayItem(filters.colors, color))}
              className="h-9 text-sm hover:scale-105 transition-transform"
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Price Range</Label>
        <div className="space-y-4">
          <div className="px-3">
            <Slider
              value={[filters.price_min || 0, filters.price_max || 200]}
              min={0}
              max={200}
              step={5}
              onValueChange={([min, max]) => {
                updateFilters('price_min', min > 0 ? min : undefined);
                updateFilters('price_max', max < 200 ? max : undefined);
              }}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground font-medium">
            <span>${filters.price_min || 0}</span>
            <span>${filters.price_max || 200}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 sticky bottom-0 bg-background border-t pt-4">
        <Button
          variant="outline"
          onClick={onClear}
          className="flex-1 h-11"
          disabled={!hasActiveFilters()}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
        <Button
          className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
          onClick={() => onApply?.(filters)}
        >
          Show {resultCount} Results
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getFilterCount() > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground">
                {getFilterCount()}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? "bottom" : "left"} 
        className={isMobile 
          ? "h-[85vh] rounded-t-2xl border-t-2 border-border/20" 
          : "w-80 sm:w-96"
        }
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">
            Filter Products
            {getFilterCount() > 0 && (
              <Badge className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/20">
                {getFilterCount()} active
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className={isMobile ? "h-[calc(85vh-8rem)]" : "h-[calc(100vh-8rem)]"}>
          <FilterContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}