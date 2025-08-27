import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Eye, Download, Smartphone, RotateCcw } from 'lucide-react';
import { GarmentMockupPreview } from './GarmentMockupPreview';
import { ExportPanel } from './ExportPanel';

export const OptimizedPreviewPanel = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    preview: true,
    controls: false,
    export: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* 3D Preview */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.preview} 
            onOpenChange={() => toggleSection('preview')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="font-medium">3D Preview</span>
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                </div>
                {openSections.preview ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <GarmentMockupPreview />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* View Controls */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.controls} 
            onOpenChange={() => toggleSection('controls')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span className="font-medium">View Controls</span>
                  <Badge variant="outline" className="text-xs">
                    360°
                  </Badge>
                </div>
                {openSections.controls ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-auto p-3">
                    <div className="text-center">
                      <div className="text-xs font-medium">Front View</div>
                      <div className="text-xs text-muted-foreground">Default</div>
                    </div>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto p-3">
                    <div className="text-center">
                      <div className="text-xs font-medium">Back View</div>
                      <div className="text-xs text-muted-foreground">Rotate</div>
                    </div>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Quality Settings</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      Standard
                    </Button>
                    <Button variant="default" size="sm">
                      High Quality
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">AR Preview</h4>
                  <Button variant="outline" size="sm" className="w-full">
                    <Smartphone className="w-4 h-4 mr-2" />
                    View in AR
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Export & Share */}
        <Card className="border-border/50 bg-card/50">
          <Collapsible 
            open={openSections.export} 
            onOpenChange={() => toggleSection('export')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  <span className="font-medium">Export & Share</span>
                  <Badge variant="outline" className="text-xs">
                    HD Ready
                  </Badge>
                </div>
                {openSections.export ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <ExportPanel />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </ScrollArea>
  );
};