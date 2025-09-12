import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface MarketFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
  price_min?: number;
  price_max?: number;
}

export interface MarketQueryState {
  q: string;
  tab: 'all' | 'trending' | 'new' | 'saved';
  sort: 'trending' | 'newest' | 'price_asc' | 'price_desc';
  view: 'grid' | 'list';
  page: number;
  filters: MarketFilters;
}

const DEFAULT_STATE: MarketQueryState = {
  q: '',
  tab: 'all',
  sort: 'trending',
  view: 'grid',
  page: 1,
  filters: {
    categories: [],
    sizes: [],
    colors: [],
    price_min: undefined,
    price_max: undefined,
  },
};

// Encode/decode filters to/from URL
const encodeFilters = (filters: MarketFilters): string => {
  if (
    filters.categories.length === 0 &&
    filters.sizes.length === 0 &&
    filters.colors.length === 0 &&
    !filters.price_min &&
    !filters.price_max
  ) {
    return '';
  }
  return btoa(JSON.stringify(filters));
};

const decodeFilters = (encoded: string): MarketFilters => {
  if (!encoded) return DEFAULT_STATE.filters;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return DEFAULT_STATE.filters;
  }
};

export function useMarketQueryState() {
  const navigate = useNavigate();
  const location = useLocation();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<string>('');
  
  // Parse URL params into state
  const parseUrlToState = useCallback((): MarketQueryState => {
    const searchParams = new URLSearchParams(location.search);
    const savedView = localStorage.getItem('marketplace-view') as 'grid' | 'list' | null;
    
    return {
      q: searchParams.get('q') || DEFAULT_STATE.q,
      tab: (searchParams.get('tab') as MarketQueryState['tab']) || DEFAULT_STATE.tab,
      sort: (searchParams.get('sort') as MarketQueryState['sort']) || DEFAULT_STATE.sort,
      view: (searchParams.get('view') as MarketQueryState['view']) || savedView || DEFAULT_STATE.view,
      page: parseInt(searchParams.get('page') || '1'),
      filters: decodeFilters(searchParams.get('filters') || ''),
    };
  }, [location.search]);

  const [query, setQueryState] = useState<MarketQueryState>(parseUrlToState);

  // Update state when URL changes (back/forward navigation)
  useEffect(() => {
    const newState = parseUrlToState();
    setQueryState(newState);
  }, [parseUrlToState]);

  const setQuery = useCallback((partial: Partial<MarketQueryState>) => {
    setQueryState(prev => {
      const newState = { ...prev, ...partial };
      // Reset page when changing filters/search/tab/sort
      if ('q' in partial || 'tab' in partial || 'sort' in partial || 'filters' in partial) {
        newState.page = 1;
      }

      // Debounce URL updates to prevent rapid fire
      const searchParams = new URLSearchParams();
      
      if (newState.q) searchParams.set('q', newState.q);
      if (newState.tab !== DEFAULT_STATE.tab) searchParams.set('tab', newState.tab);
      if (newState.sort !== DEFAULT_STATE.sort) searchParams.set('sort', newState.sort);
      if (newState.view !== DEFAULT_STATE.view) searchParams.set('view', newState.view);
      if (newState.page !== DEFAULT_STATE.page) searchParams.set('page', newState.page.toString());
      
      const encodedFilters = encodeFilters(newState.filters);
      if (encodedFilters) searchParams.set('filters', encodedFilters);

      // Save view preference to localStorage
      localStorage.setItem('marketplace-view', newState.view);
      
      const newSearch = searchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      
      // Only update URL if it's different and not the same as last update
      if (newUrl !== `${location.pathname}${location.search}` && newUrl !== lastUpdateRef.current) {
        // Clear existing timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Debounce the URL update
        updateTimeoutRef.current = setTimeout(() => {
          lastUpdateRef.current = newUrl;
          navigate(newUrl, { replace: true });
        }, 100);
      }

      return newState;
    });
  }, [navigate, location.pathname, location.search]);

  const resetFilters = useCallback(() => {
    setQuery({ 
      filters: DEFAULT_STATE.filters,
      page: 1 
    });
  }, [setQuery]);

  const parseFilters = useCallback(() => {
    const { filters } = query;
    return {
      category_id: filters.categories[0] || undefined,
      min_price: filters.price_min,
      max_price: filters.price_max,
      sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
      colors: filters.colors.length > 0 ? filters.colors : undefined,
    };
  }, [query]);

  const hasActiveFilters = useCallback(() => {
    const { filters } = query;
    return (
      filters.categories.length > 0 ||
      filters.sizes.length > 0 ||
      filters.colors.length > 0 ||
      filters.price_min !== undefined ||
      filters.price_max !== undefined
    );
  }, [query]);

  return {
    query,
    setQuery,
    resetFilters,
    parseFilters,
    hasActiveFilters,
  };
}