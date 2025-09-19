"use client";
import React, { useState, useEffect } from 'react';
import { fetchSupabaseTemplates, getAvailableGarmentTypes, type SupabaseTemplate } from '@/lib/studio/supabaseTemplates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface GarmentSelection {
  garmentType: string;
  template: SupabaseTemplate;
  view: string;
}

interface SupabaseGarmentPickerProps {
  onSelect: (selection: GarmentSelection) => void;
}

export default function SupabaseGarmentPicker({ onSelect }: SupabaseGarmentPickerProps) {
  const [garmentTypes, setGarmentTypes] = useState<string[]>([]);
  const [templates, setTemplates] = useState<SupabaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGarmentType, setSelectedGarmentType] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<string>('front');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, allTemplates] = await Promise.all([
          getAvailableGarmentTypes(),
          fetchSupabaseTemplates()
        ]);
        
        setGarmentTypes(types);
        setTemplates(allTemplates);
        
        // Auto-select first garment type
        if (types.length > 0) {
          setSelectedGarmentType(types[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const availableViews = selectedGarmentType 
    ? [...new Set(templates.filter(t => t.garmentType === selectedGarmentType).map(t => t.view))]
    : [];

  const currentTemplate = selectedGarmentType 
    ? templates.find(t => t.garmentType === selectedGarmentType && t.view === selectedView)
    : null;

  const handleStartDesigning = () => {
    if (!selectedGarmentType || !currentTemplate) return;
    
    onSelect({
      garmentType: selectedGarmentType,
      template: currentTemplate,
      view: selectedView
    });
  };

  const formatGarmentName = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading garment templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Error loading templates: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Garment Type Selection */}
      <section>
        <h2 className="text-xl font-medium mb-4">1. Choose a Garment Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {garmentTypes.map((type) => {
            const frontTemplate = templates.find(t => t.garmentType === type && t.view === 'front');
            
            return (
              <Card 
                key={type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedGarmentType === type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedGarmentType(type);
                  setSelectedView('front');
                }}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    {frontTemplate ? (
                      <img 
                        src={frontTemplate.url}
                        alt={formatGarmentName(type)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">No preview</span>
                    )}
                  </div>
                  <h3 className="font-medium">{formatGarmentName(type)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {templates.filter(t => t.garmentType === type).length} view{templates.filter(t => t.garmentType === type).length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {selectedGarmentType && (
        <>
          {/* View Selection */}
          <section>
            <h2 className="text-xl font-medium mb-4">2. Select View</h2>
            <div className="flex flex-wrap gap-2">
              {availableViews.map((view) => (
                <Badge 
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedView(view)}
                >
                  {view}
                </Badge>
              ))}
            </div>
          </section>

          {/* Preview & Action */}
          <section className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 className="text-xl font-medium mb-4">Preview</h2>
              <div className="aspect-square max-w-sm bg-muted rounded-lg p-4 flex items-center justify-center">
                {currentTemplate ? (
                  <img 
                    src={currentTemplate.url}
                    alt={`${formatGarmentName(selectedGarmentType)} ${selectedView} view`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground">View not available</span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-medium mb-4">Ready to Design?</h2>
              <div className="space-y-3 mb-6">
                <p><strong>Garment:</strong> {formatGarmentName(selectedGarmentType)}</p>
                <p><strong>View:</strong> {selectedView}</p>
                <p><strong>Color:</strong> White</p>
              </div>
              
              <Button 
                onClick={handleStartDesigning}
                size="lg"
                className="w-full"
                disabled={!currentTemplate}
              >
                Start Designing
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}