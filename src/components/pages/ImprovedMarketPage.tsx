import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { Filter, Grid, List, SortAsc, ShoppingCart, Sparkles, TrendingUp, Package, Heart, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BrandHeader } from '@/components/ui/brand-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { VirtualizedProductGrid } from '@/components/marketplace/VirtualizedProductGrid';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCardSkeleton';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useCart } from '@/hooks/useCart';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useProducts } from '@/hooks/useProducts';
import { StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function ImprovedMarketPage() {
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Custom hooks
  const {
    allDesigns,
    filteredCount,
    trendingDesigns,
    dealsDesigns,
    savedDesigns,
    activeFilters,
    sortBy,
    hasMore,
    handleSearch,
    handleFiltersChange,
    setSortBy,
    loadMore,
    toggleSave,
    isSaved,
    isUnlocked,
    clearSearch,
    clearFilters
  } = useMarketplace();

  const { addToCart, cart } = useCart();
  const { toast } = useToast();
  const { getOptimizedImageUrl } = useImageOptimization();
  const { data: realProducts, isLoading: productsLoading, error: productsError } = useProducts();

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'trending':
        return trendingDesigns;
      case 'new':
        return allDesigns.slice(0, 24);
      case 'deals':
        return dealsDesigns;
      case 'saved':
        return savedDesigns;
      default:
        return allDesigns;
    }
  };

  // Event handlers
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
  const filteredData = currentTabData.filter(design => 
    !searchQuery || 
    design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <BrandHeader title="Marketplace" className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                {/* Placeholder filter content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <div className="space-y-2">
                      {['T-Shirts', 'Hoodies', 'Accessories', 'Prints'].map(category => (
                        <label key={category} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="space-y-2">
                      {['Under $20', '$20 - $50', '$50 - $100', 'Over $100'].map(range => (
                        <label key={range} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center space-y-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Discover Amazing Designs
              </h1>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Explore thousands of unique designs from talented creators
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search designs, creators, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-background/50 border-border/30 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Mobile First */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md pb-4 border-b border-border/20">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-11 bg-muted/30 backdrop-blur-sm rounded-2xl gap-1 mb-4">
              <TabsTrigger value="all" className="rounded-xl text-sm">All</TabsTrigger>
              <TabsTrigger value="trending" className="rounded-xl text-sm">
                <TrendingUp className="h-3 w-3 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-xl text-sm">New</TabsTrigger>
              <TabsTrigger value="saved" className="rounded-xl text-sm">
                <Heart className="h-3 w-3 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>

            {/* Mobile Filter Controls - Scrollable horizontal layout */}
            <div className="block sm:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  onClick={() => setActiveTab('new')}
                  variant={activeTab === 'new' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                  aria-pressed={activeTab === 'new'}
                >
                  New
                </Button>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    clearFilters();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                  disabled={!searchQuery && !Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v)}
                >
                  Clear
                </Button>
                <Button
                  onClick={() => setActiveTab('saved')}
                  variant={activeTab === 'saved' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                  aria-pressed={activeTab === 'saved'}
                >
                  <Heart className="h-3 w-3 mr-2" />
                  Saved
                </Button>
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 h-10 px-4 rounded-xl border-border/40"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Desktop Controls Row */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                {(searchQuery || Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v)) && (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      clearFilters();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-xs"
                  >
                    Clear ({filteredCount} results)
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
                      {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('-', ' ')}
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
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle - Desktop Only */}
                <div className="hidden sm:flex border border-border/40 rounded-xl">
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
          <div className="pt-4">
            {filteredData.length === 0 ? (
              <EmptyState
                type="search"
                title="No designs found"
                description="Try adjusting your search terms or browse by category"
                onAction={() => setSearchQuery('')}
                actionLabel="Clear search"
              />
            ) : (
              <>
                <Suspense fallback={
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                }>
                  <VirtualizedProductGrid
                    designs={filteredData.map((design) => ({
                      ...design,
                      thumbSrc: getOptimizedImageUrl(design.thumbSrc, { format: 'webp', fallback: design.thumbSrc })
                    }))}
                    isLoading={productsLoading}
                    isSaved={isSaved}
                    isUnlocked={isUnlocked}
                    onSave={handleSaveDesign}
                    onQuickView={() => {}}
                    onOpenInStudio={() => {}}
                    onAddToCart={handleAddToCart}
                    onShare={handleShare}
                  />
                </Suspense>
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* Floating Action Button - Mobile */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg lg:hidden z-40"
        size="sm"
        onClick={() => navigate('/sell/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}