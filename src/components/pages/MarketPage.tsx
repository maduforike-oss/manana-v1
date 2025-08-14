import { Search, Heart, Bookmark, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

export const MarketPage = () => {
  const { toast } = useToast();
  const [likedDesigns, setLikedDesigns] = useState<number[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockDesigns = [
    { id: 1, name: 'Sunset Vibes', creator: 'DesignPro', garment: 'T-Shirt', likes: 234, price: 15.99 },
    { id: 2, name: 'Urban Street', creator: 'CityArt', garment: 'Hoodie', likes: 189, price: 29.99 },
    { id: 3, name: 'Minimal Logo', creator: 'CleanDesign', garment: 'Cap', likes: 156, price: 18.99 },
    { id: 4, name: 'Retro Wave', creator: 'VintageVibes', garment: 'Long Sleeve', likes: 298, price: 22.99 },
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

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Design Market</h1>
          <p className="text-muted-foreground">Discover amazing designs from the community</p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search designs..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleFilter} className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Design Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDesigns.map((design) => (
            <Card key={design.id} onClick={() => handleDesignClick(design.id)} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-50" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => handleLikeDesign(design.id, e)}
                    className={`w-8 h-8 p-0 bg-white/80 hover:bg-white ${
                      likedDesigns.includes(design.id) ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedDesigns.includes(design.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => handleSaveDesign(design.id, e)}
                    className={`w-8 h-8 p-0 bg-white/80 hover:bg-white ${
                      savedDesigns.includes(design.id) ? 'text-blue-500' : ''
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${savedDesigns.includes(design.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {design.name}
                  </h3>
                  <span className="font-bold text-primary">£{design.price}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">by {design.creator}</p>
                
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{design.garment}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    {design.likes}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={handleLoadMore}>
            Load More Designs
          </Button>
        </div>
      </div>
    </div>
  );
};