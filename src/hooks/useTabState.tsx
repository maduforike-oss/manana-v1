import { useNavigationStore } from '@/lib/navigation/store';
import { TabId, TabState } from '@/lib/navigation/types';
import { useCallback } from 'react';

/**
 * Hook for managing tab-specific state with proper isolation
 */
export const useTabState = (tabId: TabId) => {
  const { getTabState, updateTabState, clearTabState } = useNavigationStore();
  
  const tabState = getTabState(tabId);
  
  const updateState = useCallback((updates: Partial<TabState>) => {
    updateTabState(tabId, updates);
  }, [tabId, updateTabState]);
  
  const clearState = useCallback(() => {
    clearTabState(tabId);
  }, [tabId, clearTabState]);
  
  const setScrollPosition = useCallback((position: number) => {
    updateTabState(tabId, { scrollPosition: position });
  }, [tabId, updateTabState]);
  
  const setSearchQuery = useCallback((query: string) => {
    updateTabState(tabId, { searchQuery: query });
  }, [tabId, updateTabState]);
  
  const setActiveFilters = useCallback((filters: Record<string, any>) => {
    updateTabState(tabId, { activeFilters: filters });
  }, [tabId, updateTabState]);
  
  const setSelectedItems = useCallback((items: string[]) => {
    updateTabState(tabId, { selectedItems: items });
  }, [tabId, updateTabState]);
  
  const setMetadata = useCallback((metadata: Record<string, any>) => {
    updateTabState(tabId, { metadata });
  }, [tabId, updateTabState]);
  
  return {
    // State
    scrollPosition: tabState.scrollPosition,
    searchQuery: tabState.searchQuery || '',
    activeFilters: tabState.activeFilters || {},
    selectedItems: tabState.selectedItems || [],
    metadata: tabState.metadata || {},
    
    // Actions
    updateState,
    clearState,
    setScrollPosition,
    setSearchQuery,
    setActiveFilters,
    setSelectedItems,
    setMetadata,
  };
};

/**
 * Hook for the currently active tab's state
 */
export const useCurrentTabState = () => {
  const { activeTab } = useNavigationStore();
  return useTabState(activeTab);
};