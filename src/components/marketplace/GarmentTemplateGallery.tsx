import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Image, Loader2 } from 'lucide-react';
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
    return matchesSearch && matchesCategory;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading garment templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {garmentTypes.slice(0, 5).map(type => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Selected Templates Summary */}
      {selectedTemplates.length > 0 && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
            </span>
            <Badge variant="secondary">{selectedTemplates.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTemplates.map(template => (
              <Badge 
                key={`${template.garmentType}-${template.name}`} 
                variant="outline" 
                className="text-xs"
              >
                {template.garmentType}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Templates Gallery */}
      <ScrollArea className="h-[400px]">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Image className="h-8 w-8 mb-2" />
            <p className="text-sm">No templates found</p>
            <p className="text-xs">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([garmentType, typeTemplates]) => (
              <div key={garmentType}>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  {garmentType.charAt(0).toUpperCase() + garmentType.slice(1).replace('-', ' ')}
                  <Badge variant="secondary">{typeTemplates.length}</Badge>
                </h3>
                
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                    : "space-y-2"
                )}>
                  {typeTemplates.map(template => {
                    const selected = isTemplateSelected(template);
                    
                    return (
                      <Card 
                        key={`${template.garmentType}-${template.name}`}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selected && "ring-2 ring-primary bg-primary/5",
                          viewMode === 'list' && "flex items-center"
                        )}
                        onClick={() => handleTemplateClick(template)}
                      >
                        <CardContent className={cn(
                          "p-3",
                          viewMode === 'list' && "flex items-center gap-3 w-full"
                        )}>
                          <div className={cn(
                            "relative",
                            viewMode === 'grid' ? "aspect-square mb-2" : "w-16 h-16 flex-shrink-0"
                          )}>
                            <img
                              src={template.url}
                              alt={template.name}
                              className="w-full h-full object-contain rounded-md bg-white"
                              loading="lazy"
                            />
                            {selected && (
                              <div className="absolute inset-0 bg-primary/20 rounded-md flex items-center justify-center">
                                <Badge className="bg-primary text-primary-foreground">Selected</Badge>
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
                              {template.name.replace('.png', '')}
                            </p>
                            <div className="flex items-center gap-1 mt-1 justify-center">
                              <Badge variant="outline" className="text-xs">
                                {template.view}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
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
  );
}