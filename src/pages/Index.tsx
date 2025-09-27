import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { BottomNavigation } from '@/components/BottomNavigation';
import { UnifiedStudioShell } from '@/components/studio/UnifiedStudioShell';
import { ImprovedMarketPage } from '@/components/pages/ImprovedMarketPage';
import { ImprovedCommunityPage } from '@/components/pages/ImprovedCommunityPage';
import { OrdersPage } from '@/components/pages/OrdersPage';
import ProfileHub from '@/pages/ProfileHub';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { SkipToContent } from '@/components/SkipToContent';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useRouteSync } from '@/hooks/useNavigation';
import { useAccessibilityAnnouncer } from '@/components/AccessibilityAnnouncer';
import { useAuth } from '@/lib/auth-context';


const Index = () => {
  const { activeTab } = useAppStore();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollPositions = useRef<Record<string, number>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { announcer, announce } = useAccessibilityAnnouncer();
  
  // Sync navigation with routes
  useRouteSync();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/landing', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Save scroll position when switching tabs
  useEffect(() => {
    return () => {
      if (mainContentRef.current) {
        scrollPositions.current[activeTab] = mainContentRef.current.scrollTop;
      }
    };
  }, [activeTab]);

  // Restore scroll position when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      const savedPosition = scrollPositions.current[activeTab] || 0;
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = savedPosition;
        }
      }, 100);
    }
    
    // Announce page change for screen readers
    const tabLabels = {
      market: 'Marketplace',
      community: 'Community',
      studio: 'Design Studio', 
      orders: 'Orders',
      profile: 'Profile'
    };
    announce(`Navigated to ${tabLabels[activeTab]}`);
  }, [activeTab, announce]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const renderPage = () => {
    const path = location.pathname;
    
    // Route-based rendering
    if (path.startsWith('/studio')) {
      return <UnifiedStudioShell />;
    } else if (path.startsWith('/profile')) {
      return <ProfileHub />;
    } else if (path.startsWith('/orders')) {
      return <OrdersPage />;
    } else if (path.startsWith('/community')) {
      return <ImprovedCommunityPage />;
    } else {
      // Default to market for root and /market
      return <ImprovedMarketPage />;
    }
  };

  return (
    <div className="flex flex-col lg:block h-screen bg-background text-foreground">
      <SkipToContent />
      <OnboardingWalkthrough />
      {announcer}
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex desktop-layout h-full">
        <div className="w-80 p-4 border-r border-border">
          <DesktopSidebar />
        </div>
        
        <div 
          className="flex-1 overflow-auto modern-scroll will-change-scroll prevent-layout-shift"
          ref={mainContentRef}
          id="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          {renderPage()}
        </div>
      </div>
      
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col h-full">
        <div 
          className="flex-1 overflow-hidden modern-scroll will-change-scroll prevent-layout-shift"
          ref={mainContentRef}
          id="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          {renderPage()}
        </div>
        
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Index;
