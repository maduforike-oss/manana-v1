import { Search, Heart, Bookmark, Filter, TrendingUp, Star, Eye, Download, Grid3X3, LayoutGrid, List, Play, Palette, Ruler, Layers, Info, ShoppingBag, Truck, X, ChevronRight, Package, Sparkles, User, Award, Users, Crown, Lock, ShoppingCart, Plus, Store } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { generateStudioMarketData, StudioGarmentData, FILTER_PRESETS, PrintAreaSize } from '@/lib/studio/marketData';
import { useAppStore } from '@/store/useAppStore';
import { useLocalSaves, useLocalSearchHistory } from '@/hooks/useLocalSaves';
import { useUnlockedDesigns } from '@/hooks/useUnlockedDesigns';
import { useCart } from '@/hooks/useCart';
import { SearchSuggestions } from '@/components/marketplace/SearchSuggestions';
import { FiltersSheet } from '@/components/marketplace/FiltersSheet';
import { QuickViewModal } from '@/components/marketplace/QuickViewModal';
import { PurchaseGateModal } from '@/components/marketplace/PurchaseGateModal';

export const MarketPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setActiveTab: setAppActiveTab } = useAppStore();
  const { ids: savedIds, toggle: toggleSave, isSaved } = useLocalSaves();
  const { addSearch } = useLocalSearchHistory();
  const { isUnlocked } = useUnlockedDesigns();
  const { cart } = useCart();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<StudioGarmentData | null>(null);
  const [showPurchaseGate, setShowPurchaseGate] = useState(false);
  const [purchaseGateDesign, setPurchaseGateDesign] = useState<StudioGarmentData | null>(null);

  // Filters state - match FiltersSheet interface
  const [filters, setFilters] = useState({
    garmentTypes: [] as string[],
    baseColors: [] as string[],
    tags: [] as string[],
    priceRange: [0, 100] as [number, number],
    inStock: true,
    size: [] as string[]
  });

  // Generate market data
  const allDesigns = useMemo(() => generateStudioMarketData(), []);

  // Apply filters and search
  const filteredDesigns = useMemo(() => {
    let designs = allDesigns;

    // Category filter
    if (activeCategory !== 'all') {
      switch (activeCategory) {
        case 'trending':
          designs = designs.filter(d => d.featured || d.likes > 500);
          break;
        case 'new':
          designs = designs.filter(d => d.views < 1000); // New designs have fewer views
          break;
        case 'popular':
          designs = designs.filter(d => d.likes > 500);
          break;
        case 'premium':
          designs = designs.filter(d => d.price > 25);
          break;
        case 'community':
          designs = designs.filter(d => d.price <= 25);
          break;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      designs = designs.filter(design =>
        design.name.toLowerCase().includes(query) ||
        design.tags.some(tag => tag.toLowerCase().includes(query)) ||
        design.creator.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (filters.garmentTypes.length > 0) {
      designs = designs.filter(d => filters.garmentTypes.some(type => d.garmentId.includes(type)));
    }

    if (filters.baseColors.length > 0) {
      designs = designs.filter(d => filters.baseColors.includes(d.baseColor));
    }

    if (filters.tags.length > 0) {
      designs = designs.filter(d => filters.tags.some(tag => d.tags.includes(tag)));
    }

    return designs;
  }, [allDesigns, activeCategory, searchQuery, filters]);

  // Sort designs
  const sortedDesigns = useMemo(() => {
    return [...filteredDesigns].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.views - a.views; // Newer designs have fewer views
        case 'popular':
          return b.likes - a.likes;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [filteredDesigns, sortBy]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.garmentTypes.length > 0 ||
           filters.baseColors.length > 0 ||
           filters.tags.length > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 100 ||
           searchQuery.length > 0;
  }, [filters, searchQuery]);

  // Event handlers
  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearch(searchQuery.trim());
      setFilters(prev => ({ ...prev, search: searchQuery.trim() }));
    }
    setShowSuggestions(false);
  };

  const handleQuickView = (design: StudioGarmentData) => {
    setSelectedDesign(design);
    setShowQuickView(true);
  };

  const handleOpenInStudio = (design: StudioGarmentData) => {
    setAppActiveTab('studio');
    navigate('/studio/editor', { state: { design } });
  };

  const handleSaveDesign = (designId: string) => {
    toggleSave(designId);
    toast({
      title: isSaved(designId) ? "Removed from saved" : "Design saved",
      description: isSaved(designId) ? "Design removed from your saved collection" : "You can find this design in your saved collection",
    });
  };

  const clearAllFilters = () => {
    setFilters({
      garmentTypes: [],
      baseColors: [],
      tags: [],
      priceRange: [0, 100],
      inStock: true,
      size: []
    });
    setSearchQuery('');
    setActiveCategory('all');
  };

  // Mock trending designers data
  const trendingDesigners = [
    { id: '1', name: 'Elena Martinez', avatar: '', followers: '12.4K', badge: 'Top Creator', specialty: 'Minimalist' },
    { id: '2', name: 'Alex Chen', avatar: '', followers: '8.9K', badge: 'Rising Star', specialty: 'Street Art' },
    { id: '3', name: 'Maya Patel', avatar: '', followers: '15.2K', badge: 'Fashion Pro', specialty: 'Typography' },
    { id: '4', name: 'Jordan Kim', avatar: '', followers: '6.7K', badge: 'New Talent', specialty: 'Abstract' }
  ];

  return (
    <>
      <div className="min-h-screen bg-background modern-scroll">
        <BrandHeader 
          title="Marketplace" 
          subtitle="Discover unique fashion designs from creators worldwide"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cart')}
            className="relative glass-effect border-border/20 min-h-[48px] min-w-[48px] rounded-2xl"
            aria-label={`Shopping cart${cart.itemCount > 0 ? ` with ${cart.itemCount} items` : ''}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-[20px] h-[20px] text-xs p-0 flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white border-2 border-background rounded-full">
                {cart.itemCount}
              </Badge>
            )}
          </Button>
        </BrandHeader>

        {/* Main Content */}
        <div className="p-4 sm:p-6 pt-20">
          
          {/* Search Bar with enhanced design */}
          <div className="relative mb-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search designs, styles, creators..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-12 pr-12 h-14 rounded-2xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 text-lg placeholder:text-muted-foreground/60 transition-all duration-300"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setFilters(prev => ({ ...prev, search: '' }));
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && searchQuery && (
              <SearchSuggestions
                isOpen={true}
                onClose={() => setShowSuggestions(false)}
                onSelectSuggestion={(suggestion) => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
                searchQuery={searchQuery}
                className="max-w-xl mx-auto"
              />
            )}
          </div>

          {/* Categories */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
            <div className="flex items-center gap-4 mb-6 overflow-x-auto scrollbar-hide">
              <TabsList className="grid grid-cols-6 bg-background/50 backdrop-blur-sm rounded-2xl p-1 border border-border/50">
                <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                <TabsTrigger value="trending" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Trending</TabsTrigger>
                <TabsTrigger value="new" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">New</TabsTrigger>
                <TabsTrigger value="popular" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Popular</TabsTrigger>
                <TabsTrigger value="premium" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Premium</TabsTrigger>
                <TabsTrigger value="community" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Community</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 ml-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] rounded-xl bg-background/50 backdrop-blur-sm border-border/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(true)}
                  className={cn(
                    "rounded-xl bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300",
                    hasActiveFilters && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                <div className="flex border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg h-8 w-8"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value={activeCategory} className="mt-0">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {sortedDesigns.length} designs found
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-primary hover:text-primary/80 p-2 h-auto"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear filters
                    </Button>
                  )}
                </div>
                
                {activeCategory === 'trending' && (
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Hot right now</span>
                  </div>
                )}
              </div>

              {/* Design Grid */}
              {sortedDesigns.length > 0 ? (
                <div className={cn(
                  "grid gap-6 mb-12",
                  viewMode === 'grid' 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                    : "grid-cols-1"
                )}>
                  {sortedDesigns.map((design) => (
                    <Card 
                      key={design.id} 
                      className="group overflow-hidden rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                      onClick={() => handleQuickView(design)}
                    >
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                        <img
                          src={design.thumbSrc}
                          alt={design.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveDesign(design.id);
                                  }}
                                  className="rounded-full bg-white/90 hover:bg-white text-black backdrop-blur-sm"
                                >
                                  <Heart className={cn("h-4 w-4", isSaved(design.id) && "fill-red-500 text-red-500")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Save design</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInStudio(design);
                                  }}
                                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm"
                                >
                                  <Palette className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open in Studio</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {design.featured && (
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 rounded-full px-2 py-1">
                              <Crown className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {design.price > 25 && (
                            <Badge variant="secondary" className="bg-white/90 text-black border-0 rounded-full">
                              Premium
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                            <Eye className="h-3 w-3" />
                            {design.views}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                            {design.name}
                          </h3>
                          <div className="flex items-center gap-1 text-primary">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{design.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {design.creator.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{design.creator}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {design.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs rounded-full border-border/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">${design.price}</span>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Heart className="h-3 w-3" />
                              {design.likes}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isUnlocked(design.id)) {
                                handleOpenInStudio(design);
                              } else {
                                setPurchaseGateDesign(design);
                                setShowPurchaseGate(true);
                              }
                            }}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {isUnlocked(design.id) ? (
                              <>
                                <Palette className="h-3 w-3 mr-1" />
                                Edit
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                ${design.price}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                      <Search className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No designs found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <Button 
                      onClick={clearAllFilters}
                      variant="outline" 
                      className="rounded-xl"
                    >
                      Clear all filters
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Load More */}
              {sortedDesigns.length > 0 && (
                <div className="text-center py-8">
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-8 py-3 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    Load More Designs
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Filters Sheet */}
      <FiltersSheet
        isOpen={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClearAll={clearAllFilters}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        design={selectedDesign}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onOpenInStudio={handleOpenInStudio}
        onSave={(designId) => handleSaveDesign(designId)}
        isSaved={selectedDesign ? isSaved(selectedDesign.id) : false}
        isUnlocked={selectedDesign ? isUnlocked(selectedDesign.id) : false}
      />
      
      {/* Purchase Gate Modal */}
      <PurchaseGateModal
        design={purchaseGateDesign}
        open={showPurchaseGate}
        onOpenChange={setShowPurchaseGate}
      />
    </>
  );
};