"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStudioStore } from '../../lib/studio/store';
import { useState } from 'react';

const shortcuts = [
  { key: 'V', action: 'Select Tool' },
  { key: 'H', action: 'Hand Tool' },
  { key: 'T', action: 'Text Tool' },
  { key: 'I', action: 'Image Tool' },
  { key: 'R', action: 'Rectangle' },
  { key: 'C', action: 'Circle' },
  { key: 'Ctrl/Cmd + Z', action: 'Undo' },
  { key: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
  { key: 'Ctrl/Cmd + D', action: 'Duplicate' },
  { key: 'Delete', action: 'Delete Selection' },
];

export const ShortcutsDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex justify-between">
              <span>{action}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">{key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};