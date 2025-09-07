import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { ShoppingCart, Users, Palette, User, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const tabs = [
  { id: 'market' as const, label: 'Market', icon: Store },
  { id: 'community' as const, label: 'Community', icon: Users },
  { id: 'studio' as const, label: 'Studio', icon: Palette },
  { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  { id: 'profile' as const, label: 'Profile', icon: User },
];

export const BottomNavigation = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const location = useLocation();

  // Sync tab highlighting with current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/studio')) {
      setActiveTab('studio');
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.startsWith('/orders')) {
      setActiveTab('orders');
    } else if (path.startsWith('/community')) {
      setActiveTab('community');
    } else if (path === '/' && activeTab === 'studio') {
      // Keep current tab when on root
    } else if (path === '/') {
      setActiveTab('market');
    }
  }, [location.pathname, setActiveTab]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/10 safe-area-pb"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-4 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const showBadge = tab.id === 'orders' ? true : false; // TODO: Add cart functionality

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] min-h-[50px] relative group",
                  "hover:bg-muted/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={`Navigate to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
                data-tab={tab.id}
              >
                {/* Clean indicator for active state */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full opacity-80" />
                )}
                
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-200", // Increased from w-5 h-5 for better tap targets
                      isActive && "scale-110"
                    )} 
                    aria-hidden="true"
                  />
                  {showBadge && (
                    <Badge 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs p-0 flex items-center justify-center bg-destructive text-destructive-foreground border border-background rounded-full"
                      aria-label="2 items"
                    >
                      2
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-xs font-medium transition-all duration-200",
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