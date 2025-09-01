"use client";
import React, { useState, useEffect } from 'react';
import { getCatalog, type Catalog, type Garment, type GarmentColor, type ViewName } from '@/lib/studio/catalog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface GarmentSelection {
  garment: Garment;
  colorIndex: number;
  view: ViewName;
  size: string;
}

interface GarmentPickerProps {
  onSelect: (selection: GarmentSelection) => void;
}

export default function GarmentPicker({ onSelect }: GarmentPickerProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedView, setSelectedView] = useState<ViewName>('front');
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleGarmentSelect = (garment: Garment) => {
    setSelectedGarment(garment);
    setSelectedColorIndex(0);
    setSelectedView('front');
    setSelectedSize(garment.sizes[1] || garment.sizes[0]); // Default to M or first size
  };

  const handleStartDesigning = () => {
    if (!selectedGarment) return;
    
    onSelect({
      garment: selectedGarment,
      colorIndex: selectedColorIndex,
      view: selectedView,
      size: selectedSize
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading catalog: {error}</p>
      </div>
    );
  }

  if (!catalog) return null;

  const availableViews = selectedGarment 
    ? Object.keys(selectedGarment.colors[selectedColorIndex]?.views || {}) as ViewName[]
    : [];

  return (
    <div className="space-y-8">
      {/* Garment Selection */}
      <section>
        <h2 className="text-xl font-medium mb-4">1. Choose a Garment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.garments.map((garment) => (
            <Card 
              key={garment.slug}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedGarment?.slug === garment.slug ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleGarmentSelect(garment)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                  {garment.colors[0]?.views.front ? (
                    <img 
                      src={garment.colors[0].views.front.mockup}
                      alt={garment.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No preview</span>
                  )}
                </div>
                <h3 className="font-medium">{garment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {garment.colors.length} color{garment.colors.length !== 1 ? 's' : ''} • {garment.sizes.join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {selectedGarment && (
        <>
          {/* Color Selection */}
          <section>
            <h2 className="text-xl font-medium mb-4">2. Pick a Color</h2>
            <div className="flex flex-wrap gap-3">
              {selectedGarment.colors.map((color, index) => (
                <button
                  key={`${color.name}-${index}`}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                    selectedColorIndex === index ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedColorIndex(index)}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* View Selection */}
          <section>
            <h2 className="text-xl font-medium mb-4">3. Select View</h2>
            <div className="flex flex-wrap gap-2">
              {availableViews.map((view) => (
                <Badge 
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedView(view)}
                >
                  {view}
                </Badge>
              ))}
            </div>
          </section>

          {/* Size Selection */}
          <section>
            <h2 className="text-xl font-medium mb-4">4. Choose Size</h2>
            <div className="flex flex-wrap gap-2">
              {selectedGarment.sizes.map((size) => (
                <Badge 
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </section>

          {/* Preview & Action */}
          <section className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 className="text-xl font-medium mb-4">Preview</h2>
              <div className="aspect-square max-w-sm bg-muted rounded-lg p-4 flex items-center justify-center">
                {selectedGarment.colors[selectedColorIndex]?.views[selectedView] ? (
                  <img 
                    src={selectedGarment.colors[selectedColorIndex].views[selectedView].mockup}
                    alt={`${selectedGarment.name} ${selectedView} view`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground">View not available</span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-medium mb-4">Ready to Design?</h2>
              <div className="space-y-3 mb-6">
                <p><strong>Garment:</strong> {selectedGarment.name}</p>
                <p><strong>Color:</strong> {selectedGarment.colors[selectedColorIndex]?.name}</p>
                <p><strong>View:</strong> {selectedView}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
              </div>
              
              <Button 
                onClick={handleStartDesigning}
                size="lg"
                className="w-full"
                disabled={!availableViews.includes(selectedView)}
              >
                Start Designing
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}