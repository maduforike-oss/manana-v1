import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { 
  Palette, 
  Store,
  MessageSquare,
  User,
  Package
} from 'lucide-react';

interface DesktopSidebarProps {
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className }) => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className={cn("desktop-sidebar space-y-4", className)}>
      {/* Navigation */}
      <Card className="p-4">
        <Heading as="h3" size="h4" className="mb-4">
          Navigation
        </Heading>
        <div className="space-y-2">
          <Button
            variant={activeTab === 'market' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('market')}
          >
            <Store className="h-4 w-4 mr-3" />
            Marketplace
          </Button>
          <Button
            variant={activeTab === 'community' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('community')}
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            Community
          </Button>
          <Button
            variant={activeTab === 'studio' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => window.location.href = '/studio'}
          >
            <Palette className="h-4 w-4 mr-3" />
            Design Studio
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('orders')}
          >
            <Package className="h-4 w-4 mr-3" />
            Orders
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-4 w-4 mr-3" />
            Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};