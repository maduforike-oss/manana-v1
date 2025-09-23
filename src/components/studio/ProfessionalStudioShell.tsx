import React from 'react';
import { UnifiedCanvasStage } from './design-tools/UnifiedCanvasStage';
import { ProfessionalToolManager } from './ProfessionalToolManager';
import { LayerManager } from './LayerManager';
import { MockupPreview } from './MockupPreview';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';

// Professional studio layout with persistent architecture
export const ProfessionalStudioShell = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Tools */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <div className="h-full p-4 space-y-4 border-r border-border">
            <ProfessionalToolManager />
            <MockupPreview />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center Panel - Canvas */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full relative bg-muted/20">
            <UnifiedCanvasStage />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right Panel - Layers */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <LayerManager />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Status Bar */}
      <div className="h-8 px-4 flex items-center justify-between border-t border-border bg-background text-xs text-muted-foreground">
        <span>Professional Design Studio</span>
        <span>Template Fidelity: 100% • Persistent Layers • No Data Loss</span>
      </div>
    </div>
  );
};