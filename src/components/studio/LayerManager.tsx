import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Professional layer management system
export const LayerManager = () => {
  const { 
    doc, 
    selectNode, 
    updateNode, 
    removeNode, 
    duplicate 
  } = useStudioStore();

  const handleLayerVisibility = (layerId: string, visible: boolean) => {
    updateNode(layerId, { hidden: !visible });
  };

  const handleLayerLock = (layerId: string, locked: boolean) => {
    updateNode(layerId, { locked });
  };

  const handleLayerSelect = (layerId: string) => {
    selectNode(layerId);
  };

  const handleDuplicateLayer = (layerId: string) => {
    duplicate(layerId);
  };

  const handleDeleteLayer = (layerId: string) => {
    removeNode(layerId);
  };

  return (
    <div className="w-64 h-full bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Layers</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {doc.nodes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No layers yet. Start designing!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {doc.nodes.map((layer, index) => {
              const isSelected = doc.selectedIds.includes(layer.id);
              const isVisible = !layer.hidden;
              const isLocked = layer.locked;
              
              return (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-primary/10 border border-primary/20"
                  )}
                  onClick={() => handleLayerSelect(layer.id)}
                >
                  {/* Layer visibility toggle */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLayerVisibility(layer.id, !isVisible);
                    }}
                  >
                    {isVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                  
                  {/* Layer lock toggle */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLayerLock(layer.id, !isLocked);
                    }}
                  >
                    {isLocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                  
                  {/* Layer name and type */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {layer.name || `${layer.type} ${index + 1}`}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {layer.type}
                    </div>
                  </div>
                  
                  {/* Layer actions */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateLayer(layer.id);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        {doc.nodes.length} layer{doc.nodes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};