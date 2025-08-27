"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayersPanel } from './LayersPanel';
import { OptimizedPropertiesPanel } from './OptimizedPropertiesPanel';
import { CanvasPanel } from './CanvasPanel';
import { GarmentMockupPreview } from './GarmentMockupPreview';
import { PrintSurfaceManager } from './PrintSurfaceManager';
import { ExportPanel } from './ExportPanel';
import { OptimizedPricingEngine } from './OptimizedPricingEngine';
import { OptimizedMaterialSelector } from './OptimizedMaterialSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RightPropsProps {
  collapsed?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RightProps = ({ 
  collapsed = false, 
  activeTab = "design",
  onTabChange 
}: RightPropsProps) => {
  if (collapsed) return null;

  return (
    <div className="w-80 flex flex-col relative">
      {/* Panel Background with effects */}
      <div className="absolute inset-0 studio-panel" />
      
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange}
        className="flex-1 flex flex-col relative z-10"
      >
        <div className="relative">
          {/* Enhanced Tab List */}
          <TabsList className="grid w-full grid-cols-4 m-4 glass-panel neon-border bg-studio-surface/50">
            <TabsTrigger 
              value="design" 
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-3 py-2"
            >
              Design
            </TabsTrigger>
            <TabsTrigger 
              value="material"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-3 py-2"
            >
              Material
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-3 py-2"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-3 py-2"
            >
              Pricing
            </TabsTrigger>
          </TabsList>
          
          {/* Tab indicator line */}
          <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary via-studio-accent-cyan to-primary opacity-60" />
        </div>
        
        <TabsContent 
          value="design" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="space-y-6">
            <OptimizedPropertiesPanel />
            
            <Card className="border-0 bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LayersPanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent 
          value="preview" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-4 space-y-6">
            <Card className="border-0 bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  3D Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GarmentMockupPreview />
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Print Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PrintSurfaceManager />
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Export
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ExportPanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent 
          value="pricing" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-4">
            <OptimizedPricingEngine />
          </div>
        </TabsContent>
        
        <TabsContent 
          value="material" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-4">
            <OptimizedMaterialSelector />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};