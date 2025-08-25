import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '../../../lib/studio/store';
import { cn } from '@/lib/utils';
import { GARMENT_TYPES, getGarmentsByCategory, getColorByGarmentAndId } from '@/lib/studio/garments';
import { GarmentPreview } from './GarmentPreview';
import { Sparkles, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Basics', 'Outerwear', 'Bottoms', 'Accessories'];

export const GarmentSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const { createDesign, setActiveTab } = useAppStore();
  const { initializeFromGarment } = useStudioStore();

  console.log('GarmentSelector rendered');
  console.log('createDesign:', typeof createDesign);
  console.log('initializeFromGarment:', typeof initializeFromGarment);

  const filteredGarments = getGarmentsByCategory(selectedCategory);

  const handleSelectGarment = (garmentId: string) => {
    const success = createDesign(garmentId);
    if (!success) {
      // Handle design limit reached
      alert('Design limit reached! Upgrade to create more designs.');
      return;
    }

    // Get selected color for this garment
    const selectedColorId = selectedColors[garmentId] || 'white';
    const selectedColor = getColorByGarmentAndId(garmentId, selectedColorId);
    
    // Initialize studio with garment-specific canvas and settings
    initializeFromGarment(garmentId, selectedColor?.id || 'white');
    
    // Navigate to studio
    setActiveTab('studio');
  };

  const handleColorChange = (garmentId: string, colorId: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [garmentId]: colorId,
    }));
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Choose Your Canvas
            </h1>
            <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Select from our premium garment collection. Each item features HD mockups, professional color options, 
            and industry-standard specifications for the perfect design experience.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">300 DPI</Badge>
              High Resolution
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="outline" className="bg-secondary/10">Professional</Badge>
              Grade Mockups
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">20+</Badge>
              Color Options
            </span>
          </div>
        </div>

        {/* Enhanced Category Filter */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 bg-card border border-border rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground ml-3" />
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "relative transition-all duration-200 rounded-lg",
                  selectedCategory === category 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
                {selectedCategory === category && (
                  <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Professional Garment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredGarments.map((garment) => (
            <GarmentPreview
              key={garment.id}
              garment={garment}
              selectedColorId={selectedColors[garment.id]}
              onColorChange={(colorId) => handleColorChange(garment.id, colorId)}
              onSelect={() => handleSelectGarment(garment.id)}
              className="h-full"
            />
          ))}
        </div>

        {/* Enhanced Footer */}
        <div className="mt-16 text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Premium Materials</h3>
              <p className="text-sm text-muted-foreground">
                Ring-spun cotton, premium fleece, and canvas materials for professional results
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Multiple Print Methods</h3>
              <p className="text-sm text-muted-foreground">
                Screen printing, DTG, embroidery, and heat transfer compatible designs
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Export Ready</h3>
              <p className="text-sm text-muted-foreground">
                300 DPI templates with bleed areas and print guidelines included
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};