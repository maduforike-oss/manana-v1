import { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'recent' | 'trending' | 'suggestion';
  text: string;
  count?: number;
}

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  getSuggestions: (query: string) => SearchSuggestion[];
  placeholder?: string;
  className?: string;
}

export function SearchWithSuggestions({
  value,
  onChange,
  onSearch,
  getSuggestions,
  placeholder = "Search designs, creators, or tags...",
  className
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const newSuggestions = getSuggestions(value);
    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
  }, [value, getSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

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
          handleSuggestionClick(suggestions[selectedIndex].text);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (text: string) => {
    onChange(text);
    onSearch(text);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    onSearch(value);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    onSearch('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-2 border-border/30 shadow-xl bg-background/95 backdrop-blur-md">
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                ref={(el) => {
                  suggestionRefs.current[index] = el;
                }}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150",
                  selectedIndex === index 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/50"
                )}
              >
                {getSuggestionIcon(suggestion.type)}
                <span className="flex-1 text-sm font-medium">{suggestion.text}</span>
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
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleSuggestionClick('streetwear')}
              >
                streetwear
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleSuggestionClick('minimalist')}
              >
                minimalist
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleSuggestionClick('vintage')}
              >
                vintage
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}