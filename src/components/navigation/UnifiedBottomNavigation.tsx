import React from 'react';
import { useNavigationStore } from '@/lib/navigation/store';
import { useCartStore } from '@/store/useCartStore';
import { cn } from '@/lib/utils';
import { ShoppingCart, Users, Palette, User, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TabId } from '@/lib/navigation/types';

const tabs = [
  { id: 'market' as const, label: 'Market', icon: Store },
  { id: 'community' as const, label: 'Community', icon: Users },
  { id: 'studio' as const, label: 'Studio', icon: Palette },
  { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  { id: 'profile' as const, label: 'Profile', icon: User },
];

export const UnifiedBottomNavigation = () => {
  const { activeTab, setActiveTab } = useNavigationStore();
  const { count } = useCartStore();

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/10 safe-area-pb"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-2 sm:px-4 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const showBadge = tab.id === 'orders' && count > 0;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] sm:min-w-[60px] min-h-[48px] sm:min-h-[50px] relative group touch:min-w-[60px] touch:min-h-[52px]",
                  "hover:bg-muted/20 active:scale-95 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                aria-label={`Navigate to ${tab.label}`}
                data-tab={tab.id}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 sm:-top-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-primary rounded-full opacity-80" />
                )}
                
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 touch:w-6 touch:h-6",
                      isActive && "scale-110"
                    )} 
                    aria-hidden="true"
                  />
                  {showBadge && (
                    <Badge 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs p-0 flex items-center justify-center bg-destructive text-destructive-foreground border border-background rounded-full"
                      aria-label={`${count} items in cart`}
                    >
                      {count}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium transition-all duration-200",
                  isActive ? "opacity-100 font-semibold" : "opacity-60"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};