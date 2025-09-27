import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

/**
 * Hook to synchronize bottom navigation tab with current route
 */
export const useRouteSync = () => {
  const location = useLocation();
  const { activeTab, setActiveTab } = useAppStore();
  const navigate = useNavigate();

  // Sync tab to route
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/studio')) {
      setActiveTab('studio');
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.startsWith('/orders')) {
      setActiveTab('orders');
    } else if (path.startsWith('/community')) {
      setActiveTab('community');
    } else if (path.startsWith('/market')) {
      setActiveTab('market');
    } else if (path === '/') {
      // Default to market if no specific route
      if (!activeTab || activeTab === 'studio') {
        setActiveTab('market');
      }
    }
  }, [location.pathname, setActiveTab, activeTab]);

  // Sync route to tab when tab changes
  useEffect(() => {
    const path = location.pathname;
    const shouldNavigate = () => {
      switch (activeTab) {
        case 'market':
          return path !== '/' && path !== '/market';
        case 'community':
          return !path.startsWith('/community');
        case 'orders':
          return !path.startsWith('/orders');
        case 'profile':
          return !path.startsWith('/profile') || path === '/profile/edit' || path === '/profile/settings';
        case 'studio':
          return !path.startsWith('/studio');
        default:
          return false;
      }
    };

    if (shouldNavigate()) {
      const targetPath = activeTab === 'market' ? '/' : `/${activeTab}`;
      navigate(targetPath, { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);
};

/**
 * Hook for consistent back navigation throughout the app
 */
export const useAppNavigation = () => {
  const { setActiveTab } = useAppStore();
  const navigate = useNavigate();

  const navigateToTab = (tab: 'market' | 'community' | 'studio' | 'orders' | 'profile') => {
    setActiveTab(tab);
    
    const targetPath = (() => {
      switch (tab) {
        case 'market':
          return '/';
        case 'studio':
          return '/studio';
        default:
          return `/${tab}`;
      }
    })();
    
    navigate(targetPath);
  };

  const navigateBack = (targetTab?: 'market' | 'community' | 'studio' | 'orders' | 'profile') => {
    if (targetTab) {
      navigateToTab(targetTab);
    } else {
      navigate(-1);
    }
  };

  return {
    navigateToTab,
    navigateBack,
  };
};