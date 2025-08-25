import { Search, Heart, Bookmark, Filter, TrendingUp, Star, Eye, Download, Grid3X3, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const MarketPage = () => {
  const { toast } = useToast();
  const [likedDesigns, setLikedDesigns] = useState<number[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const mockDesigns = [
    { 
      id: 1, 
      name: 'Sunset Vibes Collection', 
      creator: 'DesignPro', 
      avatar: 'DP',
      garment: 'T-Shirt', 
      likes: 1234, 
      views: 8920,
      downloads: 456,
      price: 15.99,
      rating: 4.8,
      tags: ['trendy', 'sunset', 'minimal'],
      featured: true,
      thumbnail: 'bg-gradient-to-br from-orange-400 to-pink-500'
    },
    { 
      id: 2, 
      name: 'Urban Street Art', 
      creator: 'CityArt', 
      avatar: 'CA',
      garment: 'Hoodie', 
      likes: 956, 
      views: 5432,
      downloads: 234,
      price: 29.99,
      rating: 4.9,
      tags: ['urban', 'street', 'graffiti'],
      featured: false,
      thumbnail: 'bg-gradient-to-br from-gray-800 to-blue-600'
    },
    { 
      id: 3, 
      name: 'Minimal Geometric Logo', 
      creator: 'CleanDesign', 
      avatar: 'CD',
      garment: 'Cap', 
      likes: 567, 
      views: 3210,
      downloads: 123,
      price: 18.99,
      rating: 4.7,
      tags: ['minimal', 'geometric', 'clean'],
      featured: false,
      thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    },
    { 
      id: 4, 
      name: 'Retro Wave Synthwave', 
      creator: 'VintageVibes', 
      avatar: 'VV',
      garment: 'Long Sleeve', 
      likes: 1890, 
      views: 12340,
      downloads: 789,
      price: 22.99,
      rating: 4.9,
      tags: ['retro', 'synthwave', 'neon'],
      featured: true,
      thumbnail: 'bg-gradient-to-br from-purple-600 to-pink-600'
    },
    { 
      id: 5, 
      name: 'Nature\'s Harmony', 
      creator: 'EcoDesign', 
      avatar: 'ED',
      garment: 'Tote Bag', 
      likes: 743, 
      views: 4567,
      downloads: 298,
      price: 12.99,
      rating: 4.6,
      tags: ['nature', 'eco', 'organic'],
      featured: false,
      thumbnail: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    { 
      id: 6, 
      name: 'Cosmic Journey', 
      creator: 'SpaceArt', 
      avatar: 'SA',
      garment: 'T-Shirt', 
      likes: 2103, 
      views: 15670,
      downloads: 892,
      price: 17.99,
      rating: 4.8,
      tags: ['cosmic', 'space', 'galaxy'],
      featured: true,
      thumbnail: 'bg-gradient-to-br from-blue-900 to-purple-900'
    }
  ];

  const handleDesignClick = (designId: number) => {
    console.log(`Opening design detail for ID: ${designId}`);
    toast({ title: "Design Details", description: "Design detail page will open here" });
  };

  const handleLikeDesign = (designId: number, e: React.MouseEvent) => {
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

  const handleSaveDesign = (designId: number, e: React.MouseEvent) => {
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

  const handleFilter = () => {
    toast({ title: "Filter", description: "Filter options will open here" });
  };

  const handleLoadMore = () => {
    toast({ title: "Loading", description: "Loading more designs..." });
  };

  const filteredDesigns = mockDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || design.garment.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.likes + b.views / 10) - (a.likes + a.views / 10);
      case 'newest':
        return b.id - a.id;
      case 'popular':
        return b.likes - a.likes;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const featuredDesigns = mockDesigns.filter(design => design.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
              Design Market
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover stunning designs from our global community of creators
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>50K+ Designs</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-secondary" />
              <span>Top Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-accent" />
              <span>Instant Download</span>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {featuredDesigns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Featured Designs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDesigns.slice(0, 3).map((design) => (
                <Card 
                  key={`featured-${design.id}`}
                  onClick={() => handleDesignClick(design.id)}
                  className="group cursor-pointer overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                >
                  <div className="relative">
                    <div className={cn("aspect-[4/3] relative overflow-hidden", design.thumbnail)}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground border-0">
                          Featured
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => handleSaveDesign(design.id, e)}
                          className={cn(
                            "w-9 h-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm transition-all",
                            savedDesigns.includes(design.id) ? 'text-primary' : 'text-gray-600 hover:text-primary'
                          )}
                        >
                          <Bookmark className={cn("w-4 h-4", savedDesigns.includes(design.id) && 'fill-current')} />
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
                          {design.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {design.garment}
                      </Badge>
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

        {/* Search & Filters */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search designs, creators, or tags..." 
                className="pl-12 h-12 text-base bg-background/50 border-border/50 focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 h-12 bg-background/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="t-shirt">T-Shirts</SelectItem>
                  <SelectItem value="hoodie">Hoodies</SelectItem>
                  <SelectItem value="cap">Caps</SelectItem>
                  <SelectItem value="tote">Tote Bags</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

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
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">All Designs</h2>
            <p className="text-muted-foreground">
              {sortedDesigns.length} designs found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </div>

        {/* Design Grid/List */}
        <div className={cn(
          "gap-6 mb-12",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "flex flex-col"
        )}>
          {sortedDesigns.map((design) => (
            <Card 
              key={design.id}
              onClick={() => handleDesignClick(design.id)}
              className={cn(
                "group cursor-pointer overflow-hidden border hover:shadow-lg transition-all duration-300 hover:border-primary/30",
                viewMode === 'list' && "flex flex-row"
              )}
            >
              <div className={cn(
                "relative overflow-hidden",
                viewMode === 'grid' ? "aspect-[4/3]" : "w-48 h-32 flex-shrink-0",
                design.thumbnail
              )}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => handleLikeDesign(design.id, e)}
                    className={cn(
                      "w-8 h-8 p-0 bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100",
                      likedDesigns.includes(design.id) ? 'text-red-500 opacity-100' : 'text-gray-600'
                    )}
                  >
                    <Heart className={cn("w-4 h-4", likedDesigns.includes(design.id) && 'fill-current')} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => handleSaveDesign(design.id, e)}
                    className={cn(
                      "w-8 h-8 p-0 bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100",
                      savedDesigns.includes(design.id) ? 'text-primary opacity-100' : 'text-gray-600'
                    )}
                  >
                    <Bookmark className={cn("w-4 h-4", savedDesigns.includes(design.id) && 'fill-current')} />
                  </Button>
                </div>
              </div>
              
              <CardContent className={cn("p-4", viewMode === 'list' && "flex-1")}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
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
                    <div className="font-bold text-primary">£{design.price}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {design.rating}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {design.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-muted">
                    {design.garment}
                  </Badge>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {design.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {design.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {design.downloads}
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
            variant="outline" 
            size="lg" 
            onClick={handleLoadMore}
            className="px-8 py-6 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Load More Designs
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};