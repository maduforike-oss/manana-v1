import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  togglePostReaction, 
  REACTION_TYPES, 
  type ReactionType,
  formatReactionCounts 
} from '@/lib/community';
import { toast } from 'sonner';

interface ReactionPickerProps {
  postId: string;
  reactions: Record<string, number> | null;
  userReaction: string | null;
  onReactionUpdate: (reactions: Record<string, number>, userReaction: string | null) => void;
  className?: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  postId,
  reactions,
  userReaction,
  onReactionUpdate,
  className
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (isUpdating) return;

    setIsUpdating(true);
    setShowPicker(false);

    // Optimistic update
    const currentReactions = reactions || {};
    const isCurrentUserReaction = userReaction === reactionType;
    
    let newReactions = { ...currentReactions };
    let newUserReaction = userReaction;

    if (isCurrentUserReaction) {
      // Remove reaction
      newReactions[reactionType] = Math.max((newReactions[reactionType] || 0) - 1, 0);
      if (newReactions[reactionType] === 0) {
        delete newReactions[reactionType];
      }
      newUserReaction = null;
    } else {
      // Add new reaction
      if (userReaction) {
        // Remove previous reaction
        newReactions[userReaction] = Math.max((newReactions[userReaction] || 0) - 1, 0);
        if (newReactions[userReaction] === 0) {
          delete newReactions[userReaction];
        }
      }
      // Add new reaction
      newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      newUserReaction = reactionType;
    }

    onReactionUpdate(newReactions, newUserReaction);

    // Persist to backend
    const { error } = await togglePostReaction(postId, reactionType);
    
    if (error) {
      // Revert optimistic update on error
      onReactionUpdate(reactions || {}, userReaction);
      toast.error(`Failed to update reaction: ${error}`);
    }

    setIsUpdating(false);
  };

  const totalReactions = reactions ? Object.values(reactions).reduce((sum, count) => sum + count, 0) : 0;
  const reactionDisplay = formatReactionCounts(reactions);

  return (
    <div className={cn("relative", className)}>
      {/* Reaction Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        disabled={isUpdating}
        className={cn(
          "h-9 px-3 gap-2 transition-colors",
          userReaction ? "text-primary" : "text-muted-foreground"
        )}
      >
        {userReaction ? (
          <span className="text-base">{REACTION_TYPES[userReaction as ReactionType]}</span>
        ) : (
          <span className="text-base">😀</span>
        )}
        {totalReactions > 0 && (
          <span className="text-sm">{totalReactions}</span>
        )}
      </Button>

      {/* Reaction Summary */}
      {reactionDisplay && (
        <div className="text-xs text-muted-foreground mt-1">
          {reactionDisplay}
        </div>
      )}

      {/* Reaction Picker Popup */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker */}
          <Card className="absolute bottom-full left-0 mb-2 p-3 z-50 shadow-lg border bg-background/95 backdrop-blur-sm">
            <div className="flex gap-2">
              {Object.entries(REACTION_TYPES).map(([type, emoji]) => {
                const reactionType = type as ReactionType;
                const count = reactions?.[reactionType] || 0;
                const isSelected = userReaction === reactionType;

                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReactionClick(reactionType)}
                    disabled={isUpdating}
                    className={cn(
                      "h-10 w-10 p-0 text-lg hover:scale-110 transition-all duration-200",
                      isSelected && "bg-primary/10 scale-110"
                    )}
                    title={`${emoji} ${type} ${count > 0 ? `(${count})` : ''}`}
                  >
                    <span className="relative">
                      {emoji}
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                          {count}
                        </span>
                      )}
                    </span>
                  </Button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};