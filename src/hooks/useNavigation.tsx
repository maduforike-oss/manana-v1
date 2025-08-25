import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

/**
 * Hook to synchronize bottom navigation tab with current route
 */
export const useRouteSync = () => {
  const location = useLocation();
  const { setActiveTab } = useAppStore();

  useEffect(() => {
    const path = location.pathname;
    
    // Sync tab based on current route
    if (path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.startsWith('/orders')) {
      setActiveTab('orders');
    } else if (path === '/') {
      // Don't change tab on root - let current tab determine the view
    }
  }, [location.pathname, setActiveTab]);
};

/**
 * Hook for consistent back navigation throughout the app
 */
export const useAppNavigation = () => {
  const { setActiveTab } = useAppStore();

  const navigateToTab = (tab: 'market' | 'community' | 'studio' | 'orders' | 'profile') => {
    setActiveTab(tab);
    // Router navigation will be handled by BottomNavigation component
  };

  const navigateBack = (targetTab?: 'market' | 'community' | 'studio' | 'orders' | 'profile') => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    // Navigate to root to show the tab content
    window.history.back();
  };

  return {
    navigateToTab,
    navigateBack,
  };
};