import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Filter, Grid, List, SortAsc, ShoppingCart, Sparkles, TrendingUp, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BrandHeader } from '@/components/ui/brand-header';
import { FiltersSheet } from '@/components/marketplace/FiltersSheet';
import { QuickViewModal } from '@/components/marketplace/QuickViewModal';
import { PurchaseGateModal } from '@/components/marketplace/PurchaseGateModal';
import { SearchWithSuggestions } from '@/components/marketplace/SearchWithSuggestions';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCardSkeleton';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useCart } from '@/hooks/useCart';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useCache } from '@/hooks/useCache';
import { StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Lazy load components for better performance
const LazyFiltersSheet = lazy(() => import('@/components/marketplace/FiltersSheet').then(m => ({ default: m.FiltersSheet })));
const LazyQuickViewModal = lazy(() => import('@/components/marketplace/QuickViewModal').then(m => ({ default: m.QuickViewModal })));
const LazyPurchaseGateModal = lazy(() => import('@/components/marketplace/PurchaseGateModal').then(m => ({ default: m.PurchaseGateModal })));

export function MarketPage() {
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDesign, setSelectedDesign] = useState<StudioGarmentData | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showPurchaseGate, setShowPurchaseGate] = useState(false);

  // Custom hooks
  const {
    allDesigns,
    filteredCount,
    totalCount,
    trendingDesigns,
    dealsDesigns,
    savedDesigns,
    featuredDesigns,
    staffPicksDesigns,
    recommendedDesigns,
    searchQuery,
    activeFilters,
    sortBy,
    hasMore,
    handleSearch,
    handleFiltersChange,
    setSortBy,
    loadMore,
    getSearchSuggestions,
    toggleSave,
    isSaved,
    isUnlocked,
    clearSearch,
    clearFilters
  } = useMarketplace();

  const { addToCart, cart } = useCart();
  const { toast } = useToast();
  const { getOptimizedImageUrl, preloadImage } = useImageOptimization();
  const cache = useCache<StudioGarmentData[]>();
  const [isLoading, setIsLoading] = useState(false);

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'trending':
        return trendingDesigns;
      case 'new':
        return allDesigns.slice(0, 24);
      case 'popular':
        return allDesigns.filter(d => d.likes > 1000);
      case 'deals':
        return dealsDesigns;
      case 'saved':
        return savedDesigns;
      case 'community':
        return allDesigns.filter(d => !d.featured);
      default:
        return allDesigns;
    }
  };

  // Event handlers
  const handleQuickView = (design: StudioGarmentData) => {
    setSelectedDesign(design);
    setShowQuickView(true);
  };

  const handleOpenInStudio = (design: StudioGarmentData) => {
    if (!isUnlocked(design.id)) {
      setSelectedDesign(design);
      setShowPurchaseGate(true);
      return;
    }
    
    // Use proper navigation instead of window.location.href
    window.history.pushState({}, '', `/studio/editor?design=${design.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSaveDesign = (designId: string) => {
    const wasSaved = isSaved(designId);
    toggleSave(designId);
    
    toast({
      title: wasSaved ? "Removed from saved" : "Design saved",
      description: wasSaved 
        ? "Design removed from your saved items" 
        : "Design added to your saved collection",
    });
  };

  const handleAddToCart = (design: StudioGarmentData) => {
    addToCart({
      id: `${design.id}-${Date.now()}`,
      designId: design.id,
      name: design.name,
      image: design.thumbSrc,
      price: design.price,
      size: 'M',
      color: 'Default',
      garmentType: design.garmentId,
      creator: design.creator,
      listingType: 'print-design'
    });
    
    toast({
      title: "Added to cart",
      description: `${design.name} has been added to your cart`,
    });
  };

  const handleShare = async (design: StudioGarmentData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: design.name,
          text: `Check out this design by ${design.creator}`,
          url: window.location.href + `?design=${design.id}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href + `?design=${design.id}`);
      toast({
        title: "Link copied",
        description: "Design link copied to clipboard",
      });
    }
  };

  const currentTabData = getCurrentTabData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <BrandHeader title="Marketplace" className="border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative rounded-full"
          >
            <ShoppingCart className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {cart.itemCount}
            </Badge>
          </Button>
        </div>
      </BrandHeader>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 max-h-screen overflow-y-auto">
        {/* Hero Search Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Discover Amazing Designs
              </h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore thousands of unique designs from talented creators around the world
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchWithSuggestions
              value={searchQuery}
              onChange={(value) => handleSearch(value)}
              onSearch={handleSearch}
              getSuggestions={getSearchSuggestions}
              placeholder="Search for designs, creators, or styles..."
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pb-4 border-b border-border/20">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-12 bg-muted/30 backdrop-blur-sm rounded-2xl gap-1">
              <TabsTrigger value="all" className="rounded-xl text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="trending" className="rounded-xl text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-xl text-xs sm:text-sm">New</TabsTrigger>
              {/* Second row on mobile */}
              <TabsTrigger value="deals" className="rounded-xl text-xs sm:text-sm col-span-1 sm:col-span-1">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Deals</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="rounded-xl text-xs sm:text-sm">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="rounded-xl text-xs sm:text-sm">
                <span className="hidden sm:inline">Community</span>
                <span className="sm:hidden">More</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters and Controls - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  className="rounded-xl border-border/40"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                      Active
                    </Badge>
                  )}
                </Button>

                {(searchQuery || Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v)) && (
                  <Button
                    onClick={() => {
                      clearSearch();
                      clearFilters();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Clear all ({filteredCount} results)
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl border-border/40">
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('-', ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setSortBy('trending')}>
                      Trending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('newest')}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('popularity')}>
                      Most Popular
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy('price-low')}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price-high')}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy('rating')}>
                      Highest Rated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex border border-border/40 rounded-xl">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-xl rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-r-xl rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            <TabsContent value="all" className="space-y-6 mt-0">
              {allDesigns.length === 0 ? (
                <EmptyState
                  type="search"
                  title="No designs found"
                  description="Try adjusting your search terms or browse by category"
                  onAction={clearSearch}
                  actionLabel="Clear search"
                />
              ) : (
                <>
                  <div className={cn(
                    "gap-3 sm:gap-4 lg:gap-6",
                    viewMode === 'grid' 
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                      : "space-y-3 sm:space-y-4"
                  )}>
                    {isLoading ? (
                      Array.from({ length: 12 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))
                    ) : (
                      allDesigns.map((design) => (
                        <ProductCard
                          key={design.id}
                          design={{
                            ...design,
                            thumbSrc: getOptimizedImageUrl(design.thumbSrc, { format: 'webp', fallback: design.thumbSrc })
                          }}
                          viewMode={viewMode}
                          isSaved={isSaved(design.id)}
                          isUnlocked={isUnlocked(design.id)}
                          onSave={handleSaveDesign}
                          onQuickView={handleQuickView}
                          onOpenInStudio={handleOpenInStudio}
                          onAddToCart={handleAddToCart}
                          onShare={handleShare}
                        />
                      ))
                    )}
                  </div>

                </>
              )}
            </TabsContent>

            {['trending', 'new', 'deals', 'saved', 'community'].map(tab => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {getCurrentTabData().length === 0 ? (
                  <EmptyState
                    type={tab as any}
                    onAction={() => setActiveTab('all')}
                  />
                ) : (
                  <div className={cn(
                    "gap-6",
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                      : "space-y-4"
                  )}>
                    {getCurrentTabData().map((design) => (
                      <ProductCard
                        key={design.id}
                        design={{
                          ...design,
                          thumbSrc: getOptimizedImageUrl(design.thumbSrc, { format: 'webp', fallback: design.thumbSrc })
                        }}
                        viewMode={viewMode}
                        isSaved={isSaved(design.id)}
                        isUnlocked={isUnlocked(design.id)}
                        onSave={handleSaveDesign}
                        onQuickView={handleQuickView}
                        onOpenInStudio={handleOpenInStudio}
                        onAddToCart={handleAddToCart}
                        onShare={handleShare}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Modals */}
      <Suspense fallback={<div />}>
        <LazyFiltersSheet 
          isOpen={showFilters}
          onOpenChange={setShowFilters}
          filters={activeFilters}
          onFiltersChange={handleFiltersChange}
          onClearAll={clearFilters}
        />

        <LazyQuickViewModal
          design={selectedDesign}
          isOpen={showQuickView}
          onClose={() => {
            setShowQuickView(false);
            setSelectedDesign(null);
          }}
          onOpenInStudio={handleOpenInStudio}
          onSave={handleSaveDesign}
          isSaved={selectedDesign ? isSaved(selectedDesign.id) : false}
          isUnlocked={selectedDesign ? isUnlocked(selectedDesign.id) : false}
        />

        <LazyPurchaseGateModal
          design={selectedDesign}
          open={showPurchaseGate}
          onOpenChange={(open) => {
            if (!open) {
              setShowPurchaseGate(false);
              setSelectedDesign(null);
            }
          }}
        />
      </Suspense>
    </div>
  );
}