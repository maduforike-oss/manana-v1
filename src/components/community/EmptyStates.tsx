import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Heart, 
  TrendingUp, 
  Bookmark,
  Users,
  Plus,
  Sparkles
} from 'lucide-react';

interface EmptyStateProps {
  type: 'feed' | 'trending' | 'following' | 'saved';
  onCreatePost?: () => void;
  onExplore?: () => void;
}

export const EmptyStates: React.FC<EmptyStateProps> = ({
  type,
  onCreatePost,
  onExplore
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'feed':
        return {
          icon: MessageCircle,
          title: "Welcome to the Community!",
          description: "Be the first to share something amazing with the community. Your creativity starts here.",
          primaryAction: {
            label: "Create Your First Post",
            onClick: onCreatePost,
            icon: Plus
          },
          secondaryAction: {
            label: "Explore Trending",
            onClick: onExplore
          }
        };
      
      case 'trending':
        return {
          icon: TrendingUp,
          title: "Nothing's Trending Yet",
          description: "Trending posts will appear here once the community starts engaging. Be part of the conversation!",
          primaryAction: {
            label: "Create Trending Content",
            onClick: onCreatePost,
            icon: Sparkles
          },
          secondaryAction: {
            label: "Check Main Feed",
            onClick: onExplore
          }
        };
      
      case 'following':
        return {
          icon: Users,
          title: "Follow Creators You Love",
          description: "You're not following anyone yet. Discover amazing creators and see their latest posts here.",
          primaryAction: {
            label: "Explore Creators",
            onClick: onExplore,
            icon: Users
          },
          secondaryAction: {
            label: "Create a Post",
            onClick: onCreatePost
          }
        };
      
      case 'saved':
        return {
          icon: Bookmark,
          title: "No Saved Posts Yet",
          description: "Save posts you love to easily find them later. Your saved collection will appear here.",
          primaryAction: {
            label: "Discover Posts",
            onClick: onExplore,
            icon: Heart
          },
          secondaryAction: {
            label: "Create a Post",
            onClick: onCreatePost
          }
        };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;
  const PrimaryIcon = content.primaryAction.icon;

  return (
    <div className="flex justify-center items-center min-h-[400px] p-6">
      <Card className="max-w-md w-full text-center border-dashed">
        <CardContent className="pt-8 pb-6 px-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {content.title}
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {content.description}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={content.primaryAction.onClick}
              className="w-full gap-2"
              size="lg"
            >
              {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
              {content.primaryAction.label}
            </Button>
            
            {content.secondaryAction && (
              <Button 
                variant="outline" 
                onClick={content.secondaryAction.onClick}
                className="w-full"
              >
                {content.secondaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};