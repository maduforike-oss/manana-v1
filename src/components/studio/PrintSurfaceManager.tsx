import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useStudioStore } from '@/lib/studio/store';
import { Square, Circle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrintSurfaceManagerProps {
  className?: string;
}

export const PrintSurfaceManager: React.FC<PrintSurfaceManagerProps> = ({ className }) => {
  const { 
    doc, 
    updateCanvas, 
    switchPrintSurface, 
    toggleSurfaceVisibility,
    getPrintSurfaceNodes,
    activePrintSurface 
  } = useStudioStore();

  const surfaces = doc.canvas.printSurfaces || [];
  const activeSurfaceId = doc.canvas.activeSurface || 'front';

  const handleSurfaceSwitch = (surfaceId: string) => {
    switchPrintSurface(surfaceId);
  };

  const handleToggleVisibility = (surfaceId: string) => {
    toggleSurfaceVisibility(surfaceId);
  };

  const getSurfaceIcon = (surfaceId: string) => {
    switch (surfaceId) {
      case 'front':
        return <Square className="w-4 h-4" />;
      case 'back':
        return <Square className="w-4 h-4 rotate-180" />;
      case 'sleeve':
        return <Circle className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const getSurfaceNodeCount = (surfaceId: string) => {
    return getPrintSurfaceNodes(surfaceId).length;
  };

  const getSurfaceColorCount = (surfaceId: string) => {
    const nodes = getPrintSurfaceNodes(surfaceId);
    const colors = new Set<string>();
    
    nodes.forEach(node => {
      if (node.type === 'text' && node.fill?.color) {
        colors.add(node.fill.color);
      } else if (node.type === 'shape' && node.fill?.color) {
        colors.add(node.fill.color);
      }
    });
    
    return colors.size;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Print Surfaces</Label>
        <p className="text-xs text-muted-foreground">
          Switch between different areas of your garment to design each surface independently.
        </p>
      </div>

      <div className="space-y-2">
        {surfaces.map((surface) => {
          const isActive = surface.id === activeSurfaceId;
          const nodeCount = getSurfaceNodeCount(surface.id);
          const colorCount = getSurfaceColorCount(surface.id);

          return (
            <div
              key={surface.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                isActive 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
              onClick={() => handleSurfaceSwitch(surface.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {getSurfaceIcon(surface.id)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {surface.name}
                      </span>
                      {surface.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {nodeCount} elements
                      </span>
                      {colorCount > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {colorCount} colors
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(surface.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {surface.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Print area dimensions */}
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  Print Area: {surface.area.width}×{surface.area.height}px
                  {surface.maxColors && (
                    <span className="ml-2">• Max {surface.maxColors} colors</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Surface Settings</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="showPrintAreas" className="text-sm">
              Show Print Areas
            </Label>
            <Switch
              id="showPrintAreas"
              checked={doc.canvas.showGuides || false}
              onCheckedChange={(checked) => updateCanvas({ showGuides: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showSafeArea" className="text-sm">
              Show Safe Area
            </Label>
            <Switch
              id="showSafeArea"
              checked={doc.canvas.safeAreaPct > 0}
              onCheckedChange={(checked) => 
                updateCanvas({ safeAreaPct: checked ? 5 : 0 })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};