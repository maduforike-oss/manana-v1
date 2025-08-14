import { Store, Users, Palette, Package, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs = [
    { id: 'market' as const, label: 'Market', icon: Store },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'studio' as const, label: 'Studio', icon: Palette },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
              "min-w-0 flex-1 text-xs font-medium",
              activeTab === id
                ? "text-primary bg-primary/10 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {id === 'studio' && activeTab === id ? (
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-sm" />
              </div>
            ) : (
              <Icon className={cn("w-5 h-5 mb-1", activeTab === id ? "w-6 h-6" : "")} />
            )}
            <span className={cn("truncate", activeTab === id ? "font-semibold" : "")}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};