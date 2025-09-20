import React from 'react';
import { useNavigationStore } from '@/lib/navigation/store';
import { TabContainer } from './TabContainer';
import { ImprovedMarketPage } from '@/components/pages/ImprovedMarketPage';
import { ImprovedCommunityPage } from '@/components/pages/ImprovedCommunityPage';
import { UnifiedStudioShell } from '@/components/studio/UnifiedStudioShell';
import { OrdersPage } from '@/components/pages/OrdersPage';
import Profile from '@/pages/Profile';

/**
 * Central tab renderer with proper state isolation
 * Each tab is wrapped in a TabContainer for state management
 */
export const TabRenderer = () => {
  const { activeTab, isTransitioning } = useNavigationStore();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <TabContainer tabId="market" preserveScroll={true}>
            <ImprovedMarketPage />
          </TabContainer>
        );
      
      case 'community':
        return (
          <TabContainer tabId="community" preserveScroll={true}>
            <ImprovedCommunityPage />
          </TabContainer>
        );
      
      case 'studio':
        return (
          <TabContainer tabId="studio" preserveScroll={false}>
            <UnifiedStudioShell />
          </TabContainer>
        );
      
      case 'orders':
        return (
          <TabContainer tabId="orders" preserveScroll={true}>
            <OrdersPage />
          </TabContainer>
        );
      
      case 'profile':
        return (
          <TabContainer tabId="profile" preserveScroll={true}>
            <Profile />
          </TabContainer>
        );
      
      default:
        return (
          <TabContainer tabId="market" preserveScroll={true}>
            <ImprovedMarketPage />
          </TabContainer>
        );
    }
  };

  return (
    <div 
      className={`h-full transition-opacity duration-150 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}
      role="tabpanel"
      aria-live="polite"
    >
      {renderTabContent()}
    </div>
  );
};