import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export function useProductRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current state from URL
  const getCurrentTab = () => searchParams.get('tab') || 'all';
  const getCurrentSearch = () => searchParams.get('search') || '';
  const getCurrentFilters = () => {
    const filtersParam = searchParams.get('filters');
    if (!filtersParam) return null;
    
    try {
      return JSON.parse(decodeURIComponent(filtersParam));
    } catch {
      return null;
    }
  };
  const getCurrentSort = () => searchParams.get('sort') || 'trending';
  const getCurrentView = () => (searchParams.get('view') as 'grid' | 'list') || 'grid';

  // Update URL with state
  const updateUrl = useCallback((updates: {
    tab?: string;
    search?: string;
    filters?: any;
    sort?: string;
    view?: 'grid' | 'list';
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.tab !== undefined) {
      if (updates.tab === 'all') {
        newParams.delete('tab');
      } else {
        newParams.set('tab', updates.tab);
      }
    }

    if (updates.search !== undefined) {
      if (updates.search === '') {
        newParams.delete('search');
      } else {
        newParams.set('search', updates.search);
      }
    }

    if (updates.filters !== undefined) {
      if (!updates.filters || Object.keys(updates.filters).length === 0) {
        newParams.delete('filters');
      } else {
        newParams.set('filters', encodeURIComponent(JSON.stringify(updates.filters)));
      }
    }

    if (updates.sort !== undefined) {
      if (updates.sort === 'trending') {
        newParams.delete('sort');
      } else {
        newParams.set('sort', updates.sort);
      }
    }

    if (updates.view !== undefined) {
      if (updates.view === 'grid') {
        newParams.delete('view');
      } else {
        newParams.set('view', updates.view);
      }
    }

    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Navigate to product detail
  const navigateToProduct = useCallback((productId: string) => {
    navigate(`/product/${productId}`, { 
      state: { 
        returnUrl: location.pathname + location.search 
      }
    });
  }, [navigate, location]);

  // Go back to market with preserved state
  const navigateBack = useCallback(() => {
    const state = history.state?.usr;
    if (state?.returnUrl) {
      navigate(state.returnUrl);
    } else {
      navigate('/');
    }
  }, [navigate]);

  return {
    // Current state
    currentTab: getCurrentTab(),
    currentSearch: getCurrentSearch(),
    currentFilters: getCurrentFilters(),
    currentSort: getCurrentSort(),
    currentView: getCurrentView(),
    
    // Actions
    updateUrl,
    navigateToProduct,
    navigateBack,
    
    // Helpers
    setTab: (tab: string) => updateUrl({ tab }),
    setSearch: (search: string) => updateUrl({ search }),
    setFilters: (filters: any) => updateUrl({ filters }),
    setSort: (sort: string) => updateUrl({ sort }),
    setView: (view: 'grid' | 'list') => updateUrl({ view }),
  };
}