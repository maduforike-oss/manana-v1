import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Image, Loader2, Filter, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { fetchSupabaseTemplates, getAvailableGarmentTypes } from '@/lib/studio/supabaseTemplates';
import type { SupabaseTemplate } from '@/lib/studio/supabaseTemplates';

interface SelectedTemplate extends SupabaseTemplate {
  selected: boolean;
}

interface GarmentTemplateGalleryProps {
  selectedTemplates: SelectedTemplate[];
  onTemplateSelect: (template: SupabaseTemplate) => void;
  onTemplateDeselect: (template: SupabaseTemplate) => void;
  className?: string;
}

export function GarmentTemplateGallery({ 
  selectedTemplates, 
  onTemplateSelect, 
  onTemplateDeselect,
  className 
}: GarmentTemplateGalleryProps) {
  const [templates, setTemplates] = useState<SupabaseTemplate[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const [allTemplates, types] = await Promise.all([
          fetchSupabaseTemplates(),
          getAvailableGarmentTypes()
        ]);
        setTemplates(allTemplates);
        setGarmentTypes(types);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.garmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.garmentType === selectedCategory;
    const matchesFavorites = !showFavorites || template.color === 'white'; // Prioritize white versions
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Group templates by garment type
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.garmentType]) {
      acc[template.garmentType] = [];
    }
    acc[template.garmentType].push(template);
    return acc;
  }, {} as Record<string, SupabaseTemplate[]>);

  const isTemplateSelected = (template: SupabaseTemplate) => {
    return selectedTemplates.some(selected => 
      selected.name === template.name && selected.garmentType === template.garmentType
    );
  };

  const handleTemplateClick = (template: SupabaseTemplate) => {
    if (isTemplateSelected(template)) {
      onTemplateDeselect(template);
    } else {
      onTemplateSelect(template);
    }
  };

  const selectAllWhite = () => {
    const whiteTemplates = templates.filter(t => t.color === 'white' && !isTemplateSelected(t));
    whiteTemplates.forEach(template => onTemplateSelect(template));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="text-center">
            <p className="font-medium">Loading Templates</p>
            <p className="text-sm">Fetching garment gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Header with Quick Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name or type..."
              className="pl-10 h-11"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllWhite}
              className="whitespace-nowrap"
            >
              <Star className="h-4 w-4 mr-2" />
              Select All White
            </Button>
            
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none h-9"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none h-9"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Category Navigation */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="rounded-full"
          >
            All ({templates.length})
          </Button>
          {garmentTypes.slice(0, 8).map(type => {
            const count = templates.filter(t => t.garmentType === type).length;
            return (
              <Button
                key={type}
                variant={selectedCategory === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(type)}
                className="rounded-full text-xs"
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedTemplates.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Image className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ready to use in your product listing
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedTemplates.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedTemplates.map(template => (
                <Badge 
                  key={`${template.garmentType}-${template.name}`} 
                  variant="outline" 
                  className="text-xs bg-background/50"
                >
                  {template.garmentType}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Templates Gallery */}
      <div className="bg-background/50 rounded-2xl border border-border/50 overflow-hidden">
        <ScrollArea className="h-[500px]">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <div className="p-4 bg-muted/30 rounded-full mb-4">
                <Image className="h-8 w-8" />
              </div>
              <p className="font-medium">No templates found</p>
              <p className="text-sm text-center">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="p-4 space-y-8">
              {Object.entries(groupedTemplates).map(([garmentType, typeTemplates]) => (
                <div key={garmentType}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      {garmentType.charAt(0).toUpperCase() + garmentType.slice(1).replace('-', ' ')}
                      <Badge variant="secondary" className="text-xs">
                        {typeTemplates.length}
                      </Badge>
                    </h3>
                  </div>
                  
                   <div className={cn(
                     viewMode === 'grid' 
                       ? "grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2"
                       : "space-y-2"
                   )}>
                    {typeTemplates.map(template => {
                      const selected = isTemplateSelected(template);
                      
                      return (
                        <Card 
                          key={`${template.garmentType}-${template.name}`}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group",
                            selected && "ring-2 ring-primary bg-primary/5 shadow-lg scale-105",
                            viewMode === 'list' && "hover:scale-100"
                          )}
                          onClick={() => handleTemplateClick(template)}
                        >
                          <CardContent className={cn(
                            "p-2",
                            viewMode === 'list' && "flex items-center gap-4 p-4"
                          )}>
                            <div className={cn(
                              "relative overflow-hidden rounded-lg bg-muted/20",
                              viewMode === 'grid' ? "aspect-square mb-2" : "w-16 h-16 flex-shrink-0"
                            )}>
                               <img
                                src={template.url}
                                alt={template.name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                loading="lazy"
                                style={{ 
                                  imageRendering: 'crisp-edges'
                                }}
                              />
                              {selected && (
                                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    ✓ Selected
                                  </Badge>
                                </div>
                              )}
                              {template.color === 'white' && (
                                <div className="absolute top-1 right-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                </div>
                              )}
                            </div>
                            
                            <div className={cn(
                              viewMode === 'grid' ? "text-center" : "flex-1 min-w-0"
                            )}>
                              <p className={cn(
                                "font-medium truncate",
                                viewMode === 'grid' ? "text-xs" : "text-sm"
                              )}>
                                {template.name.replace('.png', '').replace(/^(White\s+|Cropped\s+)/i, '')}
                              </p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                viewMode === 'grid' ? "justify-center" : "justify-start"
                              )}>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  {template.view}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs px-1.5 py-0.5",
                                    template.color === 'white' && "bg-primary/10 text-primary border-primary/30"
                                  )}
                                >
                                  {template.color}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}