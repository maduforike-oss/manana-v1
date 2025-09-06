import { Store, Users, Palette, Package, User, ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export const AppleBottomNavigation = () => {
  const { setActiveTab } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const [isCompact, setIsCompact] = useState(false);

  const tabs = [
    { id: 'market' as const, label: 'Market', icon: Store },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'studio' as const, label: 'Studio', icon: Palette },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  // Scroll animation effect
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let isScrollingDown = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down
        if (!isScrollingDown) {
          isScrollingDown = true;
          setIsCompact(true);
        }
      } else {
        // Scrolling up
        if (isScrollingDown) {
          isScrollingDown = false;
          setIsCompact(false);
        }
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={cn(
      "apple-nav-bottom",
      isCompact && "nav-compact"
    )}>
      <div className="apple-nav-bottom-content">
        {/* Market */}
        <button
          onClick={() => handleTabClick('market')}
          className={cn(
            "apple-nav-tab",
            activeTab === 'market' && "apple-nav-tab-active"
          )}
        >
          <div className="apple-nav-tab-icon">
            <Store className="w-6 h-6" strokeWidth={1.5} />
            {activeTab === 'market' && (
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150" />
            )}
          </div>
          <span className="apple-nav-tab-label">Market</span>
        </button>

        {/* Community */}
        <button
          onClick={() => handleTabClick('community')}
          className={cn(
            "apple-nav-tab",
            activeTab === 'community' && "apple-nav-tab-active"
          )}
        >
          <div className="apple-nav-tab-icon">
            <Users className="w-6 h-6" strokeWidth={1.5} />
            {activeTab === 'community' && (
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-lg scale-150" />
            )}
          </div>
          <span className="apple-nav-tab-label">Community</span>
        </button>

        {/* Studio - Center position with special styling */}
        <button
          onClick={() => handleTabClick('studio')}
          className={cn(
            "apple-nav-tab apple-nav-tab-studio",
            activeTab === 'studio' && "apple-nav-tab-active"
          )}
        >
          <div className="apple-nav-tab-icon">
            <Palette className="w-6 h-6" strokeWidth={1.5} />
            {activeTab === 'studio' && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg scale-150" />
            )}
          </div>
          <span className="apple-nav-tab-label">Studio</span>
        </button>
        
        {/* Cart Button */}
        <button
          onClick={handleCartClick}
          className={cn(
            "apple-nav-tab",
            location.pathname === '/cart' && "apple-nav-tab-active"
          )}
        >
          <div className="apple-nav-tab-icon">
            <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
            {cart.itemCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-5 bg-primary text-white border-2 border-background"
              >
                {cart.itemCount > 9 ? '9+' : cart.itemCount}
              </Badge>
            )}
            {location.pathname === '/cart' && (
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150" />
            )}
          </div>
          <span className="apple-nav-tab-label">Cart</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={cn(
            "apple-nav-tab",
            activeTab === 'profile' && "apple-nav-tab-active"
          )}
        >
          <div className="apple-nav-tab-icon">
            <User className="w-6 h-6" strokeWidth={1.5} />
            {activeTab === 'profile' && (
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150" />
            )}
          </div>
          <span className="apple-nav-tab-label">Profile</span>
        </button>
      </div>
    </nav>
  );
};