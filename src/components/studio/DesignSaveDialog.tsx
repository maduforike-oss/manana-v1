import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudioStore } from '@/lib/studio/store';
import { useSupabaseDesignPersistence } from '@/hooks/useSupabaseDesignPersistence';
import { useToast } from '@/hooks/use-toast';

interface DesignSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas?: HTMLCanvasElement | null;
}

export const DesignSaveDialog: React.FC<DesignSaveDialogProps> = ({ open, onOpenChange, canvas }) => {
  const [title, setTitle] = useState('');
  const { doc } = useStudioStore();
  const { saving, saveToSupabase } = useSupabaseDesignPersistence();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your design",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await saveToSupabase(title.trim(), canvas || undefined);
      
      if (result) {
        toast({
          title: "Design Saved",
          description: "Your design has been saved successfully",
        });
        onOpenChange(false);
        setTitle('');
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save design. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save design",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Design</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="design-title">Design Title</Label>
            <Input
              id="design-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter design title..."
              disabled={saving}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Design'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};