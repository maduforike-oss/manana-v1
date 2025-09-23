import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useStudioStore } from '../../lib/studio/store';
import { EnhancedLayersPanel } from './EnhancedLayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ViewportControls } from './ViewportControls';
import { 
  Menu, Layers, Settings, Palette, Grid3x3, Maximize, Minimize2, 
  Smartphone, Tablet, Monitor, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveStudioLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveStudioLayout: React.FC<ResponsiveStudioLayoutProps> = ({ 
  children 
}) => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'layers' | 'properties'>('layers');
  
  const { doc } = useStudioStore();
  const selectedCount = doc.selectedIds.length;

  // Auto-close panels on mobile when selection changes
  useEffect(() => {
    if (isMobile && selectedCount > 0 && !rightPanelOpen) {
      setActivePanel('properties');
    }
  }, [selectedCount, isMobile, rightPanelOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F key for fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      // Tab key for panels (when not in input)
      if (e.key === 'Tab' && e.target instanceof HTMLElement && 
          !['input', 'textarea'].includes(e.target.tagName.toLowerCase())) {
        e.preventDefault();
        if (isMobile) {
          setBottomPanelOpen(!bottomPanelOpen);
        } else {
          setRightPanelOpen(!rightPanelOpen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isMobile, rightPanelOpen, bottomPanelOpen]);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Header */}
        {!isFullscreen && (
          <div className="h-12 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Studio</div>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 p-0"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Fullscreen (F)</TooltipContent>
              </Tooltip>

              <Drawer open={bottomPanelOpen} onOpenChange={setBottomPanelOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="h-96">
                    {activePanel === 'layers' ? <EnhancedLayersPanel /> : <PropertiesPanel />}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        )}

        {/* Mobile Canvas */}
        <div className="flex-1 relative">
          {children}
          
          {/* Floating Controls */}
          {!isFullscreen && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <ViewportControls />
            </div>
          )}
        </div>

        {/* Mobile Bottom Panel Toggle */}
        {!isFullscreen && (
          <div className="border-t border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-center p-2 gap-4">
              <Button
                variant={activePanel === 'layers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActivePanel('layers');
                  setBottomPanelOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Layers
                {doc.nodes.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {doc.nodes.length}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant={activePanel === 'properties' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActivePanel('properties');
                  setBottomPanelOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background">
        {/* Desktop Header */}
        {!isFullscreen && (
          <div className="fixed top-0 left-0 right-0 h-12 border-b border-border bg-card/80 backdrop-blur-sm z-50 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">Professional Studio</div>
              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ViewportControls />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Fullscreen (F)</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        <div className={`flex flex-1 ${!isFullscreen ? 'mt-12' : ''}`}>
          {/* Left Panel - Tools */}
          {!isFullscreen && (
            <div className="w-16 border-r border-border bg-card/30 backdrop-blur-sm">
              {/* Tool icons would go here */}
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            {children}
          </div>

          {/* Right Panel */}
          {!isFullscreen && (
            <div className="w-80 border-l border-border">
              <EnhancedLayersPanel />
            </div>
          )}
        </div>

        {/* Fullscreen Toggle Hint */}
        {isFullscreen && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="bg-card/80 backdrop-blur-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};