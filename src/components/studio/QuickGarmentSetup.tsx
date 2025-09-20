import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GarmentPickerModal } from './GarmentPickerModal';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '@/lib/studio/store';
import { Palette, Sparkles, ArrowRight } from 'lucide-react';
import { type GarmentDetail } from '@/lib/api/garments';

interface QuickGarmentSetupProps {
  className?: string;
}

export const QuickGarmentSetup: React.FC<QuickGarmentSetupProps> = ({ className }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { createDesign, setActiveTab } = useAppStore();
  const { initializeFromGarment } = useStudioStore();

  const handleGarmentSelect = (garment: GarmentDetail, view?: string) => {
    // Create design
    const success = createDesign(garment.slug);
    if (!success) {
      alert('Design limit reached! Upgrade to create more designs.');
      return;
    }

    // Initialize studio with garment
    initializeFromGarment(garment.slug, 'white');
    
    // Navigate to studio
    setActiveTab('studio');
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-primary" />
            Quick Setup
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose from our premium garment collection to start designing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">25+</div>
              <div className="text-xs text-muted-foreground">Garment Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">300</div>
              <div className="text-xs text-muted-foreground">DPI Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">HD</div>
              <div className="text-xs text-muted-foreground">Mockups</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Professional grade templates</span>
              <Badge variant="secondary" className="ml-auto text-xs">NEW</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm">Multiple view angles</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Print-ready specifications</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            Choose Your Canvas
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Browse our collection of high-quality garment templates
          </p>
        </CardContent>
      </Card>

      <GarmentPickerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleGarmentSelect}
      />
    </>
  );
};