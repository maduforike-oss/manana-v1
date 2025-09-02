import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Type, Move, Palette, Layers, Settings, Shirt, Palette as PaletteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudioStore } from '@/lib/studio/store';
import { EnhancedPropertiesPanel } from './EnhancedPropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { CanvasPanel } from './CanvasPanel';
import { GarmentColorPicker } from './GarmentColorPicker';
import { getGarmentById } from '@/lib/studio/garments';

export const OptimizedPropertiesPanel = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    canvas: true,
    garment: false,
    properties: false,
    layers: false,
  });
  const { doc, initializeFromGarment } = useStudioStore();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectedNodes = doc.nodes.filter(node => node.selected);
  const hasSelection = selectedNodes.length > 0;
  
  // Get current garment from canvas config
  const currentGarmentType = doc.canvas.garmentType;
  const currentGarment = currentGarmentType ? getGarmentById(currentGarmentType) : null;
  const garmentColors: any[] = currentGarment?.colors || [];

  const handleGarmentColorChange = (colorId: string) => {
    // Update garment color in store
    if (currentGarmentType) {
      // We'll need to implement this in the store
      console.log('Change garment color to:', colorId);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Canvas Settings Section */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.canvas} 
            onOpenChange={() => toggleSection('canvas')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="font-medium">Canvas Setup</span>
                  <Badge variant="secondary" className="text-xs">
                    {doc.canvas.width}×{doc.canvas.height}
                  </Badge>
                </div>
                {openSections.canvas ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <CanvasPanel />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Garment Selection Section */}
        {currentGarment && (
          <Card className="border-border/50 bg-card/50">
            <Collapsible 
              open={openSections.garment} 
              onOpenChange={() => toggleSection('garment')}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-primary" />
                    <span className="font-medium">Garment Style</span>
                    <Badge variant="secondary" className="text-xs">
                      {currentGarment.name}
                    </Badge>
                  </div>
                  {openSections.garment ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Current Garment</h4>
                    <p className="text-xs text-muted-foreground">{currentGarment.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Garment Color</h4>
                    <GarmentColorPicker
                      colors={garmentColors}
                      selectedColorId={undefined}
                      onColorSelect={handleGarmentColorChange}
                      size="md"
                      showNames={true}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Properties Section */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.properties} 
            onOpenChange={() => toggleSection('properties')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  <span className="font-medium">Element Properties</span>
                  {hasSelection && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedNodes.length} selected
                    </Badge>
                  )}
                </div>
                {openSections.properties ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                {hasSelection ? (
                  <EnhancedPropertiesPanel />
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    Select an element to edit its properties
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Layers Section */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.layers} 
            onOpenChange={() => toggleSection('layers')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="font-medium">Design Layers</span>
                  <Badge variant="secondary" className="text-xs">
                    {doc.nodes.length}
                  </Badge>
                </div>
                {openSections.layers ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <LayersPanel />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </ScrollArea>
  );
};