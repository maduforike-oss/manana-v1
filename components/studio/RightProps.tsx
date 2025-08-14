"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasPanel } from './CanvasPanel';

export const RightProps = () => {
  return (
    <div className="w-80 bg-card border-l flex flex-col">
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Style</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="flex-1 overflow-hidden">
          <PropertiesPanel />
        </TabsContent>
        
        <TabsContent value="layers" className="flex-1 overflow-hidden">
          <LayersPanel />
        </TabsContent>
        
        <TabsContent value="canvas" className="flex-1 overflow-hidden">
          <CanvasPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};