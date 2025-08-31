import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomNavigation } from '@/components/BottomNavigation';
import { StudioPage } from '@/components/pages/StudioPage';
import { MarketPage } from '@/components/pages/MarketPage';
import { CommunityPage } from '@/components/pages/CommunityPage';
import { OrdersPage } from '@/components/pages/OrdersPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SmartRecognitionShowcase } from '@/components/studio/SmartRecognitionShowcase';

const Index = () => {
  const { activeTab, setUser } = useAppStore();

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

  const renderPage = () => {
    switch (activeTab) {
      case 'market':
        return <MarketPage />;
      case 'community':
        return <CommunityPage />;
      case 'studio':
        return <SmartRecognitionShowcase />;
      case 'orders':
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <MarketPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Index;
