import { useState } from 'react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MarketFilters } from '@/hooks/useMarketplace';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  filters: MarketFilters;
  onFiltersChange: (filters: MarketFilters) => void;
  onClear: () => void;
  className?: string;
  totalResults: number;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onClear,
  className,
  totalResults
}: AdvancedFiltersProps) {
  const [priceRange, setPriceRange] = useState(filters.priceRange);

  const garmentOptions = [
    { value: 'tshirt', label: 'T-Shirts', count: 1240 },
    { value: 'hoodie', label: 'Hoodies', count: 892 },
    { value: 'crewneck', label: 'Crewnecks', count: 567 },
    { value: 'longsleeve', label: 'Long Sleeves', count: 445 },
    { value: 'polo', label: 'Polo Shirts', count: 234 },
  ];

  const colorOptions = [
    { value: 'black', label: 'Black', color: 'hsl(var(--foreground))', count: 2340 },
    { value: 'white', label: 'White', color: 'hsl(var(--background))', count: 1876 },
    { value: 'navy', label: 'Navy', color: 'hsl(217 91% 60%)', count: 789 },
    { value: 'gray', label: 'Gray', color: 'hsl(var(--muted))', count: 567 },
    { value: 'red', label: 'Red', color: 'hsl(0 100% 50%)', count: 234 },
  ];

  const tagOptions = [
    { value: 'streetwear', label: 'Streetwear', count: 456 },
    { value: 'minimalist', label: 'Minimalist', count: 234 },
    { value: 'vintage', label: 'Vintage', count: 123 },
    { value: 'typography', label: 'Typography', count: 89 },
    { value: 'geometric', label: 'Geometric', count: 67 },
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleGarmentTypeChange = (garmentType: string, checked: boolean) => {
    const newGarmentTypes = checked
      ? [...filters.garmentTypes, garmentType]
      : filters.garmentTypes.filter(t => t !== garmentType);
    
    onFiltersChange({ ...filters, garmentTypes: newGarmentTypes });
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.baseColors, color]
      : filters.baseColors.filter(c => c !== color);
    
    onFiltersChange({ ...filters, baseColors: newColors });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag);
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.size, size]
      : filters.size.filter(s => s !== size);
    
    onFiltersChange({ ...filters, size: newSizes });
  };

  const handlePriceRangeCommit = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const activeFilterCount = [
    ...filters.garmentTypes,
    ...filters.baseColors,
    ...filters.tags,
    ...filters.size,
    filters.inStock ? 'inStock' : null,
    filters.rating ? 'rating' : null
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {totalResults.toLocaleString()} results
      </div>

      <Separator />

      {/* Garment Types */}
      <div className="space-y-3">
        <h4 className="font-medium">Product Type</h4>
        <div className="space-y-2">
          {garmentOptions.map((option) => (
            <div key={option.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`garment-${option.value}`}
                  checked={filters.garmentTypes.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleGarmentTypeChange(option.value, checked as boolean)
                  }
                  className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
                />
                <Label 
                  htmlFor={`garment-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {option.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="font-medium">Colors</h4>
        <div className="grid grid-cols-2 gap-2">
          {colorOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${option.value}`}
                checked={filters.baseColors.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleColorChange(option.value, checked as boolean)
                }
                className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
              />
              <Label 
                htmlFor={`color-${option.value}`}
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
                <span className="text-xs text-muted-foreground">
                  ({option.count})
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium">Price Range</h4>
        <div className="px-2 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange([value[0], value[1]])}
            onValueCommit={(value) => handlePriceRangeCommit(value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sizes */}
      <div className="space-y-3">
        <h4 className="font-medium">Sizes</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={filters.size.includes(size)}
                onCheckedChange={(checked) => 
                  handleSizeChange(size, checked as boolean)
                }
                className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
              />
              <Label 
                htmlFor={`size-${size}`}
                className="text-sm font-normal cursor-pointer"
              >
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags/Categories */}
      <div className="space-y-3">
        <h4 className="font-medium">Style</h4>
        <div className="space-y-2">
          {tagOptions.map((option) => (
            <div key={option.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${option.value}`}
                  checked={filters.tags.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleTagChange(option.value, checked as boolean)
                  }
                  className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
                />
                <Label 
                  htmlFor={`tag-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {option.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium">Minimum Rating</h4>
        <RadioGroup
          value={filters.rating?.toString() || ''}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              rating: value ? parseInt(value) : undefined 
            })
          }
        >
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={rating.toString()} 
                id={`rating-${rating}`}
                className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
              />
              <Label 
                htmlFor={`rating-${rating}`}
                className="text-sm font-normal cursor-pointer"
              >
                {rating}+ stars
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <h4 className="font-medium">Availability</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => 
              onFiltersChange({ ...filters, inStock: checked as boolean })
            }
            className="min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In stock only
          </Label>
        </div>
      </div>
    </div>
  );
}