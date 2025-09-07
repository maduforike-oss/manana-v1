import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudioStore } from '../../lib/studio/store';
import { Palette, Type, Square, Circle, Move, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export const LayersPanel = () => {
  const { doc, selectNode, updateNode, removeNode, clearSelection } = useStudioStore();
  
  const handleLayerVisibilityToggle = (nodeId: string) => {
    const node = doc.nodes.find(n => n.id === nodeId);
    if (node) {
      updateNode(nodeId, { hidden: !node.hidden });
    }
  };

  const handleLayerLockToggle = (nodeId: string) => {
    const node = doc.nodes.find(n => n.id === nodeId);
    if (node) {
      updateNode(nodeId, { locked: !node.locked });
    }
  };

  const getLayerIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'shape': return <Square className="w-4 h-4" />;
      case 'image': return <Palette className="w-4 h-4" />;
      default: return <Move className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full overflow-auto">
      <Card className="m-4 glass-effect border-border/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="w-5 h-5" />
            Layers ({doc.nodes.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-2">
          {doc.nodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Move className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Use tools to add content</p>
            </div>
          ) : (
            <>
              {doc.nodes.map((node) => {
                const isSelected = doc.selectedIds.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`
                      p-3 rounded-lg border transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-primary/50 bg-primary/5 shadow-sm' 
                        : 'border-border/30 hover:border-border/60 hover:bg-muted/30'
                      }
                    `}
                    onClick={() => selectNode(node.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-1.5 rounded bg-muted/50">
                        {getLayerIcon(node.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{node.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {node.type} • {Math.round(node.x)}, {Math.round(node.y)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerVisibilityToggle(node.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {node.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerLockToggle(node.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {node.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.id);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="w-full mt-3"
              >
                Clear Selection
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};