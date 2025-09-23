import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export interface ResponsiveStudioState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  showMobileToolbar: boolean;
  showDesktopToolbar: boolean;
  panelLayout: 'mobile' | 'tablet' | 'desktop';
  canUseResizablePanels: boolean;
}

export const useResponsiveStudio = () => {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Tablet detection: 768px - 1023px or device orientation change on mobile
      setIsTablet(width >= 768 && width < 1024);
      
      // Touch device detection
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkDevice();
    
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  const isDesktop = !isMobile && !isTablet;
  
  const panelLayout: ResponsiveStudioState['panelLayout'] = 
    isMobile ? 'mobile' : 
    isTablet ? 'tablet' : 
    'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    showMobileToolbar: isMobile,
    showDesktopToolbar: isDesktop || isTablet,
    panelLayout,
    canUseResizablePanels: isDesktop,
    
    // Responsive breakpoints
    breakpoints: {
      mobile: isMobile,
      tablet: isTablet,
      desktop: isDesktop,
      touch: isTouch
    },
    
    // Layout configurations
    layout: {
      // Touch target sizes
      minTouchTarget: isTouch ? 44 : 32,
      toolbarHeight: isMobile ? 56 : 48,
      statusBarHeight: 32,
      
      // Panel sizes
      leftPanelWidth: isDesktop ? 280 : isTablet ? 240 : 0,
      rightPanelWidth: isDesktop ? 280 : isTablet ? 240 : 0,
      
      // Spacing
      spacing: isMobile ? 'compact' : 'normal',
      
      // Animation preferences
      animationDuration: isMobile ? 200 : 300,
    }
  };
};