import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomNavigation } from '@/components/BottomNavigation';
import { StudioPage } from '@/components/pages/StudioPage';
import { MarketPage } from '@/components/pages/MarketPage';
import { CommunityPage } from '@/components/pages/CommunityPage';
import { OrdersPage } from '@/components/pages/OrdersPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SkipToContent } from '@/components/SkipToContent';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useRouteSync } from '@/hooks/useNavigation';
import { useAccessibilityAnnouncer } from '@/components/AccessibilityAnnouncer';


const Index = () => {
  const { activeTab, setUser } = useAppStore();
  const scrollPositions = useRef<Record<string, number>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { announcer, announce } = useAccessibilityAnnouncer();
  
  // Sync navigation with routes
  useRouteSync();

  // Initialize mock user for demo
  useEffect(() => {
    setUser({
      id: 'user_123',
      email: 'demo@example.com',
      name: 'Demo User',
      username: '@demouser',
      bio: 'Welcome to the demo!',
      location: 'Demo Location',
      website: 'https://demo.com',
      specialties: ['Demo Design'],
      plan: 'basic',
      designsThisMonth: 12,
      maxDesigns: 30,
      followers: 0,
      following: 0,
      totalDesigns: 5,
      totalOrders: 2,
      socialLinks: [],
      featuredDesigns: [],
    });
  }, [setUser]);

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

  const renderPage = () => {
    switch (activeTab) {
      case 'market':
        return <MarketPage />;
      case 'community':
        return <CommunityPage />;
      case 'studio':
        return <StudioPage />;
      case 'orders':
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <MarketPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <SkipToContent />
      <OnboardingWalkthrough />
      {announcer}
      
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
  );
};

export default Index;
