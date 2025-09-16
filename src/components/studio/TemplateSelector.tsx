import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAvailableGarmentTypes, 
  getTemplatesForGarment, 
  SupabaseTemplate 
} from '@/lib/studio/supabaseTemplates';
import { Loader2, Image as ImageIcon, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelect: (template: SupabaseTemplate) => void;
  selectedGarmentType?: string;
  className?: string;
}

export const TemplateSelector = ({ 
  onSelect, 
  selectedGarmentType,
  className 
}: TemplateSelectorProps) => {
  const [garmentTypes, setGarmentTypes] = useState<string[]>([]);
  const [templates, setTemplates] = useState<SupabaseTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<string>(selectedGarmentType || '');
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    const loadGarmentTypes = async () => {
      try {
        const types = await getAvailableGarmentTypes();
        setGarmentTypes(types);
        if (!selectedType && types.length > 0) {
          setSelectedType(types[0]);
        }
      } catch (error) {
        console.error('Failed to load garment types:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGarmentTypes();
  }, [selectedType]);

  useEffect(() => {
    if (selectedType) {
      const loadTemplates = async () => {
        setTemplatesLoading(true);
        try {
          const garmentTemplates = await getTemplatesForGarment(selectedType);
          setTemplates(garmentTemplates);
        } catch (error) {
          console.error('Failed to load templates:', error);
        } finally {
          setTemplatesLoading(false);
        }
      };

      loadTemplates();
    }
  }, [selectedType]);

  const groupedTemplates = templates.reduce((acc, template) => {
    const key = template.view;
    if (!acc[key]) acc[key] = [];
    acc[key].push(template);
    return acc;
  }, {} as Record<string, SupabaseTemplate[]>);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Supabase Templates
          <Badge variant="secondary">{templates.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {garmentTypes.slice(0, 3).map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {type.replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {garmentTypes.map((type) => (
            <TabsContent key={type} value={type}>
              {templatesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="ml-2">Loading {type} templates...</span>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {Object.entries(groupedTemplates).map(([view, viewTemplates]) => (
                      <div key={view} className="space-y-2">
                        <h4 className="text-sm font-medium capitalize flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          {view} View
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {viewTemplates.map((template) => (
                            <Button
                              key={template.name}
                              variant="outline"
                              className={cn(
                                "h-auto p-2 flex flex-col items-center gap-2",
                                "hover:bg-primary/10 transition-colors"
                              )}
                              onClick={() => onSelect(template)}
                            >
                              <img
                                src={template.url}
                                alt={template.name}
                                className="w-16 h-16 object-contain rounded"
                                loading="lazy"
                              />
                              <div className="text-center">
                                <div className="text-xs font-medium truncate w-full">
                                  {template.garmentType}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {template.color}
                                </Badge>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};