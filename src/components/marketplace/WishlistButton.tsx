import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsWished, useToggleWish } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  showTooltip?: boolean;
}

export function WishlistButton({ 
  productId, 
  className, 
  size = 'sm',
  variant = 'secondary',
  showTooltip = true 
}: WishlistButtonProps) {
  const [user, setUser] = useState<any>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const { data: isWished, isLoading } = useIsWished(productId);
  const toggleWish = useToggleWish(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      // TODO: Open sign-in modal instead of alert
      alert('Please sign in to save products to your wishlist');
      return;
    }

    toggleWish.mutate();
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || toggleWish.isPending}
      className={cn(
        'h-9 w-9 p-0 transition-all duration-200',
        isWished && 'bg-primary text-primary-foreground hover:bg-primary/90',
        !isWished && 'bg-white/90 hover:bg-white shadow-lg',
        className
      )}
      aria-pressed={isWished}
      aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          'h-4 w-4 transition-all duration-200',
          isWished && 'fill-current',
          toggleWish.isPending && 'animate-pulse'
        )} 
      />
    </Button>
  );

  if (!showTooltip) {
    return buttonContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isWished ? 'Saved' : 'Save'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}