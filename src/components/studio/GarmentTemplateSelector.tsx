import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getGarments, getGarmentDetail, type GarmentSummary, type GarmentDetail } from "@/lib/api/garments";

interface GarmentTemplateSelectorProps {
  onSelect: (garment: GarmentDetail, view?: string) => void;
  selectedGarmentType?: string;
}

export default function GarmentTemplateSelector({ onSelect, selectedGarmentType }: GarmentTemplateSelectorProps) {
  const [garments, setGarments] = useState<GarmentSummary[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<GarmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<string>('front');

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

  const handleSelectGarment = async (garmentSlug: string) => {
    try {
      const detail = await getGarmentDetail(garmentSlug);
      if (detail) {
        setSelectedGarment(detail);
        // Reset to front view when changing garments
        setSelectedView('front');
      }
    } catch (error) {
      console.error("Failed to load garment detail:", error);
    }
  };

  const handleUseTemplate = () => {
    if (selectedGarment) {
      onSelect(selectedGarment, selectedView);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading garments...</span>
      </div>
    );
  }

  const availableViews = selectedGarment ? Object.keys(selectedGarment.views) : [];
  const currentViewData = selectedGarment?.views[selectedView];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Garment Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Garment Type Selection */}
        <div className="space-y-2">
          <h4 className="font-medium">Garment Type</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {garments.map((garment) => (
              <div
                key={garment.slug}
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedGarment?.slug === garment.slug
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleSelectGarment(garment.slug)}
              >
                {garment.preview_url && (
                  <div className="aspect-square relative mb-2 overflow-hidden rounded">
                    <img
                      src={garment.preview_url}
                      alt={garment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">{garment.name}</p>
                  <p className="text-xs text-muted-foreground">{garment.template_count} templates</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Selection */}
        {selectedGarment && availableViews.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">View</h4>
            <div className="flex gap-2">
              {availableViews.map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedView(view)}
                  className="capitalize"
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {currentViewData && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview</h4>
            <div className="aspect-square max-w-xs mx-auto border rounded-lg overflow-hidden">
              <img
                src={currentViewData.url}
                alt={`${selectedGarment?.name} ${selectedView} view`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{selectedGarment?.name} - {selectedView} view</p>
              <p className="text-xs text-muted-foreground">
                {currentViewData.width_px} × {currentViewData.height_px}px • {currentViewData.dpi} DPI
              </p>
            </div>
          </div>
        )}

        {/* Use Template Button */}
        {selectedGarment && currentViewData && (
          <div className="border-t pt-4">
            <Button 
              onClick={handleUseTemplate}
              className="w-full"
            >
              Use {selectedGarment.name} Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}