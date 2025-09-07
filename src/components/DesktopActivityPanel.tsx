import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { 
  Bookmark, 
  Clock, 
  TrendingUp,
  Sparkles,
  Eye,
  MessageSquare
} from 'lucide-react';

interface DesktopActivityPanelProps {
  className?: string;
}

export const DesktopActivityPanel: React.FC<DesktopActivityPanelProps> = ({ className }) => {
  const recentActivity = [
    { type: 'save', item: 'Sunset Vibes T-Shirt', time: '2m ago' },
    { type: 'view', item: 'Urban Street Design', time: '5m ago' },
    { type: 'comment', item: 'Minimalist Logo', time: '12m ago' },
    { type: 'trend', item: 'Vintage Typography', time: '1h ago' },
  ];

  const trending = [
    { name: 'Gradient Aesthetics', growth: '+24%' },
    { name: 'Retro Gaming', growth: '+18%' },
    { name: 'Nature Themes', growth: '+15%' },
    { name: 'Abstract Art', growth: '+12%' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'save': return <Bookmark className="h-3 w-3" />;
      case 'view': return <Eye className="h-3 w-3" />;
      case 'comment': return <MessageSquare className="h-3 w-3" />;
      case 'trend': return <TrendingUp className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Recent Activity */}
        <Card className="p-4">
          <Heading as="h3" size="h4" className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </Heading>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="mt-1 text-muted-foreground">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-foreground line-clamp-1">{activity.item}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trending Topics */}
        <Card className="p-4">
          <Heading as="h3" size="h4" className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Trending Now
          </Heading>
          <div className="space-y-3">
            {trending.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{trend.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {trend.growth}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <Heading as="h3" size="h4" className="mb-2">
            💡 Pro Tip
          </Heading>
          <p className="text-sm text-muted-foreground mb-3">
            Use keyboard shortcuts to speed up your design workflow. Press 'T' for text tool, 'R' for rectangle.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            View All Shortcuts
          </Button>
        </Card>
      </div>
    </div>
  );
};