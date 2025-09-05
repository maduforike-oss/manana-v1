import { Search, Heart, Bookmark, Filter, TrendingUp, Star, Eye, Download, Grid3X3, LayoutGrid, List, Play, Palette, Ruler, Layers, Info, ShoppingBag, Truck, X } from 'lucide-react';
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
import { generateStudioMarketData, StudioGarmentData, FILTER_PRESETS } from '@/lib/studio/marketData';

export const MarketPage = () => {
  const { toast } = useToast();
  const [likedDesigns, setLikedDesigns] = useState<string[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  
  // Enhanced filters
  const [selectedGarmentTypes, setSelectedGarmentTypes] = useState<string[]>([]);
  const [selectedBaseColors, setSelectedBaseColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrintAreaSize, setSelectedPrintAreaSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Generate studio market data
  const studioDesigns = useMemo(() => generateStudioMarketData(), []);

  const handleOpenInStudio = (design: StudioGarmentData, e: React.MouseEvent) => {
    e.stopPropagation();
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
    
    toast({ title: "Filter Applied", description: `Applied ${presetName} filter preset` });
  };

  const clearAllFilters = () => {
    setSelectedGarmentTypes([]);
    setSelectedBaseColors([]);
    setSelectedTags([]);
    setSelectedPrintAreaSize('all');
    setPriceRange([0, 100]);
    setSearchQuery('');
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
    const matchesPrintArea = selectedPrintAreaSize === 'all' || 
      (selectedPrintAreaSize === 'large' && design.printArea.width >= 280 && design.printArea.height >= 380) ||
      (selectedPrintAreaSize === 'medium' && design.printArea.width >= 200 && design.printArea.width < 280) ||
      (selectedPrintAreaSize === 'small' && design.printArea.width < 200);
    
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
                Studio Market
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Studio-ready garments with detailed specifications for professional design work
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span>Print-Ready Canvases</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-secondary" />
                <span>Precise Specifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>300 DPI Quality</span>
              </div>
            </div>
          </div>

          {/* Featured Studio-Ready Garments */}
          {featuredDesigns.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Featured Studio-Ready Garments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDesigns.slice(0, 3).map((design) => (
                  <Card 
                    key={`featured-${design.id}`}
                    onClick={() => handleDesignClick(design)}
                    className="group cursor-pointer overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                  >
                    <div className="relative">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                        <img 
                          src={design.thumbSrc} 
                          alt={design.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                        
                        {/* Studio-Ready Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <Badge className="bg-primary text-primary-foreground border-0">
                            Featured
                          </Badge>
                          {design.studioReady.slice(0, 2).map(badge => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleOpenInStudio(design, e)}
                                className="w-9 h-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-sm transition-all"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open in Studio</TooltipContent>
                          </Tooltip>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={(e) => handleLikeDesign(design.id, e)}
                            className={cn(
                              "w-9 h-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm transition-all",
                              likedDesigns.includes(design.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                            )}
                          >
                            <Heart className={cn("w-4 h-4", likedDesigns.includes(design.id) && 'fill-current')} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">
                            {design.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{design.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">by {design.creator}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-primary">£{design.price}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {design.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Studio Specs */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ruler className="w-4 h-4" />
                          <span>Print: {Math.round(design.printArea.width/25.4)}×{Math.round(design.printArea.height/25.4)}" | 300 DPI</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Palette className="w-4 h-4" />
                          <span>{design.fabric} | {design.baseColor} base</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="w-4 h-4" />
                          <span>Ships in {design.shippingDays}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {design.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {design.likes.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {design.views.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Filter Presets */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {Object.keys(FILTER_PRESETS).map(presetName => (
                <Button
                  key={presetName}
                  variant="outline"
                  size="sm"
                  onClick={() => applyFilterPreset(presetName)}
                  className="text-sm"
                >
                  {presetName}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search garments, fabrics, or specifications..." 
                  className="pl-12 h-12 text-base bg-background/50 border-border/50 focus:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-12 bg-background/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="canvas-size">Canvas Size</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(selectedGarmentTypes.length + selectedBaseColors.length + selectedTags.length) > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedGarmentTypes.length + selectedBaseColors.length + selectedTags.length}
                    </Badge>
                  )}
                </Button>

                <div className="flex bg-background/50 rounded-lg border border-border/50">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-12 px-4"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-12 px-4"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Garment Types */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Garment Type</label>
                    <div className="space-y-2">
                      {['t-shirt', 'hoodie', 'crewneck', 'polo', 'cap', 'tote'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedGarmentTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGarmentTypes([...selectedGarmentTypes, type]);
                              } else {
                                setSelectedGarmentTypes(selectedGarmentTypes.filter(t => t !== type));
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Base Colors */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Base Color</label>
                    <div className="space-y-2">
                      {['light', 'dark', 'colored'].map(color => (
                        <label key={color} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBaseColors.includes(color)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBaseColors([...selectedBaseColors, color]);
                              } else {
                                setSelectedBaseColors(selectedBaseColors.filter(c => c !== color));
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm capitalize">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Print Area Size */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Print Area</label>
                    <Select value={selectedPrintAreaSize} onValueChange={setSelectedPrintAreaSize}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="large">Large (10"+ wide)</SelectItem>
                        <SelectItem value="medium">Medium (8-10")</SelectItem>
                        <SelectItem value="small">Small (under 8")</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Style Tags</label>
                    <div className="space-y-2">
                      {['minimalist', 'streetwear', 'premium', 'cotton', 'versatile'].map(tag => (
                        <label key={tag} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag]);
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm capitalize">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Studio-Ready Garments</h2>
              <p className="text-muted-foreground">
                {sortedDesigns.length} garments found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  Quality Guide
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-medium">Studio-Ready Quality</p>
                  <p className="text-sm">• 300 DPI print resolution</p>
                  <p className="text-sm">• Precise safe area mapping</p>
                  <p className="text-sm">• Professional mockup quality</p>
                  <p className="text-sm">• Multiple print methods supported</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Garment Grid/List */}
          <div className={cn(
            "gap-6 mb-12",
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "flex flex-col"
          )}>
            {sortedDesigns.map((design) => (
              <Card 
                key={design.id}
                onClick={() => handleDesignClick(design)}
                className={cn(
                  "group cursor-pointer overflow-hidden border hover:shadow-lg transition-all duration-300 hover:border-primary/30",
                  viewMode === 'list' && "flex flex-row"
                )}
              >
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === 'grid' ? "aspect-[4/3]" : "w-48 h-32 flex-shrink-0"
                )}>
                  <img 
                    src={design.thumbSrc} 
                    alt={design.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  
                  {/* Studio Ready Badges */}
                  <div className="absolute top-2 left-2">
                    {design.studioReady.slice(0, 1).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs mb-1">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => handleOpenInStudio(design, e)}
                          className="w-8 h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-sm"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open in Studio</TooltipContent>
                    </Tooltip>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => handleLikeDesign(design.id, e)}
                      className={cn(
                        "w-8 h-8 p-0 bg-white/80 hover:bg-white backdrop-blur-sm transition-all",
                        likedDesigns.includes(design.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      )}
                    >
                      <Heart className={cn("w-4 h-4", likedDesigns.includes(design.id) && 'fill-current')} />
                    </Button>
                  </div>
                </div>
                
                <CardContent className={cn("p-4", viewMode === 'list' && "flex-1")}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold group-hover:text-primary transition-colors line-clamp-1",
                        viewMode === 'grid' ? "text-lg" : "text-xl"
                      )}>
                        {design.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">{design.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">by {design.creator}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">£{design.price}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {design.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Studio Specifications */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Ruler className="w-3 h-3" />
                      <span>Print: {Math.round(design.printArea.width/25.4)}×{Math.round(design.printArea.height/25.4)}" at 300 DPI</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Palette className="w-3 h-3" />
                      <span>{design.baseColor} base | {design.availableOrientations.length} views</span>
                    </div>
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="w-3 h-3" />
                        <span>Ships in {design.shippingDays}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {design.tags.slice(0, viewMode === 'grid' ? 2 : 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs">{design.likes > 999 ? `${(design.likes/1000).toFixed(1)}k` : design.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span className="text-xs">{design.downloads}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              size="lg"
              className="min-w-32"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Load More Garments
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {sortedDesigns.length} of {studioDesigns.length} studio-ready garments
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};