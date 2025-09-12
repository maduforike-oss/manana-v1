import { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'recent' | 'trending' | 'suggestion' | 'product';
  text: string;
  count?: number;
  id?: string;
}

interface SearchWithHighlightsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  getSuggestions: (query: string) => Promise<SearchSuggestion[]> | SearchSuggestion[];
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  recentSearches?: string[];
  onClearRecent?: () => void;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-primary/20 text-primary font-medium rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
}

export function SearchWithHighlights({
  value,
  onChange,
  onSearch,
  getSuggestions,
  placeholder = "Search designs, creators, or styles...",
  className,
  isLoading = false,
  recentSearches = [],
  onClearRecent
}: SearchWithHighlightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isOpen) return;
      
      setLoadingSuggestions(true);
      try {
        const result = await getSuggestions(value);
        setSuggestions(Array.isArray(result) ? result : []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 150); // Debounce
    return () => clearTimeout(timeoutId);
  }, [value, getSuggestions, isOpen]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange('');
    onSearch('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'product':
        return <Search className="h-4 w-4 text-primary" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const showEmptyState = isOpen && !loadingSuggestions && suggestions.length === 0 && value.trim();
  const showSuggestions = isOpen && (suggestions.length > 0 || loadingSuggestions);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10 pr-10 h-12 rounded-2xl border-border/30 bg-background/50 backdrop-blur-sm focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          disabled={isLoading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {value && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 rounded-full min-h-[44px] min-w-[44px] md:min-h-[24px] md:min-w-[24px]"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-border/30 shadow-xl bg-background/95 backdrop-blur-md max-h-80 overflow-hidden">
          {loadingSuggestions ? (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <div className="p-2 max-h-72 overflow-y-auto">
              <div className="space-y-1" role="listbox">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    ref={(el) => {
                      suggestionRefs.current[index] = el;
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 min-h-[44px]",
                      selectedIndex === index 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50"
                    )}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1 text-sm font-medium">
                      {highlightText(suggestion.text, value)}
                    </span>
                    {suggestion.type === 'recent' && (
                      <Badge variant="outline" className="text-xs">Recent</Badge>
                    )}
                    {suggestion.count && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              {!value.trim() && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['streetwear', 'minimalist', 'vintage', 'retro'].map((term) => (
                      <Badge 
                        key={term}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 min-h-[44px] md:min-h-auto px-3 py-1"
                        onClick={() => handleSuggestionClick({ type: 'suggestion', text: term })}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                  
                  {recentSearches.length > 0 && onClearRecent && (
                    <div className="mt-3 pt-3 border-t border-border/20">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Recent searches</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClearRecent}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear all
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-4 border-border/30 shadow-xl bg-background/95 backdrop-blur-md">
          <div className="text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-2">No results found for "{value}"</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              className="min-h-[44px]"
            >
              Search anyway
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}