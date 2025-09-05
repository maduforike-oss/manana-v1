import { useState, useRef, useEffect } from 'react';
import { Clock, Palette, TrendingUp, X, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLocalSearchHistory } from '@/hooks/useLocalSaves';

interface SearchSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  searchQuery: string;
  className?: string;
}

export const SearchSuggestions = ({ 
  isOpen, 
  onClose, 
  onSelectSuggestion, 
  searchQuery,
  className 
}: SearchSuggestionsProps) => {
  const { searches, clearHistory } = useLocalSearchHistory();
  
  const popularCategories = [
    'Minimalist', 'Streetwear', 'Vintage', 'Abstract', 'Typography',
    'Nature', 'Geometric', 'Retro', 'Anime', 'Music'
  ];

  const trendingSearches = [
    'summer vibes', 'retro gaming', 'plant mom', 'coffee lover',
    'mountain hiking', 'space aesthetic', 'y2k style'
  ];

  const filteredCategories = popularCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrending = trendingSearches.filter(search => 
    search.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Card className={`absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border/50 shadow-lg rounded-xl overflow-hidden animate-fade-in ${className}`}>
      <div className="max-h-80 overflow-y-auto">
        {/* Recent Searches */}
        {searches.length > 0 && searchQuery.length === 0 && (
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Recent</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearHistory}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1">
              {searches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => onSelectSuggestion(search)}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Categories */}
        {(filteredCategories.length > 0 || searchQuery.length === 0) && (
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(searchQuery.length > 0 ? filteredCategories : popularCategories.slice(0, 8)).map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-200 border-border/40"
                  onClick={() => onSelectSuggestion(category)}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Trending Searches */}
        {(filteredTrending.length > 0 || searchQuery.length === 0) && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Trending</span>
            </div>
            <div className="space-y-1">
              {(searchQuery.length > 0 ? filteredTrending : trendingSearches.slice(0, 5)).map((search, index) => (
                <button
                  key={index}
                  onClick={() => onSelectSuggestion(search)}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery.length > 0 && filteredCategories.length === 0 && filteredTrending.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No suggestions found for "{searchQuery}"</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSelectSuggestion(searchQuery)}
              className="mt-2 text-primary hover:text-primary/80"
            >
              Search anyway
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};