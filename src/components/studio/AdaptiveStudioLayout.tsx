import React, { useState } from 'react';
import { UnifiedCanvasStage } from './design-tools/UnifiedCanvasStage';
import { ProfessionalToolManager } from './ProfessionalToolManager';
import { EnhancedLayersPanel } from './EnhancedLayersPanel';
import { MockupPreview } from './MockupPreview';
import { ProfessionalToolbar } from './ProfessionalToolbar';
import { ViewportSettingsPanel } from './ViewportSettingsPanel';
import { StatusBar } from './StatusBar';
import { MobileFloatingToolbar } from './MobileFloatingToolbar';
import { useResponsiveStudio } from '@/hooks/useResponsiveStudio';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Settings, 
  Layers, 
  Palette,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdaptiveStudioLayoutProps {
  className?: string;
}

type MobilePanelView = 'tools' | 'layers' | 'settings' | null;

export const AdaptiveStudioLayout = ({ className }: AdaptiveStudioLayoutProps) => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    canUseResizablePanels,
    layout 
  } = useResponsiveStudio();
  
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState<MobilePanelView>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

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
      <div className={cn(
        "h-screen w-screen flex flex-col bg-background",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}>
        {/* Mobile Header */}
        {!isFullscreen && (
          <div className="flex items-center justify-between h-12 px-4 bg-card/95 backdrop-blur-sm border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <Tabs defaultValue="tools" className="h-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="tools" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Tools
                      </TabsTrigger>
                      <TabsTrigger value="layers" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Layers
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tools" className="p-4 space-y-4">
                      <ProfessionalToolManager />
                      <MockupPreview />
                    </TabsContent>
                    <TabsContent value="layers" className="p-0">
                      <EnhancedLayersPanel />
                    </TabsContent>
                    <TabsContent value="settings" className="p-4">
                      <ViewportSettingsPanel />
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
              <h1 className="text-sm font-medium">Design Studio</h1>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreenToggle}
              className="p-2"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Toggle fullscreen</span>
            </Button>
          </div>
        )}
        
        {/* Mobile Canvas */}
        <div className="flex-1 relative bg-muted/20">
          <UnifiedCanvasStage />
          <MobileFloatingToolbar />
          
          {isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreenToggle}
              className="absolute top-4 right-4 z-50 p-2 bg-card/80 backdrop-blur-sm"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="sr-only">Exit fullscreen</span>
            </Button>
          )}
        </div>
        
        {/* Mobile Status Bar */}
        {!isFullscreen && (
          <StatusBar onSettingsClick={() => setShowSettings(true)} />
        )}
        
        {/* Mobile Settings Sheet */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent side="bottom" className="h-[70vh]">
            <ViewportSettingsPanel />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Tablet Layout
  if (isTablet) {
    return (
      <div className={cn(
        "h-screen w-screen flex flex-col bg-background",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}>
        {/* Tablet Toolbar */}
        <ProfessionalToolbar 
          onSettingsClick={() => setShowSettings(true)}
          onFullscreenToggle={handleFullscreenToggle}
          isFullscreen={isFullscreen}
        />

        <div className="flex-1 flex">
          {/* Left Panel - Collapsible */}
          <div className={cn(
            "transition-all duration-300 border-r border-border flex flex-col",
            leftPanelCollapsed ? "w-12" : "w-60"
          )}>
            <div className="flex items-center justify-between p-2 border-b border-border">
              {!leftPanelCollapsed && <span className="text-sm font-medium">Tools</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 h-8 w-8"
              >
                {leftPanelCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
            
            {!leftPanelCollapsed && (
              <div className="flex-1 p-4 space-y-4 overflow-auto">
                <ProfessionalToolManager />
                <MockupPreview />
              </div>
            )}
          </div>

          {/* Center Canvas */}
          <div className="flex-1 relative bg-muted/20">
            <UnifiedCanvasStage />
          </div>

          {/* Right Panel - Collapsible */}
          <div className={cn(
            "transition-all duration-300 border-l border-border flex flex-col",
            rightPanelCollapsed ? "w-12" : "w-60"
          )}>
            <div className="flex items-center justify-between p-2 border-b border-border">
              {!rightPanelCollapsed && <span className="text-sm font-medium">Layers</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="p-1 h-8 w-8"
              >
                {rightPanelCollapsed ? <Layers className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
            
            {!rightPanelCollapsed && (
              <div className="flex-1 overflow-auto">
                <EnhancedLayersPanel />
              </div>
            )}
          </div>
        </div>

        {/* Tablet Status Bar */}
        <StatusBar onSettingsClick={() => setShowSettings(true)} />
        
        {/* Settings Sheet */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent side="right" className="w-80">
            <ViewportSettingsPanel />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={cn(
      "h-screen w-screen flex flex-col bg-background",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Desktop Toolbar */}
      <ProfessionalToolbar 
        onSettingsClick={() => setShowSettings(true)}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Tools & Settings */}
        <ResizablePanel defaultSize={18} minSize={12} maxSize={30}>
          <div className="h-full flex flex-col border-r border-border">
            <div className="flex-1 p-4 space-y-4 overflow-auto">
              <ProfessionalToolManager />
              <MockupPreview />
            </div>
            
            {/* Integrated Settings */}
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
          <EnhancedLayersPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Desktop Status Bar */}
      <StatusBar onSettingsClick={() => setShowSettings(true)} />
    </div>
  );
};