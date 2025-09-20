import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Loader2 } from 'lucide-react';
import { fetchSupabaseTemplates, type SupabaseTemplate } from '@/lib/studio/supabaseTemplates';
import { toast } from 'sonner';

interface GarmentTemplateSelectorProps {
  onSelect: (template: SupabaseTemplate) => void;
  selectedGarmentType?: string;
}

export const GarmentTemplateSelector: React.FC<GarmentTemplateSelectorProps> = ({ 
  onSelect, 
  selectedGarmentType = 'hoodie' 
}) => {
  const [templates, setTemplates] = useState<SupabaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<SupabaseTemplate | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await fetchSupabaseTemplates();
        
        // Filter templates for the selected garment type
        const filteredTemplates = allTemplates.filter(t => 
          t.garmentType === selectedGarmentType || 
          t.garmentType === 'hoodie' // Default to hoodie if no match
        );
        
        setTemplates(filteredTemplates);
        
        // Auto-select the first front-view template
        const frontTemplate = filteredTemplates.find(t => t.view === 'front');
        if (frontTemplate) {
          setSelectedTemplate(frontTemplate);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast.error('Failed to load garment templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedGarmentType]);

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      toast.success(`Selected ${selectedTemplate.garmentType} template`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading templates...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="w-5 h-5" />
          Select Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.name}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                selectedTemplate?.name === template.name
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-border'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div class="w-12 h-12 text-muted-foreground"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg></div>`;
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium capitalize">
                  {template.view}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.color}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Selected Template</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Type: {selectedTemplate.garmentType}</div>
              <div>View: {selectedTemplate.view}</div>
              <div>Color: {selectedTemplate.color}</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleSelectTemplate}
          disabled={!selectedTemplate}
          className="w-full"
          size="lg"
        >
          <Shirt className="w-4 h-4 mr-2" />
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );
};