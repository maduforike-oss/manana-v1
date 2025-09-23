import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useStudioStore } from '../../lib/studio/store';
import { 
  Layers, Type, Square, Circle, Triangle, Image as ImageIcon, Brush, Star,
  Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Copy, Edit3,
  Plus, Minus, MoreHorizontal
} from 'lucide-react';
import { LayerItem } from './LayerItem';
import { Node } from '@/lib/studio/types';

export const EnhancedLayersPanel = () => {
  const { 
    doc, 
    reorderNodes, 
    selectNode, 
    selectMany, 
    clearSelection, 
    updateNode, 
    removeNode, 
    duplicate,
    addNode
  } = useStudioStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  
  // Filter layers based on search and visibility
  const filteredNodes = useMemo(() => {
    return doc.nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           node.type.toLowerCase().includes(searchTerm.toLowerCase());
      const visibilityCheck = showHidden || !node.hidden;
      return matchesSearch && visibilityCheck;
    });
  }, [doc.nodes, searchTerm, showHidden]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    reorderNodes(sourceIndex, destinationIndex);
  };

  const handleBulkAction = (action: 'hide' | 'show' | 'lock' | 'unlock' | 'delete') => {
    doc.selectedIds.forEach(id => {
      switch (action) {
        case 'hide':
        case 'show':
          updateNode(id, { hidden: action === 'hide' });
          break;
        case 'lock':
        case 'unlock':
          updateNode(id, { locked: action === 'lock' });
          break;
        case 'delete':
          removeNode(id);
          break;
      }
    });
  };

  const selectedCount = doc.selectedIds.length;
  const visibleCount = doc.nodes.filter(n => !n.hidden).length;
  const lockedCount = doc.nodes.filter(n => n.locked).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Layers</h3>
              <p className="text-xs text-muted-foreground">
                {doc.nodes.length} total • {visibleCount} visible
              </p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Add new layer (example: text layer)
                    const newNode: Node = {
                      id: `text-${Date.now()}`,
                      type: 'text',
                      name: 'New Text',
                      x: 100,
                      y: 100,
                      width: 200,
                      height: 40,
                      rotation: 0,
                      opacity: 1,
                      text: 'New Text',
                      fontFamily: 'Inter',
                      fontSize: 24,
                      fontWeight: 400,
                      lineHeight: 1.2,
                      letterSpacing: 0,
                      align: 'left',
                      fill: { type: 'solid', color: '#000000' }
                    };
                    addNode(newNode);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Layer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search */}
        <Input
          placeholder="Search layers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-sm"
        />

        {/* Stats Bar */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selected
          </Badge>
          {lockedCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              {lockedCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="p-2 border-b border-border/20 bg-muted/30">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('hide')}
              className="h-7 px-2"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hide
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('show')}
              className="h-7 px-2"
            >
              <Eye className="w-3 h-3 mr-1" />
              Show
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('lock')}
              className="h-7 px-2"
            >
              <Lock className="w-3 h-3 mr-1" />
              Lock
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="h-7 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No layers found</p>
              <p className="text-xs mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Start designing to create layers'}
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="layers">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-1 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''
                    }`}
                  >
                    {filteredNodes.map((node, index) => (
                      <Draggable 
                        key={node.id} 
                        draggableId={node.id} 
                        index={index}
                        isDragDisabled={node.locked}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''} transition-transform duration-150`}
                          >
                            <LayerItem
                              node={node}
                              isSelected={doc.selectedIds.includes(node.id)}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                              onSelect={() => selectNode(node.id)}
                              onUpdate={(updates) => updateNode(node.id, updates)}
                              onDelete={() => removeNode(node.id)}
                              onDuplicate={() => duplicate(node.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t border-border/20 bg-card/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredNodes.length} of {doc.nodes.length} layers</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHidden(!showHidden)}
              className="h-6 px-2 text-xs"
            >
              {showHidden ? 'Hide Hidden' : 'Show All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 px-2 text-xs"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};