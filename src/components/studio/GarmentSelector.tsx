import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const GARMENT_TYPES = [
  { id: 't-shirt', name: 'T-Shirt', category: 'Basics', popular: true },
  { id: 'hoodie', name: 'Hoodie', category: 'Outerwear', popular: true },
  { id: 'crewneck', name: 'Crewneck', category: 'Outerwear', popular: false },
  { id: 'joggers', name: 'Joggers', category: 'Bottoms', popular: false },
  { id: 'shorts', name: 'Shorts', category: 'Bottoms', popular: false },
  { id: 'polo', name: 'Polo', category: 'Basics', popular: false },
  { id: 'long-sleeve-tee', name: 'Long Sleeve Tee', category: 'Basics', popular: true },
  { id: 'tank', name: 'Tank Top', category: 'Basics', popular: false },
  { id: 'cap', name: 'Cap', category: 'Accessories', popular: true },
  { id: 'tote', name: 'Tote Bag', category: 'Accessories', popular: false },
  { id: 'socks', name: 'Socks', category: 'Accessories', popular: false },
  { id: 'beanie', name: 'Beanie', category: 'Accessories', popular: false },
  { id: 'bomber-jacket', name: 'Bomber Jacket', category: 'Outerwear', popular: false },
  { id: 'varsity-jacket', name: 'Varsity Jacket', category: 'Outerwear', popular: false },
  { id: 'zip-hoodie', name: 'Zip Hoodie', category: 'Outerwear', popular: true },
  { id: 'windbreaker', name: 'Windbreaker', category: 'Outerwear', popular: false },
  { id: 'denim-jacket', name: 'Denim Jacket', category: 'Outerwear', popular: false },
  { id: 'dress', name: 'Dress', category: 'Apparel', popular: false },
  { id: 'skirt', name: 'Skirt', category: 'Bottoms', popular: false },
  { id: 'leggings', name: 'Leggings', category: 'Bottoms', popular: false },
];

const CATEGORIES = ['All', 'Basics', 'Outerwear', 'Bottoms', 'Accessories', 'Apparel'];

export const GarmentSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { createDesign } = useAppStore();

  const filteredGarments = selectedCategory === 'All' 
    ? GARMENT_TYPES 
    : GARMENT_TYPES.filter(g => g.category === selectedCategory);

  const handleSelectGarment = (garmentId: string) => {
    const success = createDesign(garmentId);
    if (!success) {
      // Handle design limit reached
      alert('Design limit reached! Upgrade to create more designs.');
    }
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Choose Your Canvas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a garment type to start designing. Each template includes print areas, mockups, and export settings.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "transition-all",
                  selectedCategory === category && "bg-primary text-primary-foreground"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Garment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGarments.map((garment) => (
            <Card 
              key={garment.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => handleSelectGarment(garment.id)}
            >
              <div className="p-6">
                {/* Mock garment icon - replace with actual images later */}
                <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {garment.name.charAt(0)}
                    </span>
                  </div>
                  {garment.popular && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {garment.name}
                </h3>
                
                <Badge variant="secondary" className="text-xs">
                  {garment.category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All garments include high-resolution templates, print guidelines, and 300 DPI export capabilities
          </p>
        </div>
      </div>
    </div>
  );
};