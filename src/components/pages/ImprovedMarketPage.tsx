import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { Filter, Grid, List, SortAsc, ShoppingCart, Sparkles, TrendingUp, Package, Heart, Search, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BrandHeader } from '@/components/ui/brand-header';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { ProductQuickViewModal } from '@/components/marketplace/ProductQuickViewModal';
import { FiltersSheet } from '@/components/marketplace/FiltersSheet';
import { ProductGridView } from '@/components/marketplace/ProductGridView';
import { ProductListView } from '@/components/marketplace/ProductListView';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { CreateListingModal } from '@/components/marketplace/CreateListingModal';
import { useMarketQueryState } from '@/hooks/useMarketQueryState';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export function ImprovedMarketPage() {
  // URL-synced state management
  const { query, setQuery, resetFilters, parseFilters, hasActiveFilters } = useMarketQueryState();
  const [showFilters, setShowFilters] = useState(false);
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set());
  const [loadingSaved, setLoadingSaved] = useState(false);
  const navigate = useNavigate();
  const { setActiveTab } = useAppStore();

  const handleApplyFilters = (newFilters: any) => {
    setQuery({ filters: newFilters });
    setShowFilters(false);
  };

  // Data fetching
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch } = useProducts(query);
  const cart = useCartStore();
  const { toast } = useToast();

  // Load saved products for authenticated users
  React.useEffect(() => {
    const loadSavedProducts = async () => {
      setLoadingSaved(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setSavedProducts(new Set());
        setLoadingSaved(false);
        return;
      }
      const { data: wishlist } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.user.id);
      setSavedProducts(new Set((wishlist || []).map(w => w.product_id)));
      setLoadingSaved(false);
    };
    if (query.tab === 'saved') {
      loadSavedProducts();
    }
  }, [query.tab]);

  // Event handlers
  const handleSaveProduct = async (productId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your wishlist",
        variant: "destructive",
      });
      return;
    }

    const wasSaved = savedProducts.has(productId);
    
    try {
      if (wasSaved) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.user.id)
          .eq('product_id', productId);
        
        setSavedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await supabase
          .from('wishlists')
          .insert({ user_id: user.user.id, product_id: productId });
        
        setSavedProducts(prev => new Set(prev).add(productId));
      }

      toast({
        title: wasSaved ? "Removed from saved" : "Product saved",
        description: wasSaved 
          ? "Product removed from your wishlist" 
          : "Product added to your wishlist",
      });

      // Refetch if we're on the saved tab
      if (query.tab === 'saved') {
        refetch();
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to update your wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: any) => {
    cart.addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url || '/mockups/tshirt_front_light.png',
      price: product.base_price,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleShare = async (product: any) => {
    const url = `${window.location.origin}/product/${product.slug || product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const products = productsData?.items || [];
  const totalResults = productsData?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <BrandHeader title="Marketplace" className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="relative rounded-full"
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.count > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {cart.count}
              </Badge>
            )}
          </Button>
        </div>
      </BrandHeader>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Banner - Promotional */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-xl sm:text-2xl font-bold">New Season Collection</h2>
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto">
              Premium quality designs at unbeatable prices. Limited time offer!
            </p>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => setQuery({ tab: 'new' })}
            >
              Shop New Arrivals
            </Button>
          </div>
        </div>

        {/* Hero Section - Mobile Optimized */}
        <div className="text-center space-y-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Discover Amazing Designs
              </h1>
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Explore thousands of unique designs from talented creators
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={query.q}
              onChange={(value) => setQuery({ q: value })}
              onClear={() => setQuery({ q: '' })}
              className="w-full"
            />
          </div>
        </div>

        {/* Navigation Tabs - Mobile First */}
        <div className="mb-6">
          <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md pb-4 border-b border-border/20">
            <div className="grid w-full grid-cols-2 sm:grid-cols-4 h-11 bg-muted/30 backdrop-blur-sm rounded-2xl gap-1 mb-4 p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'trending', label: 'Trending', icon: TrendingUp },
                { value: 'new', label: 'New' },
                { value: 'saved', label: 'Saved', icon: Heart },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.value}
                    variant={query.tab === tab.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setQuery({ tab: tab.value as any })}
                    className="rounded-xl text-sm h-9"
                    aria-pressed={query.tab === tab.value}
                  >
                    {Icon && <Icon className="h-3 w-3 mr-2" />}
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Mobile Filter Controls - Scrollable horizontal layout */}
            <div className="block sm:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <FiltersSheet
                    filters={query.filters}
                    onFiltersChange={(newFilters) => setQuery({ filters: newFilters })}
                    onClear={resetFilters}
                    resultCount={totalResults}
                    onApply={handleApplyFilters}
                    onClose={() => setShowFilters(false)}
                    open={showFilters}
                  >
                    <Button
                      onClick={() => setShowFilters(true)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </FiltersSheet>
                
                {(query.q || hasActiveFilters()) && (
                  <Button
                    onClick={() => {
                      setQuery({ q: '' });
                      resetFilters();
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                  >
                    Clear ({totalResults})
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Controls Row */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <FiltersSheet
                  filters={query.filters}
                  onFiltersChange={(newFilters) => setQuery({ filters: newFilters })}
                  onClear={resetFilters}
                  resultCount={totalResults}
                  onApply={handleApplyFilters}
                  onClose={() => setShowFilters(false)}
                  open={showFilters}
                >
                  <Button
                    onClick={() => setShowFilters(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border/40"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </FiltersSheet>

                {/* Desktop Create Listing Button */}
                <Button
                  onClick={() => navigate('/sell/new')}
                  variant="default"
                  size="sm"
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
                
                {(query.q || hasActiveFilters()) && (
                  <Button
                    onClick={() => {
                      setQuery({ q: '' });
                      resetFilters();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-xs"
                  >
                    Clear ({totalResults} results)
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl border-border/40 flex-1 sm:flex-none">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Sort: </span>
                      {query.sort.charAt(0).toUpperCase() + query.sort.slice(1).replace('_', ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setQuery({ sort: 'trending' })}>
                      Trending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setQuery({ sort: 'newest' })}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setQuery({ sort: 'price_asc' })}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setQuery({ sort: 'price_desc' })}>
                      Price: High to Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle - Desktop Only */}
                <div className="hidden sm:flex border border-border/40 rounded-xl">
                  <Button
                    variant={query.view === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setQuery({ view: 'grid' })}
                    className="rounded-l-xl rounded-r-none"
                    aria-pressed={query.view === 'grid'}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={query.view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setQuery({ view: 'list' })}
                    className="rounded-r-xl rounded-l-none"
                    aria-pressed={query.view === 'list'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-4">
            {!productsLoading && products.length === 0 ? (
              <EmptyState
                type="search"
                title={query.tab === 'saved' ? "No saved products" : "No products found"}
                description={
                  query.tab === 'saved' 
                    ? "Start saving products you love to see them here"
                    : "Try adjusting your search terms or filters"
                }
                onAction={() => {
                  if (query.tab === 'saved') {
                    setQuery({ tab: 'all' });
                  } else {
                    setQuery({ q: '' });
                    resetFilters();
                  }
                }}
                actionLabel={query.tab === 'saved' ? "Browse products" : "Clear search"}
              />
            ) : (
              <>
                {query.view === 'grid' ? (
                  <ProductGridView
                    products={products}
                    isLoading={productsLoading}
                    onSave={handleSaveProduct}
                    onQuickView={handleQuickView}
                    onAddToCart={handleAddToCart}
                    onShare={handleShare}
                    isSaved={(id) => savedProducts.has(id)}
                  />
                ) : (
                  <ProductListView
                    products={products}
                    isLoading={productsLoading}
                    onSave={handleSaveProduct}
                    onQuickView={handleQuickView}
                    onAddToCart={handleAddToCart}
                    onShare={handleShare}
                    isSaved={(id) => savedProducts.has(id)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>


      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
        onAddToCart={(product, variant) => {
          console.log('Add to cart:', product, variant);
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
          });
        }}
        onSave={(productId) => handleSaveProduct(productId)}
        onShare={(product) => handleShare(product)}
        isSaved={savedProducts.has(quickViewProduct?.id || '')}
      />

      {/* Floating Action Button - Mobile */}
      <CreateListingModal onSuccess={() => refetch()}>
        <Button
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg lg:hidden z-40"
          size="sm"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </CreateListingModal>
    </div>
  );
}