import { Store, Users, Palette, Package, User, ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export const BottomNavigation = () => {
  const { setActiveTab } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  const tabs = [
    { id: 'market' as const, label: 'Market', icon: Store },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'studio' as const, label: 'Studio', icon: Palette },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  // Add cart as a special navigation item
  const handleCartClick = () => {
    navigate('/cart');
  };

  // Determine active tab based on pathname
  const pathname = location.pathname;
  const { activeTab: storeActiveTab } = useAppStore();
  
  const activeTab = pathname.startsWith("/studio") ? "studio" :
                   pathname.startsWith("/community") ? "community" :
                   pathname.startsWith("/profile") ? "profile" :
                   pathname === "/" ? storeActiveTab : "market";

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    
    // Navigate to root for each tab to ensure proper state
    if (tabId === 'profile' && !location.pathname.startsWith('/profile/')) {
      // Only navigate if we're not already on a profile page
      navigate('/');
    } else if (!location.pathname.startsWith('/profile/')) {
      // For other tabs, always go to root
      navigate('/');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.slice(0, 2).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
              "min-w-0 flex-1 text-xs font-medium",
              activeTab === id
                ? "text-primary bg-primary/10 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn("w-5 h-5 mb-1", activeTab === id ? "w-6 h-6" : "")} />
            <span className={cn("truncate", activeTab === id ? "font-semibold" : "")}>
              {label}
            </span>
          </button>
        ))}
        
        {/* Cart Button */}
        <button
          onClick={handleCartClick}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
            "min-w-0 flex-1 text-xs font-medium relative",
            location.pathname === '/cart'
              ? "text-primary bg-primary/10 scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <div className="relative">
            <ShoppingCart className={cn("w-5 h-5 mb-1", location.pathname === '/cart' ? "w-6 h-6" : "")} />
            {cart.itemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs min-w-4"
                variant="destructive"
              >
                {cart.itemCount > 9 ? '9+' : cart.itemCount}
              </Badge>
            )}
          </div>
          <span className={cn("truncate", location.pathname === '/cart' ? "font-semibold" : "")}>
            Cart
          </span>
        </button>

        {tabs.slice(2).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
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