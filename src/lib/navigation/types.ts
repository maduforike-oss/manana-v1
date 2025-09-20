/**
 * Core navigation types and interfaces
 */

export type TabId = 'market' | 'community' | 'studio' | 'orders' | 'profile';

export interface TabState {
  // Tab-specific state that should persist when switching tabs
  scrollPosition: number;
  searchQuery?: string;
  activeFilters?: Record<string, any>;
  selectedItems?: string[];
  // Each tab can define additional state properties
  metadata?: Record<string, any>;
}

export interface NavigationState {
  activeTab: TabId;
  tabStates: Record<TabId, TabState>;
  history: TabId[];
  isTransitioning: boolean;
}

export interface TabConfig {
  id: TabId;
  label: string;
  icon: any;
  component: React.ComponentType;
  // Tab-specific configuration
  preserveState?: boolean;
  resetOnRevisit?: boolean;
  routePath?: string;
}