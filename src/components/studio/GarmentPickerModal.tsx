import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid, 
  Star, 
  Clock, 
  Shirt, 
  Crown, 
  Palette,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { getGarments, getGarmentDetail, type GarmentSummary, type GarmentDetail } from '@/lib/api/garments';
import { cn } from '@/lib/utils';

interface GarmentPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (garment: GarmentDetail, view?: string) => void;
  selectedGarmentType?: string;
}

// Garment categories for filtering
const GARMENT_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: Grid, count: 0 },
  { id: 'apparel', name: 'Apparel', icon: Shirt, count: 0 },
  { id: 'outerwear', name: 'Outerwear', icon: Crown, count: 0 },
  { id: 'accessories', name: 'Accessories', icon: Star, count: 0 },
];

export const GarmentPickerModal: React.FC<GarmentPickerModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedGarmentType
}) => {
  const [garments, setGarments] = useState<GarmentSummary[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<GarmentDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState('front');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load garments on modal open
  useEffect(() => {
    if (open) {
      loadGarments();
    }
  }, [open]);

  const loadGarments = async () => {
    try {
      setLoading(true);
      const allGarments = await getGarments();
      setGarments(allGarments);
      
      // Auto-select first garment or specified type
      let targetGarment = allGarments[0];
      if (selectedGarmentType) {
        const specified = allGarments.find(g => 
          g.slug.toLowerCase() === selectedGarmentType.toLowerCase()
        );
        if (specified) targetGarment = specified;
      }
      
      if (targetGarment) {
        await handleSelectGarment(targetGarment);
      }
    } catch (error) {
      console.error('Failed to load garments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGarment = async (garment: GarmentSummary) => {
    try {
      setDetailLoading(true);
      const detail = await getGarmentDetail(garment.slug);
      if (detail) {
        setSelectedGarment(detail);
        setSelectedView('front'); // Reset to front view
      }
    } catch (error) {
      console.error('Failed to load garment detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUseTemplate = () => {
    if (selectedGarment) {
      onSelect(selectedGarment, selectedView);
      onOpenChange(false);
    }
  };

  // Filter and categorize garments
  const filteredGarments = useMemo(() => {
    let filtered = garments;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(garment => {
        const name = garment.name.toLowerCase();
        switch (selectedCategory) {
          case 'apparel':
            return name.includes('shirt') || name.includes('tee') || name.includes('tank');
          case 'outerwear':
            return name.includes('hoodie') || name.includes('jacket') || name.includes('sweater');
          case 'accessories':
            return name.includes('cap') || name.includes('hat') || name.includes('bag');
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(garment =>
        garment.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [garments, selectedCategory, searchQuery]);

  const availableViews = selectedGarment ? Object.keys(selectedGarment.views) : [];
  const currentViewData = selectedGarment?.views[selectedView];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5" />
            Choose Your Canvas
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(85vh-80px)]">
          {/* Left Panel - Selection */}
          <div className="flex-1 flex flex-col border-r">
            {/* Search & Filter Bar */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex gap-3 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search garments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  {GARMENT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Icon className="w-3 h-3" />
                        {category.name}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Garments Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading garments...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 p-4">
                  {filteredGarments.map((garment) => (
                    <Card
                      key={garment.slug}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedGarment?.slug === garment.slug
                          ? "ring-2 ring-primary shadow-lg"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handleSelectGarment(garment)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted/50 rounded-md mb-2 overflow-hidden">
                          {garment.preview_url ? (
                            <img
                              src={garment.preview_url}
                              alt={garment.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-medium leading-tight">{garment.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {garment.template_count} views
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel - Preview & Details */}
          <div className="w-80 flex flex-col">
            {selectedGarment ? (
              <>
                {/* View Selection */}
                <div className="p-4 border-b">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Options
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableViews.map((view) => (
                      <Badge
                        key={view}
                        variant={selectedView === view ? "default" : "outline"}
                        className="cursor-pointer capitalize hover:bg-primary/10"
                        onClick={() => setSelectedView(view)}
                      >
                        {view}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex-1 p-4">
                  <h4 className="font-medium mb-3">Preview</h4>
                  {detailLoading ? (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : currentViewData ? (
                    <div className="space-y-3">
                      <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
                        <img
                          src={currentViewData.url}
                          alt={`${selectedGarment.name} ${selectedView} view`}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      
                      {/* Technical Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="font-mono">{currentViewData.width_px} × {currentViewData.height_px}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolution:</span>
                          <span className="font-mono">{currentViewData.dpi} DPI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Format:</span>
                          <span>High Quality PNG</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No preview available</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t">
                  <Button
                    onClick={handleUseTemplate}
                    className="w-full gap-2"
                    disabled={!currentViewData}
                  >
                    <Download className="w-4 h-4" />
                    Use {selectedGarment.name}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Start designing with this template
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <Shirt className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Select a garment to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};