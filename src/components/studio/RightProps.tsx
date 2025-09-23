"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayersPanelEnhanced } from './LayersPanelEnhanced';
import { OptimizedPropertiesPanel } from './OptimizedPropertiesPanel';
import { OptimizedMaterialSelector } from './OptimizedMaterialSelector';
import { OptimizedPricingEngine } from './OptimizedPricingEngine';
import { OptimizedPreviewPanel } from './OptimizedPreviewPanel';
import { UnifiedBrushPanel } from './design-tools/UnifiedBrushPanel';
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
          <TabsList className="grid w-full grid-cols-6 m-4 glass-panel neon-border bg-studio-surface/50">
            <TabsTrigger 
              value="design" 
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
            >
              Design
            </TabsTrigger>
            <TabsTrigger 
              value="layers"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
            >
              Layers
            </TabsTrigger>
            <TabsTrigger 
              value="material"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
            >
              Material
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="brush"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
            >
              Brush
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active px-2 py-2 text-xs"
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
          <OptimizedPropertiesPanel />
        </TabsContent>
        
        <TabsContent 
          value="layers" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <LayersPanelEnhanced />
        </TabsContent>
        
        <TabsContent 
          value="material" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <OptimizedMaterialSelector />
        </TabsContent>
        
        <TabsContent 
          value="preview" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <OptimizedPreviewPanel />
        </TabsContent>
        
        <TabsContent 
          value="brush" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-4">
            <UnifiedBrushPanel 
              isVisible={true}
              className="w-full border-none shadow-none bg-transparent"
            />
          </div>
        </TabsContent>
        
        <TabsContent 
          value="pricing" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <OptimizedPricingEngine />
        </TabsContent>
      </Tabs>
    </div>
  );
};