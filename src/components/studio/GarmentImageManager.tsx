import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUploadDialog } from './ImageUploadDialog';
import { staticImageMap, customImageMap, mockupImageMap } from '@/lib/studio/imageMapping';
import { Upload, Image as ImageIcon, Folder, FileImage } from 'lucide-react';

interface GarmentImageManagerProps {
  className?: string;
}

export const GarmentImageManager: React.FC<GarmentImageManagerProps> = ({ className }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = (uploadedFiles: string[]) => {
    // Force a refresh of the component to show new images
    setRefreshKey(prev => prev + 1);
  };

  // Get all available garments across all image sources
  const getAllAvailableGarments = () => {
    const garmentIds = new Set([
      ...Object.keys(staticImageMap),
      ...Object.keys(customImageMap),
      ...Object.keys(mockupImageMap),
    ]);

    return Array.from(garmentIds).map(id => {
      const staticImages = staticImageMap[id] || {};
      const customImages = customImageMap[id] || {};
      const mockupImages = mockupImageMap[id] || {};
      
      return {
        id,
        hasStatic: Object.keys(staticImages).length > 0,
        hasCustom: Object.keys(customImages).length > 0,
        hasMockup: Object.keys(mockupImages).length > 0,
        totalImages: new Set([
          ...Object.keys(staticImages),
          ...Object.keys(customImages),
          ...Object.keys(mockupImages),
        ]).size,
        images: {
          static: staticImages,
          custom: customImages,
          mockup: mockupImages,
        }
      };
    }).sort((a, b) => a.id.localeCompare(b.id));
  };

  const garments = getAllAvailableGarments();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Garment Image Manager
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and upload custom apparel images
            </p>
          </div>
          <ImageUploadDialog
            onUploadComplete={handleUploadComplete}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {garments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No garment images found</p>
                <p className="text-xs">Upload some images to get started</p>
              </div>
            ) : (
              garments.map(garment => (
                <div key={`${garment.id}-${refreshKey}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded border flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{garment.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {garment.totalImages} image{garment.totalImages !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {garment.hasStatic && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Folder className="w-3 h-3" />
                        Static
                      </Badge>
                    )}
                    {garment.hasCustom && (
                      <Badge variant="default" className="text-xs gap-1">
                        <Upload className="w-3 h-3" />
                        Custom
                      </Badge>
                    )}
                    {garment.hasMockup && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Mockup
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Image Statistics */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-primary">{Object.keys(staticImageMap).length}</p>
            <p className="text-xs text-muted-foreground">Static Sets</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{Object.keys(customImageMap).length}</p>
            <p className="text-xs text-muted-foreground">Custom Sets</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{Object.keys(mockupImageMap).length}</p>
            <p className="text-xs text-muted-foreground">Mockup Sets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};