import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { ShoppingCart, Users, Palette, User, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tabs = [
  { id: 'market' as const, label: 'Market', icon: Store },
  { id: 'community' as const, label: 'Community', icon: Users },
  { id: 'studio' as const, label: 'Studio', icon: Palette },
  { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  { id: 'profile' as const, label: 'Profile', icon: User },
];

export const BottomNavigation = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-t border-border/20 rounded-t-3xl shadow-2xl">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const showBadge = false; // TODO: Add cart functionality

            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 min-w-[72px] min-h-[72px]",
                  isActive
                    ? "bg-gradient-to-br from-primary/15 to-secondary/10 text-primary scale-110 shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:scale-105"
                )}
                aria-label={`Navigate to ${tab.label}`}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-7 h-7 transition-all duration-300",
                    isActive && "drop-shadow-sm filter"
                  )} />
                  {showBadge && (
                    <Badge 
                      className="absolute -top-2 -right-2 min-w-[20px] h-[20px] text-xs p-0 flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white border-2 border-background rounded-full"
                    >
                      0
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-semibold transition-all duration-300 tracking-wide",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {tab.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};