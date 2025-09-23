import React, { useState } from 'react';
import { UnifiedCanvasStage } from './design-tools/UnifiedCanvasStage';
import { ProfessionalToolManager } from './ProfessionalToolManager';
import { LayerManager } from './LayerManager';
import { MockupPreview } from './MockupPreview';
import { ProfessionalToolbar } from './ProfessionalToolbar';
import { ViewportSettingsPanel } from './ViewportSettingsPanel';
import { StatusBar } from './StatusBar';
import { MobileFloatingToolbar } from './MobileFloatingToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Professional studio layout with persistent architecture
export const ProfessionalStudioShell = () => {
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Mobile Canvas with Floating Controls */}
        <div className="flex-1 relative bg-muted/20">
          <UnifiedCanvasStage />
          <MobileFloatingToolbar />
        </div>
        
        {/* Mobile Status Bar */}
        <StatusBar onSettingsClick={() => setShowSettings(true)} />
        
        {/* Settings Sheet */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent side="bottom" className="h-[70vh]">
            <div className="space-y-4 p-4">
              <ViewportSettingsPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div className={cn(
      "h-screen w-screen flex flex-col bg-background",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Professional Toolbar */}
      <ProfessionalToolbar 
        onSettingsClick={() => setShowSettings(true)}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Tools & Settings */}
        <ResizablePanel defaultSize={18} minSize={12} maxSize={30}>
          <div className="h-full flex flex-col border-r border-border">
            <div className="flex-1 p-4 space-y-4">
              <ProfessionalToolManager />
              <MockupPreview />
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="border-t border-border">
                <ViewportSettingsPanel className="border-none" />
              </div>
            )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center Panel - Canvas */}
        <ResizablePanel defaultSize={62} minSize={40}>
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
      
      {/* Enhanced Status Bar */}
      <StatusBar onSettingsClick={() => setShowSettings(true)} />
    </div>
  );
};