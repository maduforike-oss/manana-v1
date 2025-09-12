import React, { useState } from 'react';
import { Search, Filter, Hash, TrendingUp, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedHashtags: string[];
  onHashtagToggle: (hashtag: string) => void;
  selectedUser: string | null;
  onUserSelect: (username: string | null) => void;
  sortBy: 'recent' | 'trending' | 'popular';
  onSortChange: (sort: 'recent' | 'trending' | 'popular') => void;
  trendingHashtags: string[];
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedHashtags,
  onHashtagToggle,
  selectedUser,
  onUserSelect,
  sortBy,
  onSortChange,
  trendingHashtags
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts, hashtags, or @users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Filters Toggle & Sort */}
      <div className="flex items-center justify-between">
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {(selectedHashtags.length > 0 || selectedUser) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedHashtags.length + (selectedUser ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Hashtag Filters */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((hashtag) => (
                    <Badge
                      key={hashtag}
                      variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => onHashtagToggle(hashtag)}
                    >
                      #{hashtag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* User Filter */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </h4>
                {selectedUser ? (
                  <Badge variant="default" className="cursor-pointer" onClick={() => onUserSelect(null)}>
                    @{selectedUser} ✕
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Search for @username in the search bar
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('trending')}
            className="gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Trending
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('popular')}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedHashtags.length > 0 || selectedUser) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Active filters:</span>
          {selectedHashtags.map((hashtag) => (
            <Badge
              key={hashtag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onHashtagToggle(hashtag)}
            >
              #{hashtag} ✕
            </Badge>
          ))}
          {selectedUser && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onUserSelect(null)}
            >
              @{selectedUser} ✕
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};