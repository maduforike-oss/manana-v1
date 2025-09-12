import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Grid, List, Filter, TrendingUp, Package, Heart, Sparkles, ShoppingCart } from 'lucide-react';

// Simple badge component since we're keeping this minimal
function Badge({ children, className = '', variant = 'default' }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'default' | 'secondary' 
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses = variant === 'secondary' 
    ? "bg-muted text-muted-foreground" 
    : "bg-primary text-primary-foreground";
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}

function Palette({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5zM21 15a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2z" />
    </svg>
  );
}

// Mock data for demonstration
const mockDesigns = [
  {
    id: '1',
    name: 'Minimal Geometric Pattern',
    creator: 'designpro',
    price: 12.99,
    image: '/api/placeholder/300/300',
    likes: 234,
    tags: ['minimal', 'geometric'],
    featured: true
  },
  {
    id: '2', 
    name: 'Vintage Rose Collection',
    creator: 'floralist',
    price: 15.99,
    image: '/api/placeholder/300/300',
    likes: 189,
    tags: ['vintage', 'floral'],
    featured: false
  },
  {
    id: '3',
    name: 'Abstract Waves',
    creator: 'artwave',
    price: 9.99,
    image: '/api/placeholder/300/300',
    likes: 156,
    tags: ['abstract', 'waves'],
    featured: true
  },
  {
    id: '4',
    name: 'Typography Bold',
    creator: 'typefan',
    price: 8.99,
    image: '/api/placeholder/300/300',
    likes: 92,
    tags: ['typography', 'bold'],
    featured: false
  }
];

export default function MarketPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDesigns = mockDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'featured') return matchesSearch && design.featured;
    if (activeTab === 'trending') return matchesSearch && design.likes > 150;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Design Marketplace
            </h1>
            <p className="text-muted-foreground">Discover amazing designs from talented creators</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            ← Back
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for designs, creators, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              size="sm"
            >
              All Designs
            </Button>
            <Button
              variant={activeTab === 'featured' ? 'default' : 'outline'}
              onClick={() => setActiveTab('featured')}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Featured
            </Button>
            <Button
              variant={activeTab === 'trending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('trending')}
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDesigns.length} of {mockDesigns.length} designs
          </p>
        </div>

        {/* Design Grid */}
        {filteredDesigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No designs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse different categories
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative">
                  {/* Placeholder for design image */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Palette className="w-12 h-12 text-muted-foreground" />
                  </div>
                  {design.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 space-y-1">
                    <Button size="icon" variant="secondary" className="w-8 h-8">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-1">{design.name}</h3>
                    <p className="text-sm text-muted-foreground">by @{design.creator}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {design.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{design.likes}</span>
                      </div>
                      <p className="font-bold text-lg">${design.price}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button size="sm" variant="outline">
                        Quick View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredDesigns.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Designs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
