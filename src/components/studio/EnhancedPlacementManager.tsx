import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStudioStore } from '../../lib/studio/store';
import { Plus, X, Eye, EyeOff, DollarSign, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Placement {
  id: string;
  name: string;
  area: { x: number; y: number; width: number; height: number };
  enabled: boolean;
  cost: number;
  maxColors: number;
}

const DEFAULT_PLACEMENTS: Placement[] = [
  {
    id: 'front',
    name: 'Front Center',
    area: { x: 50, y: 100, width: 300, height: 400 },
    enabled: true,
    cost: 0,
    maxColors: 8
  },
  {
    id: 'back',
    name: 'Back Center',
    area: { x: 50, y: 100, width: 300, height: 400 },
    enabled: false,
    cost: 8.50,
    maxColors: 8
  },
  {
    id: 'left-sleeve',
    name: 'Left Sleeve',
    area: { x: 20, y: 50, width: 80, height: 120 },
    enabled: false,
    cost: 4.25,
    maxColors: 4
  },
  {
    id: 'right-sleeve',
    name: 'Right Sleeve',
    area: { x: 20, y: 50, width: 80, height: 120 },
    enabled: false,
    cost: 4.25,
    maxColors: 4
  },
  {
    id: 'pocket',
    name: 'Left Chest',
    area: { x: 30, y: 40, width: 60, height: 60 },
    enabled: false,
    cost: 3.00,
    maxColors: 2
  }
];

export const EnhancedPlacementManager = () => {
  const { doc, updateCanvas, getPrintSurfaces } = useStudioStore();
  const [placements, setPlacements] = useState<Placement[]>(DEFAULT_PLACEMENTS);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const handleTogglePlacement = (placementId: string) => {
    setPlacements(prev => 
      prev.map(p => 
        p.id === placementId 
          ? { ...p, enabled: !p.enabled }
          : p
      )
    );
    
    // Update studio store with new placement configuration
    const updatedPrintSurfaces = placements.map(p => ({
      id: p.id,
      name: p.name,
      area: p.area,
      enabled: p.id === placementId ? !p.enabled : p.enabled,
      maxColors: p.maxColors,
      nodes: []
    }));
    
    updateCanvas({ printSurfaces: updatedPrintSurfaces });
  };

  const getTotalCost = () => {
    return placements
      .filter(p => p.enabled)
      .reduce((total, p) => total + p.cost, 0);
  };

  const getEnabledCount = () => {
    return placements.filter(p => p.enabled).length;
  };

  const getPlacementStatus = (placement: Placement) => {
    const nodes = doc.nodes.filter(node => node.surfaceId === placement.id);
    const colors = new Set();
    
    nodes.forEach(node => {
      if ('fill' in node && node.fill?.color) {
        colors.add(node.fill.color);
      }
      if ('stroke' in node && node.stroke?.color) {
        colors.add(node.stroke.color);
      }
    });

    return {
      nodeCount: nodes.length,
      colorCount: colors.size,
      isOverLimit: colors.size > placement.maxColors
    };
  };

  return (
    <Card className="glass-effect border-border/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Print Placements
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            +${getTotalCost().toFixed(2)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {getEnabledCount()} placement{getEnabledCount() !== 1 ? 's' : ''} selected
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {placements.map((placement) => {
          const status = getPlacementStatus(placement);
          
          return (
            <div
              key={placement.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200",
                placement.enabled 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/50 bg-muted/30",
                activePreview === placement.id && "ring-2 ring-primary/50"
              )}
              onMouseEnter={() => setActivePreview(placement.id)}
              onMouseLeave={() => setActivePreview(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePlacement(placement.id)}
                    className="p-1 h-6 w-6"
                  >
                    {placement.enabled ? (
                      <Eye className="w-3 h-3 text-green-600" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-muted-foreground" />
                    )}
                  </Button>
                  <span className="font-medium text-sm">{placement.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {placement.cost > 0 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        placement.enabled && "border-green-300 bg-green-50 text-green-700"
                      )}
                    >
                      +${placement.cost}
                    </Badge>
                  )}
                  {placement.id === 'front' && (
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>
              </div>

              {placement.enabled && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Elements: {status.nodeCount}</span>
                    <span 
                      className={cn(
                        "font-medium",
                        status.isOverLimit ? "text-red-600" : "text-green-600"
                      )}
                    >
                      Colors: {status.colorCount}/{placement.maxColors}
                    </span>
                  </div>
                  
                  {status.isOverLimit && (
                    <div className="text-red-600 text-xs">
                      ⚠ Too many colors for this placement
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Size: {placement.area.width}×{placement.area.height}px
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Separator className="my-4" />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Placements:</span>
            <span className="font-medium">{getEnabledCount()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Additional Cost:</span>
            <span className="font-medium text-green-600">
              ${getTotalCost().toFixed(2)}
            </span>
          </div>
          
          {getTotalCost() > 15 && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
              💡 Tip: Consider reducing placements to lower costs
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              setPlacements(prev => prev.map(p => ({ ...p, enabled: p.id === 'front' })));
            }}
          >
            Front Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              setPlacements(prev => prev.map(p => ({ 
                ...p, 
                enabled: p.id === 'front' || p.id === 'back' 
              })));
            }}
          >
            Front + Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};