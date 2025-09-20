import React from 'react';
import { cn } from '@/lib/utils';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface ScrollAwareBottomNavProps {
  className?: string;
  autoHide?: boolean;
  hideThreshold?: number;
}

export const ScrollAwareBottomNav = ({ 
  className, 
  autoHide = true, 
  hideThreshold = 100 
}: ScrollAwareBottomNavProps) => {
  const { isScrollingDown, scrollY, isAtBottom } = useScrollDirection({ 
    threshold: 20 
  });

  const shouldHide = autoHide && isScrollingDown && scrollY > hideThreshold && !isAtBottom;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
        shouldHide ? "scroll-hide" : "scroll-show",
        className
      )}
    >
      <BottomNavigation />
    </div>
  );
};