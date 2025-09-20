import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplatePopulator } from '../studio/TemplatePopulator';
import { TemplateSync } from './TemplateSync';
import { GarmentImageManager } from '../studio/GarmentImageManager';
import { Database, RefreshCw, Upload } from 'lucide-react';

export const TemplateManager: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <p className="text-muted-foreground">
          Manage garment templates and sync storage with database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <TemplateSync />
        <TemplatePopulator />
        <GarmentImageManager />
      </div>
    </div>
  );
};