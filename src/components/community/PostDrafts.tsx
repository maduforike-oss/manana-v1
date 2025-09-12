import React, { useEffect, useState } from 'react';
import { Save, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Draft {
  id: string;
  content: string;
  savedAt: Date;
  media?: File[];
}

interface PostDraftsProps {
  currentContent: string;
  onLoadDraft: (content: string) => void;
  onClearCurrent: () => void;
}

export const PostDrafts: React.FC<PostDraftsProps> = ({
  currentContent,
  onLoadDraft,
  onClearCurrent
}) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('community-drafts');
    if (savedDrafts) {
      try {
        const parsed = JSON.parse(savedDrafts);
        setDrafts(parsed.map((d: any) => ({ ...d, savedAt: new Date(d.savedAt) })));
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
  }, []);

  // Auto-save current content
  useEffect(() => {
    if (!autoSaveEnabled || !currentContent.trim() || currentContent.length < 10) return;

    const timeoutId = setTimeout(() => {
      saveDraft(currentContent);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [currentContent, autoSaveEnabled]);

  const saveDraft = (content: string, manual = false) => {
    if (!content.trim()) return;

    const newDraft: Draft = {
      id: Date.now().toString(),
      content,
      savedAt: new Date()
    };

    const updatedDrafts = [newDraft, ...drafts.slice(0, 4)]; // Keep max 5 drafts
    setDrafts(updatedDrafts);
    
    localStorage.setItem('community-drafts', JSON.stringify(updatedDrafts));
    
    if (manual) {
      toast.success('Draft saved!');
    }
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('community-drafts', JSON.stringify(updatedDrafts));
    toast.success('Draft deleted');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (drafts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Drafts</span>
          <Badge variant="secondary">{drafts.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => saveDraft(currentContent, true)}
          disabled={!currentContent.trim()}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onLoadDraft(draft.content)}
            >
              <p className="text-sm line-clamp-1">{draft.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(draft.savedAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteDraft(draft.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};