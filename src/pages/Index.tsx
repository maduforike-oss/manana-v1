import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomNavigation } from '@/components/BottomNavigation';
import { StudioPage } from '@/components/pages/StudioPage';
import { MarketPage } from '@/components/pages/MarketPage';
import { CommunityPage } from '@/components/pages/CommunityPage';
import { OrdersPage } from '@/components/pages/OrdersPage';
import { ProfilePage } from '@/components/pages/ProfilePage';

const Index = () => {
  const { activeTab, setUser } = useAppStore();

  // Initialize mock user for demo
  useEffect(() => {
    setUser({
      id: 'user_123',
      email: 'demo@example.com',
      plan: 'basic',
      designsThisMonth: 12,
      maxDesigns: 30,
    });
  }, [setUser]);

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
        return <StudioPage />;
    }
  };

  return renderPage();
};

export default Index;
