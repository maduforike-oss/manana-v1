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
    <div className="w-80 bg-card flex flex-col">
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger 
            value="properties" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            Style
          </TabsTrigger>
          <TabsTrigger 
            value="layers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            Layers
          </TabsTrigger>
          <TabsTrigger 
            value="canvas"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            Canvas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="properties" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-200"
        >
          <PropertiesPanel />
        </TabsContent>
        
        <TabsContent 
          value="layers" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-200"
        >
          <LayersPanel />
        </TabsContent>
        
        <TabsContent 
          value="canvas" 
          className="flex-1 overflow-hidden animate-in fade-in-50 duration-200"
        >
          <CanvasPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};