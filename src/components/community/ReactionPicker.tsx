import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { REACTION_TYPES, ReactionType } from '@/lib/community';
import { Smile } from 'lucide-react';

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void;
  currentReaction?: ReactionType | null;
  disabled?: boolean;
  className?: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReactionSelect,
  currentReaction,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReactionClick = (reaction: ReactionType) => {
    onReactionSelect(reaction);
    setIsOpen(false);
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`px-3 hover:bg-primary/10 hover:text-primary transition-colors ${
            currentReaction ? 'text-primary bg-primary/10' : ''
          } ${className}`}
          aria-label="Add reaction"
        >
          {currentReaction ? (
            <span className="text-base" role="img" aria-label={currentReaction}>
              {REACTION_TYPES[currentReaction]}
            </span>
          ) : (
            <Smile className="w-4 h-4" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-2" 
        align="start"
        sideOffset={8}
      >
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(REACTION_TYPES).map(([type, emoji]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`h-10 w-10 p-0 hover:bg-muted/50 transition-all duration-200 ${
                currentReaction === type ? 'bg-primary/10 ring-2 ring-primary/20' : ''
              }`}
              onClick={() => handleReactionClick(type as ReactionType)}
              aria-label={`React with ${type}`}
            >
              <span 
                className="text-xl hover:scale-110 transition-transform duration-200" 
                role="img" 
                aria-label={type}
              >
                {emoji}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};