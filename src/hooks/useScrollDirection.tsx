import { useState, useEffect, useCallback } from 'react';

export interface ScrollDirection {
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  scrollY: number;
  isAtTop: boolean;
  isAtBottom: boolean;
}

interface UseScrollDirectionOptions {
  threshold?: number;
  element?: HTMLElement | null;
}

export const useScrollDirection = ({ 
  threshold = 10, 
  element 
}: UseScrollDirectionOptions = {}): ScrollDirection => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({
    isScrollingUp: false,
    isScrollingDown: false,
    scrollY: 0,
    isAtTop: true,
    isAtBottom: false,
  });

  const [lastScrollY, setLastScrollY] = useState(0);

  const updateScrollDirection = useCallback(() => {
    const target = element || window;
    const scrollY = element ? element.scrollTop : window.scrollY;
    const scrollHeight = element ? element.scrollHeight : document.documentElement.scrollHeight;
    const clientHeight = element ? element.clientHeight : window.innerHeight;
    
    const isAtTop = scrollY <= threshold;
    const isAtBottom = scrollY + clientHeight >= scrollHeight - threshold;
    
    if (Math.abs(scrollY - lastScrollY) < threshold) {
      return;
    }
    
    setScrollDirection({
      isScrollingUp: scrollY < lastScrollY,
      isScrollingDown: scrollY > lastScrollY,
      scrollY,
      isAtTop,
      isAtBottom,
    });
    
    setLastScrollY(scrollY);
  }, [element, threshold, lastScrollY]);

  useEffect(() => {
    const target = element || window;
    
    target.addEventListener('scroll', updateScrollDirection, { passive: true });
    
    // Initial call
    updateScrollDirection();
    
    return () => {
      target.removeEventListener('scroll', updateScrollDirection);
    };
  }, [updateScrollDirection, element]);

  return scrollDirection;
};