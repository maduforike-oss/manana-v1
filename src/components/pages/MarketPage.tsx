import { Search, Heart, Bookmark, Filter, TrendingUp, Star, Eye, Download, Grid3X3, LayoutGrid, List, Play, Palette, Ruler, Layers, Info, ShoppingBag, Truck, X, ChevronRight, Package, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { generateStudioMarketData, StudioGarmentData, FILTER_PRESETS, PrintAreaSize } from '@/lib/studio/marketData';
import { useAppStore } from '@/store/useAppStore';

export const MarketPage = () => {
  const { toast } = useToast();
  const { setActiveTab: setAppActiveTab } = useAppStore();
  const [likedDesigns, setLikedDesigns] = useState<string[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  
  // Enhanced filters
  const [selectedGarmentTypes, setSelectedGarmentTypes] = useState<string[]>([]);
  const [selectedBaseColors, setSelectedBaseColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrintAreaSize, setSelectedPrintAreaSize] = useState<PrintAreaSize | null>(null);
  const [activeFilterPreset, setActiveFilterPreset] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Generate studio market data
  const studioDesigns = useMemo(() => generateStudioMarketData(), []);

  const handleOpenInStudio = (design: StudioGarmentData, orientation: string = 'front') => {
    const params = new URLSearchParams({
      garment: design.garmentId,
      orientation: design.orientation,
      mmToPx: String(design.mmToPx),
      safeWmm: String(design.safeArea.w),
      safeHmm: String(design.safeArea.h),
      view: design.orientation,
      size: 'M'
    }).toString();
    
    // Navigate to studio with garment preloaded
    window.location.href = `/studio/editor?${params}`;
    
    toast({ 
      title: "Opening Studio", 
      description: `Loading ${design.name} in the design editor...`
    });
  };

  const handleDesignClick = (design: StudioGarmentData) => {
    toast({ 
      title: "Design Details", 
      description: `Viewing details for ${design.name}. Click "Open in Studio" to start designing!`
    });
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

  const handleSaveDesign = (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedDesigns(prev => 
      prev.includes(designId) 
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
    toast({ 
      title: savedDesigns.includes(designId) ? "Unsaved" : "Saved", 
      description: `Design ${savedDesigns.includes(designId) ? 'removed from' : 'added to'} your collection` 
    });
  };

  const applyFilterPreset = (presetName: string) => {
    const preset = FILTER_PRESETS[presetName as keyof typeof FILTER_PRESETS];
    // Fix TS2345: spread readonly arrays to mutable state
    if (preset.garmentTypes) setSelectedGarmentTypes([...preset.garmentTypes]);
    if (preset.baseColors) setSelectedBaseColors([...preset.baseColors]);
    if (preset.tags) setSelectedTags([...preset.tags]);
    // Fix TS2339: guard optional property
    if (preset.printAreaSize) setSelectedPrintAreaSize(preset.printAreaSize);
    
    setActiveFilterPreset(presetName);
    toast({ title: "Filter Applied", description: `Applied ${presetName} filter preset` });
  };

  const clearAllFilters = () => {
    setSelectedGarmentTypes([]);
    setSelectedBaseColors([]);
    setSelectedTags([]);
    setSelectedPrintAreaSize(null);
    setPriceRange([0, 100]);
    setSearchQuery('');
    setActiveFilterPreset(null);
  };

  const handleLoadMore = () => {
    toast({ title: "Loading", description: "Loading more designs..." });
  };

  const filteredDesigns = studioDesigns.filter(design => {
    // Search filter
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Garment type filter
    const matchesGarmentType = selectedGarmentTypes.length === 0 || 
                              selectedGarmentTypes.includes(design.garmentId);
    
    // Base color filter
    const matchesBaseColor = selectedBaseColors.length === 0 || 
                            selectedBaseColors.includes(design.baseColor);
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => design.tags.includes(tag));
    
    // Print area size filter
    const matchesPrintArea = !selectedPrintAreaSize || 
      (selectedPrintAreaSize === 'L' && design.printArea.width >= 280 && design.printArea.height >= 380) ||
      (selectedPrintAreaSize === 'M' && design.printArea.width >= 200 && design.printArea.width < 280) ||
      (selectedPrintAreaSize === 'S' && design.printArea.width < 200);
    
    // Price filter
    const matchesPrice = design.price >= priceRange[0] && design.price <= priceRange[1];
    
    return matchesSearch && matchesGarmentType && matchesBaseColor && 
           matchesTags && matchesPrintArea && matchesPrice;
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

  // Create mock data for the new designs
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* eBay-style Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/60">
          <div className="container mx-auto px-4 py-3">
            {/* Top bar with profile link */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-foreground">Marketplace</h1>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleProfileClick}
                className="rounded-full h-9 w-9 p-0 hover:bg-muted/80"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 h-11 text-base rounded-full bg-muted/50 border-border/60 focus:border-primary/50 transition-all duration-200 focus:bg-background"
              />
              <Button size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-9 px-4 bg-primary hover:bg-primary/90 transition-all duration-200">
                Search
              </Button>
            </div>

            {/* eBay-style Tab Navigation */}
            <div className="flex items-center gap-0 border-b border-border/40 -mb-px">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border-b-2 border-transparent h-10 px-4 text-sm font-medium",
                  activeTab === 'for-you' 
                    ? "border-primary text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveTab('for-you')}
              >
                For you
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border-b-2 border-transparent h-10 px-4 text-sm font-medium",
                  activeTab === 'deals' 
                    ? "border-primary text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveTab('deals')}
              >
                Deals
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border-b-2 border-transparent h-10 px-4 text-sm font-medium",
                  activeTab === 'selling' 
                    ? "border-primary text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveTab('selling')}
              >
                Selling
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border-b-2 border-transparent h-10 px-4 text-sm font-medium",
                  activeTab === 'saved' 
                    ? "border-primary text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveTab('saved')}
              >
                Saved
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
          {/* eBay-style Category Pills */}
          <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant={activeFilterPreset === null ? "default" : "outline"}
              size="sm"
              onClick={() => clearAllFilters()}
              className="h-8 text-xs rounded-full whitespace-nowrap"
            >
              All
            </Button>
            {Object.keys(FILTER_PRESETS).map((presetName) => (
              <Button
                key={presetName}
                variant={activeFilterPreset === presetName ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilterPreset(presetName)}
                className="h-8 text-xs rounded-full whitespace-nowrap"
              >
                {presetName}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 text-xs rounded-full whitespace-nowrap"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
            </Button>
          </div>

          {/* Deals for You Section */}
          {activeTab === 'for-you' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Deals for you</h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  See all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {sortedDesigns.slice(0, 4).map((design) => (
                  <Card 
                    key={design.id} 
                    className="overflow-hidden border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleDesignClick(design)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={design.thumbSrc} 
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium shadow-lg">
                        Deal
                      </Badge>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full"
                          onClick={(e) => handleLikeDesign(design.id, e)}
                        >
                          <Heart className={cn("h-4 w-4", likedDesigns.includes(design.id) ? "fill-red-500 text-red-500" : "text-white")} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full"
                          onClick={(e) => handleSaveDesign(design.id, e)}
                        >
                          <Bookmark className={cn("h-4 w-4", savedDesigns.includes(design.id) ? "fill-blue-500 text-blue-500" : "text-white")} />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-b from-card to-card/80">
                      <p className="text-sm font-medium text-foreground truncate mb-1">{design.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-primary">${design.price}</span>
                        <span className="text-sm text-muted-foreground line-through">${(design.price * 1.3).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {design.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {design.likes}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed (eBay style) */}
          {activeTab === 'for-you' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recently viewed</h2>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {sortedDesigns.slice(4, 10).map((design) => (
                  <Card 
                    key={design.id} 
                    className="overflow-hidden border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleDesignClick(design)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={design.thumbSrc} 
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-2 bg-gradient-to-b from-card to-card/80">
                      <p className="text-xs text-foreground truncate font-medium">{design.name}</p>
                      <p className="text-sm font-bold text-primary">${design.price}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Categories */}
          {activeTab === 'for-you' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Popular categories</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {uniqueGarmentTypes.slice(0, 6).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-20 flex-col gap-2 text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                    onClick={() => setSelectedGarmentTypes([type])}
                  >
                    <Package className="h-6 w-6 text-primary" />
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Advanced Filters */}
          {showFilters && (
            <Card className="mb-6 border-border/60 bg-card/50">
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Garment Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
                  <Select value={selectedGarmentTypes[0] || ''} onValueChange={(value) => setSelectedGarmentTypes(value ? [value] : [])}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {uniqueGarmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Base Color */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base</label>
                  <Select value={selectedBaseColors[0] || ''} onValueChange={(value) => setSelectedBaseColors(value ? [value] : [])}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue placeholder="All colors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Colors</SelectItem>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-100 border"></div>
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="colored">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          Colored
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</label>
                  <Select value={selectedTags[0] || ''} onValueChange={(value) => setSelectedTags(value ? [value] : [])}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue placeholder="All styles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Styles</SelectItem>
                      {uniqueTags.map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Print Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Print Area</label>
                  <Select value={selectedPrintAreaSize || ''} onValueChange={(value) => setSelectedPrintAreaSize(value as PrintAreaSize || null)}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue placeholder="All sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sizes</SelectItem>
                      <SelectItem value="S">Small (8×10")</SelectItem>
                      <SelectItem value="M">Medium (10×12")</SelectItem>
                      <SelectItem value="L">Large (12×16")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</label>
                  <Select value={`${priceRange[0]}-${priceRange[1]}`} onValueChange={(value) => {
                    const [min, max] = value.split('-').map(Number);
                    setPriceRange([min, max]);
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue placeholder="All prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">All Prices</SelectItem>
                      <SelectItem value="0-15">Under $15</SelectItem>
                      <SelectItem value="15-25">$15 - $25</SelectItem>
                      <SelectItem value="25-35">$25 - $35</SelectItem>
                      <SelectItem value="35-100">$35+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 text-xs border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">🔥 Trending</SelectItem>
                      <SelectItem value="newest">🆕 Newest</SelectItem>
                      <SelectItem value="popular">⭐ Most Popular</SelectItem>
                      <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                      <SelectItem value="price-high">💎 Price: High to Low</SelectItem>
                      <SelectItem value="canvas-size">📐 Canvas Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
          )}

          {/* Results Bar */}
          <div className="flex items-center justify-between mb-6 py-3 px-4 bg-muted/30 rounded-lg border border-border/40">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">
                <span className="text-primary font-bold">{sortedDesigns.length}</span> 
                <span className="text-muted-foreground"> of {studioDesigns.length} products</span>
              </p>
              {(selectedGarmentTypes.length > 0 || selectedBaseColors.length > 0 || selectedTags.length > 0) && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Updated 2 hours ago</span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockGarments.map((garment) => (
              <Card 
                key={garment.id} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/60 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden"
              >
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
                  <img
                    src={garment.thumbSrc}
                    alt={garment.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay Labels */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {garment.featured && (
                      <Badge className="bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                        ⭐ Featured
                      </Badge>
                    )}
                    {garment.studioReady?.slice(0, 2).map((badge, index) => (
                      <Badge 
                        key={index}
                        variant="secondary" 
                        className="text-xs bg-background/90 backdrop-blur-sm border-border/60 shadow-sm"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-2 py-1 shadow-sm">
                      <span className="text-sm font-bold text-primary">${garment.price}</span>
                    </div>
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="flex-1 h-8 text-xs bg-background/90 hover:bg-background backdrop-blur-sm border-border/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDesignClick(garment);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 h-8 text-xs shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInStudio(garment, 'front');
                      }}
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Design
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {garment.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{garment.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {garment.garmentId.replace('-', ' ')} • {garment.fabric}
                    </p>
                  </div>

                  {/* Technical Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-t border-border/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        <span className="text-xs text-muted-foreground font-medium">Print Area</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground pl-3">
                        {Math.round(garment.printArea.width/25.4)}×{Math.round(garment.printArea.height/25.4)}" • {garment.dpi} DPI
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          garment.baseColor === 'light' ? 'bg-gray-200 border border-gray-300' :
                          garment.baseColor === 'dark' ? 'bg-gray-800' : 'bg-primary/60'
                        }`}></div>
                        <span className="text-xs text-muted-foreground font-medium">Base Color</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground capitalize pl-3">
                        {garment.baseColor} base
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {garment.tags && garment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {garment.tags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs px-2 py-0 h-5 border-border/60 text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {garment.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0 h-5 border-border/60 text-muted-foreground">
                          +{garment.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {mockGarments.length === 0 && (
            <Card className="p-12 text-center border-border/60 bg-card/50">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any garments matching your criteria. Try adjusting your filters or search terms.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                  <Button variant="secondary">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Browse Trending
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};