import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Search, 
  Shirt, 
  Crown, 
  Star, 
  Grid, 
  Eye,
  ArrowRight,
  ArrowLeft,
  Palette
} from "lucide-react";
import { getGarments, getGarmentDetail, type GarmentSummary, type GarmentDetail } from "@/lib/api/garments";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useViewportHeight } from "@/hooks/useViewportHeight";

interface GarmentTemplateSelectorProps {
  onSelect: (garment: GarmentDetail, view?: string) => void;
  selectedGarmentType?: string;
}

// Garment categories for better organization
const GARMENT_CATEGORIES = [
  { 
    id: 'all', 
    name: 'All Items', 
    icon: Grid, 
    filter: () => true 
  },
  { 
    id: 'apparel', 
    name: 'Apparel', 
    icon: Shirt, 
    filter: (garment: GarmentSummary) => {
      const name = garment.name.toLowerCase();
      return name.includes('shirt') || name.includes('tee') || name.includes('tank') || 
             name.includes('polo') || name.includes('vneck');
    }
  },
  { 
    id: 'outerwear', 
    name: 'Outerwear', 
    icon: Crown, 
    filter: (garment: GarmentSummary) => {
      const name = garment.name.toLowerCase();
      return name.includes('hoodie') || name.includes('jacket') || name.includes('sweater') || 
             name.includes('crewneck') || name.includes('pullover') || name.includes('zip');
    }
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    icon: Star, 
    filter: (garment: GarmentSummary) => {
      const name = garment.name.toLowerCase();
      return name.includes('cap') || name.includes('hat') || name.includes('bag') || 
             name.includes('beanie') || name.includes('tote') || name.includes('apron') ||
             name.includes('trucker') || name.includes('snapback');
    }
  },
];

