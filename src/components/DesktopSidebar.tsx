import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { 
  TrendingUp, 
  Sparkles, 
  Users, 
  Palette, 
  Store,
  BarChart3,
  MessageSquare,
  Heart
} from 'lucide-react';

interface DesktopSidebarProps {
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className }) => {
  const { activeTab, setActiveTab } = useAppStore();

  const quickStats = [
    { label: 'Trending Designs', value: '2.4k', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Active Creators', value: '892', icon: Users, color: 'text-green-500' },
    { label: 'New This Week', value: '156', icon: Sparkles, color: 'text-purple-500' },
  ];

  const featuredCategories = [
    { name: 'Street Style', count: 234, trending: true },
    { name: 'Minimalist', count: 189, trending: false },
    { name: 'Vintage', count: 156, trending: true },
    { name: 'Typography', count: 134, trending: false },
  ];

  return (
    <div className={cn("desktop-sidebar space-y-6", className)}>
      {/* Quick Stats */}
      <Card className="p-4">
        <Heading as="h3" size="h4" className="mb-4">
          Platform Stats
        </Heading>
        <div className="space-y-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <Badge variant="secondary">{stat.value}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Featured Categories */}
      <Card className="p-4">
        <Heading as="h3" size="h4" className="mb-4">
          Popular Categories
        </Heading>
        <div className="space-y-2">
          {featuredCategories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              className="w-full justify-between h-auto p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{category.name}</span>
                {category.trending && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <Heading as="h3" size="h4" className="mb-4">
          Quick Actions
        </Heading>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setActiveTab('studio')}
          >
            <Palette className="h-4 w-4 mr-2" />
            Start Creating
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setActiveTab('community')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Join Discussion
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setActiveTab('market')}
          >
            <Store className="h-4 w-4 mr-2" />
            Browse Market
          </Button>
        </div>
      </Card>
    </div>
  );
};