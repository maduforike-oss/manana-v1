import React, { useRef, useEffect } from 'react';
import { useNavigationStore } from '@/lib/navigation/store';
import { TabId } from '@/lib/navigation/types';
import { cn } from '@/lib/utils';

interface TabContainerProps {
  tabId: TabId;
  children: React.ReactNode;
  className?: string;
  preserveScroll?: boolean;
}

/**
 * Container for individual tab content with state isolation
 * Automatically saves and restores scroll position
 */
export const TabContainer: React.FC<TabContainerProps> = ({ 
  tabId, 
  children, 
  className,
  preserveScroll = true
}) => {
  const { activeTab, getTabState, updateTabState } = useNavigationStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = activeTab === tabId;
  
  // Save scroll position when tab becomes inactive
  useEffect(() => {
    if (!isActive && preserveScroll && containerRef.current) {
      const scrollPosition = containerRef.current.scrollTop;
      updateTabState(tabId, { scrollPosition });
    }
  }, [isActive, tabId, updateTabState, preserveScroll]);
  
  // Restore scroll position when tab becomes active
  useEffect(() => {
    if (isActive && preserveScroll && containerRef.current) {
      const tabState = getTabState(tabId);
      const savedPosition = tabState.scrollPosition || 0;
      
      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = savedPosition;
        }
      });
    }
  }, [isActive, tabId, getTabState, preserveScroll]);
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full overflow-auto momentum-scroll touch-context-scroll",
        "will-change-scroll prevent-layout-shift",
        className
      )}
      data-tab={tabId}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
};