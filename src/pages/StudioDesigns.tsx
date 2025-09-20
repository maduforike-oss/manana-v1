import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BrandHeader } from '@/components/ui/brand-header';
import BackButton from '@/components/BackButton';
import { listDesigns, deleteDesign } from '@/lib/api/designs';
import type { DesignDocument } from '@/lib/api/designs';
import { 
  Search,
  Edit3,
  Trash2,
  MoreHorizontal,
  Calendar,
  Shirt,
  Filter,
  Grid3X3,
  List,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const StudioDesigns = () => {
  const [designs, setDesigns] = useState<DesignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const designsList = await listDesigns();
      setDesigns(designsList);
    } catch (error) {
      console.error('Failed to load designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    try {
      await deleteDesign(designId);
      setDesigns(prev => prev.filter(d => d.id !== designId));
      toast.success('Design deleted successfully');
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast.error('Failed to delete design');
    } finally {
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    }
  };

  const openDeleteDialog = (designId: string) => {
    setDesignToDelete(designId);
    setDeleteDialogOpen(true);
  };

  const handleEditDesign = (designId: string) => {
    window.location.href = `/studio?design=${designId}`;
  };

  const handleNewDesign = () => {
    window.location.href = '/studio';
  };

  // Filter and sort designs
  const filteredDesigns = designs
    .filter(design => {
      const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           design.garment_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(design.updated_at) > weekAgo;
      }
      if (filterBy === design.garment_type) return matchesSearch;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'updated_at') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const garmentTypes = [...new Set(designs.map(d => d.garment_type))];

  return (
    <div className="h-full bg-background overflow-auto">
      <BrandHeader 
        title="Design Library" 
        subtitle="Manage and organize all your creative projects"
      />
      
      <div className="container mx-auto py-8 px-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton />
          <Button onClick={handleNewDesign} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Design
          </Button>
        </div>

        {/* Filters and Controls */}
        <Card className="glass-effect border-border/20 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designs</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <DropdownMenuSeparator />
                    {garmentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="title">Name</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-xl border border-border overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredDesigns.length} of {designs.length} designs
          </p>
        </div>

        {/* Designs Grid/List */}
        {loading ? (
          <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Loading your designs...</p>
            </div>
          </Card>
        ) : filteredDesigns.length === 0 ? (
          <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl">
                <Shirt className="w-16 h-16 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">No designs found</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {searchQuery || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start creating your first design to see it here'
                  }
                </p>
                <Button 
                  onClick={handleNewDesign}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Design
                </Button>
              </div>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card 
                key={design.id} 
                className="glass-effect border-border/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 group"
              >
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-2xl m-4 flex items-center justify-center overflow-hidden">
                    <Shirt className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute top-6 right-6 rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    {design.garment_type.replace('-', ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-6 left-6 rounded-full bg-background/80 backdrop-blur-sm h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleEditDesign(design.id)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Design
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(design.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Design
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardContent className="p-6 pt-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {design.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(design.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => handleEditDesign(design.id)}
                      className="w-full rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
                      variant="outline"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Continue Editing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="glass-effect border-border/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center shrink-0">
                      <Shirt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate">{design.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{design.garment_type.replace('-', ' ')}</span>
                        <span>Updated {new Date(design.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleEditDesign(design.id)}
                        variant="outline" 
                        size="sm"
                        className="rounded-xl"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditDesign(design.id)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Design
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(design.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Design
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => designToDelete && handleDeleteDesign(designToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};