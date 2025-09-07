import { Search, Heart, Tag, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmptyStateProps {
  type: 'search' | 'saved' | 'category' | 'deals' | 'filtered';
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  suggestions?: string[];
}

export function EmptyState({
  type,
  title,
  description,
  onAction,
  actionLabel,
  suggestions = []
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "No designs found",
          description: description || "Try adjusting your search terms or browse by category",
          actionLabel: actionLabel || "Clear search",
          suggestions: suggestions.length > 0 ? suggestions : ["streetwear", "minimalist", "vintage", "abstract"]
        };
      case 'saved':
        return {
          icon: <Heart className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "No saved designs yet",
          description: description || "Start saving designs you love to see them here",
          actionLabel: actionLabel || "Browse designs",
          suggestions: []
        };
      case 'category':
        return {
          icon: <Tag className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "Coming soon",
          description: description || "We're working on adding more designs to this category",
          actionLabel: actionLabel || "View all designs",
          suggestions: []
        };
      case 'deals':
        return {
          icon: <Package className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "No deals available",
          description: description || "Check back later for amazing deals and discounts",
          actionLabel: actionLabel || "Browse all designs",
          suggestions: []
        };
      case 'filtered':
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "No designs match your filters",
          description: description || "Try removing some filters or changing your criteria",
          actionLabel: actionLabel || "Clear filters",
          suggestions: []
        };
      default:
        return {
          icon: <Sparkles className="h-12 w-12 text-muted-foreground/50" />,
          title: title || "Nothing here yet",
          description: description || "Check back soon for new content",
          actionLabel: actionLabel || "Explore",
          suggestions: []
        };
    }
  };

  const content = getDefaultContent();

  return (
    <Card className="border-border/30 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-12 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted/30">
            {content.icon}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-foreground">
            {content.title}
          </h3>
          <p className="text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Suggestions */}
        {content.suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Try searching for:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {content.suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200"
                  onClick={() => {
                    // This would trigger a search in the parent component
                    // For now, we'll just handle it if onAction is provided
                    if (onAction) onAction();
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onAction && (
          <div className="pt-4">
            <Button 
              onClick={onAction}
              variant="outline"
              className="rounded-xl border-border/40 hover:border-primary/30"
            >
              {content.actionLabel}
            </Button>
          </div>
        )}

        {/* Additional Help */}
        {type === 'search' && (
          <div className="pt-6 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              <strong>Search tips:</strong> Use specific terms like "vintage t-shirt" or browse by creator names
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}