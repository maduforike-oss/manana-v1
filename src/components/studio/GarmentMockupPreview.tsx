import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockupRenderer } from './MockupRenderer';
import { GarmentColorPicker } from './GarmentColorPicker';
import { useStudioStore } from '../../lib/studio/store';
import { getGarmentById } from '@/lib/studio/garments';
import { 
  RotateCcw, 
  Download, 
  Share2, 
  Eye, 
  EyeOff, 
  Palette,
  Maximize2,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GarmentMockupPreviewProps {
  className?: string;
}

export const GarmentMockupPreview: React.FC<GarmentMockupPreviewProps> = ({ className }) => {
  const { doc, mockup, setMockup } = useStudioStore();
  const [showDesign, setShowDesign] = useState(true);
  const [activeView, setActiveView] = useState<'front' | 'back' | 'side'>('front');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const garmentType = doc.canvas.garmentType || 't-shirt';
  const garmentColor = doc.canvas.garmentColor || 'white';
  const garment = getGarmentById(garmentType);
  
  if (!garment) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No garment selected</p>
        </CardContent>
      </Card>
    );
  }

  const handleExportMockup = () => {
    // TODO: Implement high-res mockup export
  };

  const handleShareMockup = () => {
    // TODO: Implement sharing functionality  
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{garment.name} Preview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time mockup with your design
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Live Preview
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* View Selector */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="front">Front View</TabsTrigger>
            <TabsTrigger value="back" disabled>Back View</TabsTrigger>
            <TabsTrigger value="side" disabled>Side View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="front" className="mt-4">
            <div className="space-y-4">
              {/* Main Mockup */}
              <div className="relative">
                <MockupRenderer
                  size={isFullscreen ? 'xl' : 'lg'}
                  showPreview={showDesign}
                  className="mx-auto"
                />
                
                {/* Overlay Controls */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDesign(!showDesign)}
                    className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/70"
                  >
                    {showDesign ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Mockup Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mockup Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={mockup.type === 'front' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMockup({ type: 'front' })}
                      className="text-xs"
                    >
                      Flat Lay
                    </Button>
                    <Button
                      variant={mockup.type === 'worn' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMockup({ type: 'worn' })}
                      className="text-xs"
                      disabled
                    >
                      On Model
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={mockup.color === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMockup({ color: 'light' })}
                      className="text-xs"
                    >
                      Light
                    </Button>
                    <Button
                      variant={mockup.color === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMockup({ color: 'dark' })}
                      className="text-xs"
                    >
                      Dark
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Design Opacity Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Design Opacity</label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(mockup.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mockup.opacity}
                  onChange={(e) => setMockup({ opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleExportMockup} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export HD
          </Button>
          <Button variant="outline" onClick={handleShareMockup}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Studio Shot
          </Button>
        </div>
        
        {/* Garment Specifications */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Garment Specifications</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Material:</span>
              <span className="ml-2 font-medium">{garment.specs.material}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <span className="ml-2 font-medium">{garment.specs.weight}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Print Areas:</span>
              <span className="ml-2 font-medium">{garment.printAreas.join(', ')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Methods:</span>
              <span className="ml-2 font-medium">{garment.specs.printMethods.slice(0, 2).join(', ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};