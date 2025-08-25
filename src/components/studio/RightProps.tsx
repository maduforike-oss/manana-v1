"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasPanel } from './CanvasPanel';

interface RightPropsProps {
  collapsed?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RightProps = ({ 
  collapsed = false, 
  activeTab = "properties",
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
          <TabsList className="grid w-full grid-cols-3 m-3 glass-panel neon-border bg-studio-surface/50">
            <TabsTrigger 
              value="properties" 
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active"
            >
              Style
            </TabsTrigger>
            <TabsTrigger 
              value="layers"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active"
            >
              Layers
            </TabsTrigger>
            <TabsTrigger 
              value="canvas"
              className="studio-tool data-[state=active]:studio-tool data-[state=active]:active"
            >
              Canvas
            </TabsTrigger>
          </TabsList>
          
          {/* Tab indicator line */}
          <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary via-studio-accent-cyan to-primary opacity-60" />
        </div>
        
        <TabsContent 
          value="properties" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-3">
            <PropertiesPanel />
          </div>
        </TabsContent>
        
        <TabsContent 
          value="layers" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-3">
            <LayersPanel />
          </div>
        </TabsContent>
        
        <TabsContent 
          value="canvas" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-300 slide-in-from-right-4"
        >
          <div className="p-3">
            <CanvasPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};