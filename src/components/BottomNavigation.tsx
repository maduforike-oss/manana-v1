import { Store, Users, Palette, User, ShoppingCart, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/10" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-between py-2 px-4 max-w-md mx-auto">
        {/* Main Navigation */}
        <div className="flex items-center justify-around flex-1">
          {/* Market */}
          <button
            onClick={() => handleTabClick('market')}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200 min-w-0 text-xs font-medium min-h-[48px] min-w-[48px]",
              activeTab === 'market'
                ? "text-primary bg-primary/10 scale-105 feedback-bounce"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-0.5"
            )}
            aria-label="Navigate to Marketplace"
            aria-current={activeTab === 'market' ? 'page' : undefined}
          >
            <Store className={cn("w-4 h-4 transition-all duration-200", activeTab === 'market' ? "w-5 h-5" : "")} aria-hidden="true" />
            <span className={cn("transition-all duration-200", activeTab === 'market' ? "font-semibold" : "")}>
              Market
            </span>
            <span className="sr-only">Browse marketplace designs</span>
          </button>

          {/* Community */}
          <button
            onClick={() => handleTabClick('community')}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200 min-w-0 text-xs font-medium min-h-[48px] min-w-[48px]",
              activeTab === 'community'
                ? "text-primary bg-primary/10 scale-105 feedback-bounce"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-0.5"
            )}
            aria-label="Navigate to Community"
            aria-current={activeTab === 'community' ? 'page' : undefined}
          >
            <Users className={cn("w-4 h-4 transition-all duration-200", activeTab === 'community' ? "w-5 h-5" : "")} aria-hidden="true" />
            <span className={cn("transition-all duration-200", activeTab === 'community' ? "font-semibold" : "")}>
              Community
            </span>
            <span className="sr-only">Connect with other designers</span>
          </button>

          {/* Studio - Center with special styling */}
          <button
            onClick={() => handleTabClick('studio')}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200 min-w-0 text-xs font-medium min-h-[48px] min-w-[48px]",
              activeTab === 'studio'
                ? "text-primary bg-gradient-to-br from-primary/10 to-secondary/10 scale-105 feedback-bounce"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-0.5"
            )}
            aria-label="Navigate to Design Studio"
            aria-current={activeTab === 'studio' ? 'page' : undefined}
          >
            {activeTab === 'studio' ? (
              <div className="relative">
                <Palette className="w-5 h-5 transition-all duration-200" aria-hidden="true" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm -z-10" />
              </div>
            ) : (
              <Palette className="w-4 h-4 transition-all duration-200" aria-hidden="true" />
            )}
            <span className={cn("transition-all duration-200", activeTab === 'studio' ? "font-semibold" : "")}>
              Studio
            </span>
            <span className="sr-only">Create and edit designs</span>
          </button>
          
          {/* Cart */}
          <button
            onClick={handleCartClick}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200 min-w-0 text-xs font-medium relative min-h-[48px] min-w-[48px]",
              location.pathname === '/cart'
                ? "text-primary bg-primary/10 scale-105 feedback-bounce"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-0.5"
            )}
            aria-label={`Shopping cart${cart.itemCount > 0 ? ` with ${cart.itemCount} items` : ''}`}
            aria-current={location.pathname === '/cart' ? 'page' : undefined}
          >
            <div className="relative">
              <ShoppingCart className={cn("w-4 h-4 transition-all duration-200", location.pathname === '/cart' ? "w-5 h-5" : "")} aria-hidden="true" />
              {cart.itemCount > 0 && (
                <Badge 
                  className="absolute -top-1.5 -right-1.5 h-3 w-3 flex items-center justify-center p-0 text-xs min-w-3 animate-bounce-gentle"
                  variant="destructive"
                  aria-label={`${cart.itemCount} items in cart`}
                >
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </Badge>
              )}
            </div>
            <span className={cn("transition-all duration-200", location.pathname === '/cart' ? "font-semibold" : "")}>
              Cart
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleTabClick('profile')}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200 min-w-0 text-xs font-medium min-h-[48px] min-w-[48px]",
              activeTab === 'profile'
                ? "text-primary bg-primary/10 scale-105 feedback-bounce"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-0.5"
            )}
            aria-label="Navigate to Profile"
            aria-current={activeTab === 'profile' ? 'page' : undefined}
          >
            <User className={cn("w-4 h-4 transition-all duration-200", activeTab === 'profile' ? "w-5 h-5" : "")} aria-hidden="true" />
            <span className={cn("transition-all duration-200", activeTab === 'profile' ? "font-semibold" : "")}>
              Profile
            </span>
            <span className="sr-only">View and edit your profile</span>
          </button>
        </div>

        {/* Theme Toggle with accessibility */}
        <div className="ml-2">
          <ThemeToggle className="w-8 h-8" size="icon" />
        </div>
      </div>
    </nav>
  );
};