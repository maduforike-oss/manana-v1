import { useState, useEffect } from 'react';

interface ViewportDimensions {
  height: number;
  width: number;
  availableHeight: number;
  isMobile: boolean;
  isLandscape: boolean;
}

/**
 * Hook to track viewport dimensions and calculate available scroll height
 * Accounts for browser UI, safe areas, and mobile-specific considerations
 */
export const useViewportHeight = () => {
  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => {
    // Initial dimensions with fallbacks for SSR
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const width = typeof window !== 'undefined' ? window.innerWidth : 400;
    
    return {
      height,
      width,
      availableHeight: height,
      isMobile: width < 768,
      isLandscape: width > height
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDimensions = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isLandscape = width > height;
      
      // Calculate available height accounting for various UI elements
      let availableHeight = height;
      
      // Account for mobile browser UI (address bar, etc.)
      if (isMobile) {
        // Visual viewport API is more accurate for mobile
        if ('visualViewport' in window && window.visualViewport) {
          availableHeight = window.visualViewport.height;
        }
        
        // Additional mobile-specific adjustments
        // Account for potential notches/safe areas on iOS
        const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0');
        const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0');
        availableHeight -= (safeAreaTop + safeAreaBottom);
      }

      setDimensions({
        height,
        width,
        availableHeight: Math.max(availableHeight, 400), // Minimum height fallback
        isMobile,
        isLandscape
      });
    };

    // Initial calculation
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);
    
    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow browser to complete orientation change
      setTimeout(updateDimensions, 150);
    });

    // Listen for visual viewport changes (mobile keyboard, browser UI)
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  // Helper function to calculate container height minus fixed elements
  const calculateScrollHeight = (headerHeight: number = 0, footerHeight: number = 0, padding: number = 0) => {
    const usableHeight = dimensions.availableHeight - headerHeight - footerHeight - padding;
    return Math.max(usableHeight, 200); // Ensure minimum usable height
  };

  return {
    ...dimensions,
    calculateScrollHeight
  };
};