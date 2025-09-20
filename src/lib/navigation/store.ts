import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { NavigationState, TabId, TabState } from './types';

interface NavigationStore extends NavigationState {
  // Actions
  setActiveTab: (tab: TabId) => void;
  updateTabState: (tab: TabId, updates: Partial<TabState>) => void;
  clearTabState: (tab: TabId) => void;
  resetAllTabs: () => void;
  
  // Navigation helpers
  goBack: () => void;
  canGoBack: () => boolean;
  
  // State isolation utilities
  getTabState: (tab: TabId) => TabState;
  saveCurrentTabState: (updates: Partial<TabState>) => void;
}

const createInitialTabState = (): TabState => ({
  scrollPosition: 0,
  searchQuery: '',
  activeFilters: {},
  selectedItems: [],
  metadata: {},
});

const createInitialState = (): NavigationState => ({
  activeTab: 'market',
  tabStates: {
    market: createInitialTabState(),
    community: createInitialTabState(),
    studio: createInitialTabState(),
    orders: createInitialTabState(),
    profile: createInitialTabState(),
  },
  history: ['market'],
  isTransitioning: false,
});

export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    ...createInitialState(),
    
    setActiveTab: (tab: TabId) => {
      const currentState = get();
      
      // Don't do anything if already on this tab
      if (currentState.activeTab === tab) return;
      
      set((state) => ({
        activeTab: tab,
        history: [...state.history.filter(t => t !== tab), tab],
        isTransitioning: true,
      }));
      
      // Clear transition state after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 150);
    },
    
    updateTabState: (tab: TabId, updates: Partial<TabState>) => {
      set((state) => ({
        tabStates: {
          ...state.tabStates,
          [tab]: {
            ...state.tabStates[tab],
            ...updates,
          },
        },
      }));
    },
    
    clearTabState: (tab: TabId) => {
      set((state) => ({
        tabStates: {
          ...state.tabStates,
          [tab]: createInitialTabState(),
        },
      }));
    },
    
    resetAllTabs: () => {
      set(createInitialState());
    },
    
    goBack: () => {
      const { history } = get();
      if (history.length > 1) {
        const previousTab = history[history.length - 2];
        get().setActiveTab(previousTab);
      }
    },
    
    canGoBack: () => {
      const { history } = get();
      return history.length > 1;
    },
    
    getTabState: (tab: TabId) => {
      const { tabStates } = get();
      return tabStates[tab];
    },
    
    saveCurrentTabState: (updates: Partial<TabState>) => {
      const { activeTab } = get();
      get().updateTabState(activeTab, updates);
    },
  }))
);

// Subscribe to tab changes for cleanup and state management
useNavigationStore.subscribe(
  (state) => state.activeTab,
  (activeTab, previousActiveTab) => {
    if (previousActiveTab && activeTab !== previousActiveTab) {
      // Announce tab change for accessibility
      const event = new CustomEvent('tabChange', {
        detail: { from: previousActiveTab, to: activeTab }
      });
      window.dispatchEvent(event);
    }
  }
);