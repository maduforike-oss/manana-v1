import { Search, Heart, Bookmark, Filter, TrendingUp, Star, Eye, Download, Grid3X3, LayoutGrid, List, Play, Palette, Ruler, Layers, Info, ShoppingBag, Truck, X, ChevronRight, Package, Sparkles, User, Award, Users, Crown, Lock, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [likedDesigns, setLikedDesigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<StudioGarmentData | null>(null);
  const [purchaseGateDesign, setPurchaseGateDesign] = useState<StudioGarmentData | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showPurchaseGate, setShowPurchaseGate] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Enhanced filters
  const [filters, setFilters] = useState({
    garmentTypes: [] as string[],
    baseColors: [] as string[],
    tags: [] as string[],
    priceRange: [0, 100] as [number, number],
    inStock: false,
    size: [] as string[]
  });
  const [activeFilterPreset, setActiveFilterPreset] = useState<string | null>(null);
  
  // Generate studio market data
  const studioDesigns = useMemo(() => generateStudioMarketData(), []);

  const handleOpenInStudio = (design: StudioGarmentData) => {
    if (isUnlocked(design.id)) {
      // Design is unlocked, proceed to studio
      const params = new URLSearchParams({
        garment: design.garmentId,
        orientation: design.orientation,
        mmToPx: String(design.mmToPx),
        safeWmm: String(design.safeArea.w),
        safeHmm: String(design.safeArea.h),
        view: design.orientation,
        size: 'M',
        design: design.id
      }).toString();
      
      window.location.href = `/studio/editor?${params}`;
      
      toast({ 
        title: "Opening Studio", 
        description: `Loading ${design.name} in the design editor...`
      });
    } else {
      // Design is locked, show purchase gate
      setPurchaseGateDesign(design);
      setShowPurchaseGate(true);
    }
  };

  const handleDesignClick = (design: StudioGarmentData) => {
    navigate(`/item/${design.id}`);
  };

  const handleLikeDesign = (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedDesigns(prev => 
      prev.includes(designId) 
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
    toast({ 
      title: likedDesigns.includes(designId) ? "Unliked" : "Liked", 
      description: `Design ${likedDesigns.includes(designId) ? 'removed from' : 'added to'} your likes` 
    });
  };

  const handleSaveDesign = (designId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleSave(designId);
    toast({ 
      title: savedIds.includes(designId) ? "Saved" : "Unsaved", 
      description: `Design ${savedIds.includes(designId) ? 'added to' : 'removed from'} your collection` 
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addSearch(query);
    }
    setShowSearchSuggestions(false);
  };

  const handleViewDesign = (design: StudioGarmentData) => {
    setSelectedDesign(design);
    setShowQuickView(true);
  };

  const applyFilterPreset = (presetName: string) => {
    const preset = FILTER_PRESETS[presetName as keyof typeof FILTER_PRESETS];
    const newFilters = {
      garmentTypes: preset.garmentTypes ? [...preset.garmentTypes] : [],
      baseColors: preset.baseColors ? [...preset.baseColors] : [],
      tags: preset.tags ? [...preset.tags] : [],
      priceRange: [0, 100] as [number, number],
      inStock: false,
      size: []
    };
    setFilters(newFilters);
    setActiveFilterPreset(presetName);
    toast({ title: "Filter Applied", description: `Applied ${presetName} filter preset` });
  };

  const clearAllFilters = () => {
    setFilters({
      garmentTypes: [],
      baseColors: [],
      tags: [],
      priceRange: [0, 100],
      inStock: false,
      size: []
    });
    setSearchQuery('');
    setActiveFilterPreset(null);
    toast({ title: "Filters Cleared", description: "All filters have been reset" });
  };

  const filteredDesigns = studioDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGarmentType = filters.garmentTypes.length === 0 || 
                              filters.garmentTypes.includes(design.garmentId);
    
    const matchesBaseColor = filters.baseColors.length === 0 || 
                            filters.baseColors.includes(design.baseColor);
    
    const matchesTags = filters.tags.length === 0 || 
                       filters.tags.some(tag => design.tags.includes(tag));
    
    const matchesPrice = design.price >= filters.priceRange[0] && design.price <= filters.priceRange[1];
    
    // For "Saved" tab, only show saved designs
    if (activeTab === 'saved') {
      return isSaved(design.id) && matchesSearch && matchesGarmentType && 
             matchesBaseColor && matchesTags && matchesPrice;
    }
    
    return matchesSearch && matchesGarmentType && matchesBaseColor && 
           matchesTags && matchesPrice;
  });

  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.likes + b.views / 10) - (a.likes + a.views / 10);
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'popular':
        return b.likes - a.likes;
      case 'canvas-size':
        return (b.printArea.width * b.printArea.height) - (a.printArea.width * a.printArea.height);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const featuredDesigns = studioDesigns.filter(design => design.featured);
  const mockGarments = sortedDesigns.map((design, index) => ({
    ...design,
    studioReady: design.studioReady || ['High DPI', 'Large Print Area', 'Dark Base'],
    dpi: 300,
    shippingEstimate: design.shippingDays || '3-5 days'
  }));

  const uniqueGarmentTypes = [...new Set(mockGarments.map(g => g.garmentId))];
  const uniqueTags = [...new Set(mockGarments.flatMap(g => g.tags))];

  const handleProfileClick = () => {
    setAppActiveTab('profile');
  };

  // Active filters count
  const activeFiltersCount = filters.garmentTypes.length + filters.baseColors.length + 
                           filters.tags.length + filters.size.length +
                           (filters.inStock ? 1 : 0) +
                           (filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? 1 : 0);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // URL sync for sort
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (sortBy !== 'trending') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [sortBy]);

  // Mock trending designers data
  const trendingDesigners = [
    { id: '1', name: 'Elena Martinez', avatar: '', followers: '12.4K', badge: 'Top Creator', specialty: 'Minimalist' },
    { id: '2', name: 'Alex Chen', avatar: '', followers: '8.9K', badge: 'Rising Star', specialty: 'Street Art' },
    { id: '3', name: 'Maya Patel', avatar: '', followers: '15.2K', badge: 'Fashion Pro', specialty: 'Typography' },
    { id: '4', name: 'Jordan Kim', avatar: '', followers: '6.7K', badge: 'New Talent', specialty: 'Abstract' }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Fashion-forward Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40">
          <div className="container mx-auto px-6 py-4">
            {/* Top bar with refined spacing */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Marketplace
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Discover unique fashion designs</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/cart')}
                  className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-300 relative"
                >
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  {cart.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cart.itemCount}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/add-listing')}
                  className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-300"
                >
                  <Plus className="h-5 w-5 text-primary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleProfileClick}
                  className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-300"
                >
                  <User className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>

            {/* Enhanced Search Bar with Suggestions */}
            <div className="relative mb-6" ref={searchInputRef}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search designs, creators, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                className="pl-12 pr-16 h-12 text-base rounded-2xl bg-manana-cream/30 border-border/30 focus:border-primary/50 transition-all duration-300 focus:bg-background/80 focus:shadow-fashion"
              />
              <Button 
                size="sm" 
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl h-8 px-4 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm"
              >
                Search
              </Button>
              
              {/* Search Suggestions */}
              <SearchSuggestions
                isOpen={showSearchSuggestions}
                onClose={() => setShowSearchSuggestions(false)}
                onSelectSuggestion={handleSearch}
                searchQuery={searchQuery}
              />
            </div>

            {/* Elegant Tab Navigation */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-2xl p-1 w-fit">
              {[
                { key: 'for-you', label: 'For You', icon: Sparkles },
                { key: 'deals', label: 'Deals', icon: Star },
                { key: 'selling', label: 'Trending', icon: TrendingUp },
                { key: 'saved', label: 'Saved', icon: Bookmark }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-xl h-9 px-4 text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    activeTab === key 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                  onClick={() => setActiveTab(key)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6 max-h-[calc(100vh-14rem)] overflow-y-auto scrollbar-hide">
          {/* Refined Category Pills */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant={activeFilterPreset === null ? "default" : "outline"}
              size="sm"
              onClick={() => clearAllFilters()}
              className="h-9 px-4 text-sm rounded-full whitespace-nowrap bg-primary hover:bg-primary/90"
            >
              All Categories
            </Button>
            {Object.keys(FILTER_PRESETS).map((presetName) => (
              <Button
                key={presetName}
                variant={activeFilterPreset === presetName ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilterPreset(presetName)}
                className={cn(
                  "h-9 px-4 text-sm rounded-full whitespace-nowrap transition-all duration-300",
                  activeFilterPreset === presetName
                    ? "bg-primary hover:bg-primary/90"
                    : "border-border/40 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                {presetName}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className={cn(
                "h-9 px-4 text-sm rounded-full whitespace-nowrap border-border/40 hover:border-primary/30 hover:bg-primary/5 relative",
                activeFiltersCount > 0 && "border-primary bg-primary/10 text-primary"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground text-xs h-5 px-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Featured Designs Section */}
          {activeTab === 'for-you' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Featured This Week</h2>
                  <p className="text-sm text-muted-foreground mt-1">Handpicked by our design team</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                  View Collection
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sortedDesigns.slice(0, 3).map((design) => (
                  <Card 
                    key={design.id} 
                    className="overflow-hidden border-0 hover:shadow-editorial transition-all duration-500 cursor-pointer group bg-gradient-to-br from-background to-manana-cream/20"
                    onClick={() => handleDesignClick(design)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl">
                      <img 
                        src={design.thumbSrc} 
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-medium shadow-lg border-0 rounded-full px-3 py-1">
                        Featured
                      </Badge>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300"
                          onClick={(e) => handleLikeDesign(design.id, e)}
                        >
                          <Heart className={cn("h-4 w-4 transition-all duration-300", likedDesigns.includes(design.id) ? "fill-primary text-primary scale-110" : "text-white")} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300"
                          onClick={(e) => handleSaveDesign(design.id, e)}
                        >
                          <Bookmark className={cn("h-4 w-4 transition-all duration-300", savedIds.includes(design.id) ? "fill-manana-sage text-manana-sage scale-110" : "text-white")} />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInStudio(design);
                          }}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 font-medium transition-all duration-200"
                        >
                          Open in Studio
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{design.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">by {design.creator}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${design.price}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {design.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {design.likes.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Trending Designers Section */}
          {activeTab === 'for-you' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Trending Designers</h2>
                  <p className="text-sm text-muted-foreground mt-1">Follow the creators making waves</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                  See All Creators
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingDesigners.map((designer) => (
                  <Card 
                    key={designer.id}
                    className="p-6 text-center hover:shadow-fashion transition-all duration-300 cursor-pointer group border-border/30 hover:border-primary/30 bg-gradient-to-b from-background to-manana-cream/10"
                  >
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <AvatarImage src={designer.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                          {designer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {designer.badge === 'Top Creator' && (
                        <Crown className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
                      )}
                      {designer.badge === 'Rising Star' && (
                        <Star className="absolute -top-1 -right-1 h-5 w-5 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{designer.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{designer.specialty}</p>
                    <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-primary">
                      {designer.badge}
                    </Badge>
                    <p className="text-sm font-medium text-foreground">{designer.followers} followers</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      Follow
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed - Refined */}
          {activeTab === 'for-you' && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6">Recently Viewed</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sortedDesigns.slice(3, 9).map((design) => (
                  <Card 
                    key={design.id} 
                    className="overflow-hidden border-border/30 hover:shadow-fashion hover:border-primary/30 transition-all duration-300 cursor-pointer group bg-gradient-to-b from-background to-manana-cream/10"
                    onClick={() => handleDesignClick(design)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={design.thumbSrc} 
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => handleLikeDesign(design.id, e)}
                      >
                        <Heart className={cn("h-3 w-3", likedDesigns.includes(design.id) ? "fill-primary text-primary" : "text-white")} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-foreground truncate font-medium mb-1">{design.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">by {design.creator}</p>
                      <span className="text-sm font-bold text-primary">${design.price}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Main Product Grid - Editorial Style */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {activeTab === 'saved' ? 'Your Saved Designs' : 'Explore Designs'}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {sortedDesigns.length} {activeTab === 'saved' ? 'saved' : 'unique'} pieces available
                  </p>
                  {sortBy !== 'trending' && (
                    <Badge variant="outline" className="text-xs">
                      Sorted by: {sortBy === 'newest' ? 'Newest' : 
                                sortBy === 'popular' ? 'Most Liked' :
                                sortBy === 'price-low' ? 'Price: Low to High' :
                                sortBy === 'price-high' ? 'Price: High to Low' : 'Trending'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-border/40 rounded-xl bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border/50">
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Liked</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sortedDesigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No designs found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'saved' 
                    ? "You haven't saved any designs yet. Start exploring and save your favorites!"
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedDesigns.map((design) => (
                <Card 
                  key={design.id} 
                  className="overflow-hidden border-0 hover:shadow-editorial transition-all duration-500 cursor-pointer group bg-gradient-to-br from-background to-manana-cream/10"
                  onClick={() => handleViewDesign(design)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={design.thumbSrc} 
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Favorite Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300"
                      onClick={(e) => handleLikeDesign(design.id, e)}
                    >
                      <Heart className={cn("h-4 w-4 transition-all duration-300", likedDesigns.includes(design.id) ? "fill-primary text-primary scale-110" : "text-white")} />
                    </Button>

                    {/* Quick Actions on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 space-y-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInStudio(design);
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 font-medium transition-all duration-200"
                      >
                        {isUnlocked(design.id) ? (
                          <>Customize in Studio</>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Purchase to Customize
                          </>
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleSaveDesign(design.id, e)}
                          className={cn(
                            "flex-1 rounded-lg h-8 text-xs transition-all duration-200",
                            savedIds.includes(design.id) 
                              ? "bg-primary/90 hover:bg-primary border-primary text-primary-foreground" 
                              : "bg-white/90 hover:bg-white border-white/50 text-manana-charcoal"
                          )}
                        >
                          {savedIds.includes(design.id) ? 'Saved' : 'Save'}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDesign(design);
                          }}
                          className="flex-1 bg-white/90 hover:bg-white border-white/50 text-manana-charcoal rounded-lg h-8 text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Design Tags */}
                    {design.featured && (
                      <Badge className="absolute top-3 left-3 bg-manana-sage text-white text-xs font-medium shadow-sm border-0 rounded-full px-2 py-1">
                        Editor's Choice
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">{design.name}</h3>
                        <p className="text-sm text-muted-foreground">by {design.creator}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">${design.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {design.views > 1000 ? `${(design.views / 1000).toFixed(1)}k` : design.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {design.likes > 1000 ? `${(design.likes / 1000).toFixed(1)}k` : design.likes}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs border-border/40 text-muted-foreground">
                        {design.fabric}
                      </Badge>
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </div>

          {/* Load More - only show if we have results */}
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
      </div>
    </TooltipProvider>
  );
};