export default function GarmentTemplateSelector({ onSelect, selectedGarmentType }: GarmentTemplateSelectorProps) {
  const [garments, setGarments] = useState<GarmentSummary[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<GarmentDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<string>('front');
  const [mobileStep, setMobileStep] = useState<'selection' | 'preview'>('selection');
  
  const isMobile = useIsMobile();
  const { calculateScrollHeight, availableHeight } = useViewportHeight();

  useEffect(() => {
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
          const detail = await getGarmentDetail(targetGarment.slug);
          if (detail) {
            setSelectedGarment(detail);
          }
        }
      } catch (error) {
        console.error("Failed to load garments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGarments();
  }, [selectedGarmentType]);

  const handleSelectGarment = async (garment: GarmentSummary) => {
    try {
      setDetailLoading(true);
      const detail = await getGarmentDetail(garment.slug);
      if (detail) {
        setSelectedGarment(detail);
        // Reset to front view when changing garments
        setSelectedView('front');
        // On mobile, move to preview step
        if (isMobile) {
          setMobileStep('preview');
        }
      }
    } catch (error) {
      console.error("Failed to load garment detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setMobileStep('selection');
  };

  // Filter and categorize garments
  const filteredGarments = useMemo(() => {
    let filtered = garments;

    // Category filter
    if (selectedCategory !== 'all') {
      const category = GARMENT_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(category.filter);
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(garment =>
        garment.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [garments, selectedCategory, searchQuery]);

  const handleUseTemplate = () => {
    if (selectedGarment) {
      onSelect(selectedGarment, selectedView);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading Templates</h3>
            <p className="text-sm text-muted-foreground">Fetching your garment collection...</p>
          </div>
        </div>
      </div>
    );
  }

  const availableViews = selectedGarment ? Object.keys(selectedGarment.views) : [];
  const currentViewData = selectedGarment?.views[selectedView];

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="p-4 border-b bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-3">
            {mobileStep === 'preview' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {mobileStep === 'selection' ? 'Choose Template' : selectedGarment?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mobileStep === 'selection' 
                  ? `${garments.length} templates available`
                  : 'Configure and preview'
                }
              </p>
            </div>
          </div>
        </div>

        {mobileStep === 'selection' ? (
        <MobileSelectionView
          garments={garments}
          filteredGarments={filteredGarments}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          onSelectGarment={handleSelectGarment}
          selectedGarment={selectedGarment}
        />
        ) : (
          <MobilePreviewView
            selectedGarment={selectedGarment}
            selectedView={selectedView}
            availableViews={availableViews}
            currentViewData={currentViewData}
            detailLoading={detailLoading}
            onViewChange={setSelectedView}
            onUseTemplate={handleUseTemplate}
          />
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Choose Your Canvas</h2>
            <p className="text-muted-foreground">Select from {garments.length} professional garment templates</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Selection */}
        <div className="flex-1 flex flex-col">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b bg-muted/30">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search garments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  {GARMENT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const categoryCount = garments.filter(category.filter).length;
                    return (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="flex flex-col items-center gap-1 text-xs"
                      >
                        <Icon className="w-3 h-3" />
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {category.id === 'all' ? garments.length : categoryCount}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Garments Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {filteredGarments.length === 0 ? (
                <div className="text-center py-12">
                  <Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No garments found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGarments.map((garment) => (
                    <GarmentCard
                      key={garment.slug}
                      garment={garment}
                      isSelected={selectedGarment?.slug === garment.slug}
                      onSelect={() => handleSelectGarment(garment)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Preview & Details */}
        <div className="w-80 border-l bg-muted/20">
          {selectedGarment ? (
            <div className="h-full flex flex-col">
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
                      className="cursor-pointer capitalize hover:bg-primary/10 transition-colors"
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
                  <div className="space-y-4">
                    <div className="aspect-square bg-background rounded-lg border-2 border-dashed border-border/50 overflow-hidden">
                      <img
                        src={currentViewData.url}
                        alt={`${selectedGarment.name} ${selectedView} view`}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    
                    {/* Technical Details */}
                    <div className="space-y-3">
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="font-mono text-xs">{currentViewData.width_px} × {currentViewData.height_px}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolution:</span>
                          <span className="font-mono text-xs">{currentViewData.dpi} DPI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Format:</span>
                          <span className="text-xs">High Quality PNG</span>
                        </div>
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
                  disabled={!currentViewData || detailLoading}
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4" />
                  Start Designing with {selectedGarment.name}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Initialize studio with selected template
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Shirt className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Select a Garment</h4>
                  <p className="text-sm text-muted-foreground">Choose a template from the left to see preview and details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile Selection View Component
function MobileSelectionView({
  garments,
  filteredGarments,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onSelectGarment,
  selectedGarment
}: {
  garments: GarmentSummary[];
  filteredGarments: GarmentSummary[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSelectGarment: (garment: GarmentSummary) => void;
  selectedGarment: GarmentDetail | null;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Search & Filter */}
      <div className="p-4 space-y-3 border-b bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="w-full overflow-x-auto mobile-category-scroll">
          <div className="flex gap-2 pb-2 min-w-max px-1">
            {GARMENT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const categoryCount = garments.filter(category.filter).length;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-3 h-3" />
                  {category.name}
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {category.id === 'all' ? garments.length : categoryCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Garments Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredGarments.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredGarments.map((garment) => (
              <MobileGarmentCard
                key={garment.slug}
                garment={garment}
                onSelect={() => onSelectGarment(garment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Preview View Component
function MobilePreviewView({
  selectedGarment,
  selectedView,
  availableViews,
  currentViewData,
  detailLoading,
  onViewChange,
  onUseTemplate
}: {
  selectedGarment: GarmentDetail | null;
  selectedView: string;
  availableViews: string[];
  currentViewData: any;
  detailLoading: boolean;
  onViewChange: (view: string) => void;
  onUseTemplate: () => void;
}) {
  if (!selectedGarment) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* View Options */}
      <div className="p-4 border-b">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Choose View
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableViews.map((view) => (
            <Button
              key={view}
              variant={selectedView === view ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange(view)}
              className="capitalize"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailLoading ? (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : currentViewData ? (
          <div className="space-y-4">
            <div className="aspect-square bg-background rounded-lg border-2 border-dashed border-border/50 overflow-hidden">
              <img
                src={currentViewData.url}
                alt={`${selectedGarment.name} ${selectedView} view`}
                className="w-full h-full object-contain p-4"
              />
            </div>
            
            {/* Technical Details */}
            <div className="space-y-3">
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Dimensions</span>
                  <span className="font-mono text-xs">{currentViewData.width_px} × {currentViewData.height_px}px</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Resolution</span>
                  <span className="font-mono text-xs">{currentViewData.dpi} DPI</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No preview available</span>
          </div>
        )}
      </div>

      {/* Mobile Action Button */}
      <div className="p-4 border-t">
        <Button
          onClick={onUseTemplate}
          className="w-full gap-2"
          disabled={!currentViewData || detailLoading}
          size="lg"
        >
          <ArrowRight className="w-4 h-4" />
          Start Designing
        </Button>
      </div>
    </div>
  );
}

// Reusable Garment Card Component
function GarmentCard({
  garment,
  isSelected,
  onSelect
}: {
  garment: GarmentSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        isSelected
          ? "ring-2 ring-primary shadow-lg"
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-muted/30 rounded-lg mb-3 overflow-hidden relative">
          {garment.preview_url ? (
            <>
              <img
                src={garment.preview_url}
                alt={garment.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm leading-tight">{garment.name}</h4>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {garment.template_count} views
            </Badge>
            {isSelected && (
              <Badge className="text-xs">Selected</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile-Optimized Garment Card
function MobileGarmentCard({
  garment,
  onSelect
}: {
  garment: GarmentSummary;
  onSelect: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md active:scale-95"
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="aspect-square bg-muted/30 rounded-lg mb-2 overflow-hidden">
          {garment.preview_url ? (
            <img
              src={garment.preview_url}
              alt={garment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h4 className="font-medium text-xs leading-tight line-clamp-2">{garment.name}</h4>
          <Badge variant="outline" className="text-xs w-fit">
            {garment.template_count} views
          </Badge>
        </div>
        <Button size="sm" className="w-full mt-2 text-xs">
          Select
        </Button>
      </CardContent>
    </Card>
  );
}