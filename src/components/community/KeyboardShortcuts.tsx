import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onNewPost: () => void;
  onRefresh: () => void;
  onSearch: () => void;
  onToggleLike?: () => void;
  onNextPost?: () => void;
  onPrevPost?: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onNewPost,
  onRefresh,
  onSearch,
  onToggleLike,
  onNextPost,
  onPrevPost
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + combinations
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            onSearch();
            break;
          case 'n':
            e.preventDefault();
            onNewPost();
            break;
          case 'r':
            e.preventDefault();
            onRefresh();
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (e.key) {
        case 'c':
          onNewPost();
          break;
        case 'r':
          onRefresh();
          break;
        case '/':
          e.preventDefault();
          onSearch();
          break;
        case 'l':
          if (onToggleLike) {
            onToggleLike();
          }
          break;
        case 'j':
          if (onNextPost) {
            onNextPost();
          }
          break;
        case 'k':
          if (onPrevPost) {
            onPrevPost();
          }
          break;
        case '?':
          e.preventDefault();
          showShortcutsHelp();
          break;
      }
    };

    const showShortcutsHelp = () => {
      toast.info(
        'Keyboard Shortcuts:\n' +
        'C - New post\n' +
        'R - Refresh feed\n' +
        '/ - Search\n' +
        'L - Like focused post\n' +
        'J/K - Navigate posts\n' +
        'Ctrl+N - New post\n' +
        'Ctrl+R - Refresh\n' +
        'Ctrl+K - Search\n' +
        '? - Show this help',
        { duration: 5000 }
      );
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewPost, onRefresh, onSearch, onToggleLike, onNextPost, onPrevPost]);

  return null; // This component doesn't render anything
};