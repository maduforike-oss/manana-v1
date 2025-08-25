"use client";

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';

export const LayersPanel = () => {
  const { doc, selectNode, updateNode, removeNode, duplicate, bringToFront, sendToBack } = useStudioStore();

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="space-y-2">
          {doc.nodes.map((node, index) => (
            <div
              key={node.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                doc.selectedIds.includes(node.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => selectNode(node.id)}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNode(node.id, { hidden: !node.hidden });
                }}
              >
                {node.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNode(node.id, { locked: !node.locked });
                }}
              >
                {node.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
              
              <span className="flex-1 text-sm truncate">{node.name}</span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicate(node.id);
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {doc.nodes.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No layers yet. Start designing!
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};