import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateStudioMarketData, StudioGarmentData } from '@/lib/studio/marketData';
import { useLocalSaves, useLocalSearchHistory } from './useLocalSaves';
import { useUnlockedDesigns } from './useUnlockedDesigns';

export type SortOption = 'trending' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'popularity';

export interface MarketFilters {
  garmentTypes: string[];
  baseColors: string[];
  tags: string[];
  priceRange: [number, number];
  inStock: boolean;
  size: string[];
  rating?: number;
}

export interface SearchSuggestion {
  type: 'recent' | 'trending' | 'suggestion';
  text: string;
  count?: number;
}

const ITEMS_PER_PAGE = 20;

export function useMarketplace() {
  const [allDesigns] = useState(() => generateStudioMarketData());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<MarketFilters>({
    garmentTypes: [],
    baseColors: [],
    tags: [],
    priceRange: [0, 100],
    inStock: false,
    size: []
  });
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = useState(true);
  
  const { ids: savedIds, toggle: toggleSave, isSaved } = useLocalSaves();
  const { searches, addSearch } = useLocalSearchHistory();
  const { isUnlocked } = useUnlockedDesigns();

  // Enhanced search with synonyms and typeahead
  const getSearchSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) {
      return [
        ...searches.slice(0, 3).map(s => ({ type: 'recent' as const, text: s })),
        { type: 'trending', text: 'streetwear', count: 234 },
        { type: 'trending', text: 'minimalist', count: 156 },
        { type: 'trending', text: 'vintage', count: 89 },
      ];
    }

    const synonymMap: Record<string, string[]> = {
      'tshirt': ['t-shirt', 'tee', 'shirt'],
      'hoodie': ['sweatshirt', 'pullover'],
      'black': ['dark', 'noir'],
      'white': ['light', 'bright'],
      'streetwear': ['urban', 'street', 'hip-hop'],
      'minimalist': ['minimal', 'clean', 'simple'],
    };

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Direct matches
    allDesigns.forEach(design => {
      if (design.name.toLowerCase().includes(lowerQuery) ||
          design.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        suggestions.push({ type: 'suggestion', text: design.name });
      }
    });

    // Synonym matches
    Object.entries(synonymMap).forEach(([key, synonyms]) => {
      if (synonyms.some(syn => syn.includes(lowerQuery)) || key.includes(lowerQuery)) {
        suggestions.push({ type: 'suggestion', text: key });
      }
    });

    return suggestions.slice(0, 6);
  }, [allDesigns, searches]);

  // Enhanced filtering with real logic
  const filteredDesigns = useMemo(() => {
    let filtered = allDesigns;

    // Search filtering with synonyms
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const synonyms = {
        'tshirt': ['t-shirt', 'tee'],
        'hoodie': ['sweatshirt', 'pullover'],
        'streetwear': ['urban', 'street'],
        'minimalist': ['minimal', 'clean', 'simple'],
      };

      filtered = filtered.filter(design => {
        const matchesName = design.name.toLowerCase().includes(query);
        const matchesTags = design.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesCreator = design.creator.toLowerCase().includes(query);
        
        // Check synonyms
        let matchesSynonyms = false;
        Object.entries(synonyms).forEach(([key, syns]) => {
          if (key.includes(query) || syns.some(syn => syn.includes(query))) {
            matchesSynonyms = matchesSynonyms || 
              design.garmentId.includes(key) || 
              design.tags.some(tag => tag.includes(key));
          }
        });

        return matchesName || matchesTags || matchesCreator || matchesSynonyms;
      });
    }

    // Apply filters
    if (activeFilters.garmentTypes.length > 0) {
      filtered = filtered.filter(design => 
        activeFilters.garmentTypes.includes(design.garmentId)
      );
    }

    if (activeFilters.baseColors.length > 0) {
      filtered = filtered.filter(design => 
        activeFilters.baseColors.includes(design.baseColor)
      );
    }

    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter(design => 
        design.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }

    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 100) {
      filtered = filtered.filter(design => 
        design.price >= activeFilters.priceRange[0] && 
        design.price <= activeFilters.priceRange[1]
      );
    }

    if (activeFilters.rating) {
      filtered = filtered.filter(design => design.rating >= activeFilters.rating!);
    }

    if (activeFilters.inStock) {
      // Mock stock availability - in real app this would be from API
      filtered = filtered.filter(design => Math.random() > 0.1);
    }

    return filtered;
  }, [allDesigns, searchQuery, activeFilters]);

  // Enhanced sorting
  const sortedDesigns = useMemo(() => {
    const sorted = [...filteredDesigns];

    switch (sortBy) {
      case 'trending':
        return sorted.sort((a, b) => (b.views + b.likes) - (a.views + a.likes));
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id)); // Mock newest
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'popularity':
        return sorted.sort((a, b) => b.likes - a.likes);
      default:
        return sorted;
    }
  }, [filteredDesigns, sortBy]);

  // Paginated results for infinite scroll
  const paginatedDesigns = useMemo(() => {
    if (isInfiniteScrollEnabled) {
      return sortedDesigns.slice(0, currentPage * ITEMS_PER_PAGE);
    }
    return sortedDesigns;
  }, [sortedDesigns, currentPage, isInfiniteScrollEnabled]);

  // Category-specific logic
  const getTrendingDesigns = () => {
    return allDesigns
      .filter(design => design.views > 5000)
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  };

  const getDealsDesigns = () => {
    return allDesigns
      .filter(design => design.price < 25) // Mock deals
      .sort((a, b) => a.price - b.price)
      .slice(0, 15);
  };

  const getSavedDesigns = () => {
    return allDesigns.filter(design => savedIds.includes(design.id));
  };

  const getFeaturedDesigns = () => {
    return allDesigns.filter(design => design.featured);
  };

  const getStaffPicksDesigns = () => {
    return allDesigns
      .filter(design => design.rating > 4.7)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);
  };

  // Personalized recommendations
  const getRecommendedDesigns = () => {
    // Mock personalization based on saved items
    const savedTags = getSavedDesigns().flatMap(d => d.tags);
    const savedGarmentTypes = getSavedDesigns().map(d => d.garmentId);
    
    return allDesigns
      .filter(design => 
        design.tags.some(tag => savedTags.includes(tag)) ||
        savedGarmentTypes.includes(design.garmentId)
      )
      .filter(design => !savedIds.includes(design.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      addSearch(query);
    }
  };

  const handleFiltersChange = (filters: MarketFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (paginatedDesigns.length < sortedDesigns.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const hasMore = paginatedDesigns.length < sortedDesigns.length;

  return {
    // Data
    allDesigns: paginatedDesigns,
    filteredCount: sortedDesigns.length,
    totalCount: allDesigns.length,
    
    // Category-specific data
    trendingDesigns: getTrendingDesigns(),
    dealsDesigns: getDealsDesigns(),
    savedDesigns: getSavedDesigns(),
    featuredDesigns: getFeaturedDesigns(),
    staffPicksDesigns: getStaffPicksDesigns(),
    recommendedDesigns: getRecommendedDesigns(),
    
    // State
    searchQuery,
    activeFilters,
    sortBy,
    currentPage,
    hasMore,
    
    // Actions
    handleSearch,
    handleFiltersChange,
    setSortBy,
    loadMore,
    getSearchSuggestions,
    
    // Helpers
    toggleSave,
    isSaved,
    isUnlocked,
    
    // Clear functions
    clearSearch: () => handleSearch(''),
    clearFilters: () => handleFiltersChange({
      garmentTypes: [],
      baseColors: [],
      tags: [],
      priceRange: [0, 100],
      inStock: false,
      size: []
    })
  };
}