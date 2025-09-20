import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { UnifiedBottomNavigation } from '@/components/navigation/UnifiedBottomNavigation';
import { TabRenderer } from '@/components/navigation/TabRenderer';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { SkipToContent } from '@/components/SkipToContent';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useNavigationStore } from '@/lib/navigation/store';
import { useAccessibilityAnnouncer } from '@/components/AccessibilityAnnouncer';
import { useAuth } from '@/lib/auth-context';


const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { activeTab } = useNavigationStore();
  const { announcer, announce } = useAccessibilityAnnouncer();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/landing', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Announce tab changes for accessibility
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabLabels = {
        market: 'Marketplace',
        community: 'Community',
        studio: 'Design Studio', 
        orders: 'Orders',
        profile: 'Profile'
      };
      announce(`Navigated to ${tabLabels[event.detail.to]}`);
    };

    window.addEventListener('tabChange', handleTabChange as EventListener);
    return () => window.removeEventListener('tabChange', handleTabChange as EventListener);
  }, [announce]);

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
          className="flex-1 overflow-hidden"
          id="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <TabRenderer />
        </div>
      </div>
      
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col h-full">
        <div 
          className="flex-1 overflow-hidden"
          id="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <TabRenderer />
        </div>
        
        <UnifiedBottomNavigation />
      </div>
    </div>
  );
};

export default Index;
