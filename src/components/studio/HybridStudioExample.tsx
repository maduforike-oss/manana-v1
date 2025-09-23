import React from 'react';
import { LiveDrawingDemo } from './LiveDrawingDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const HybridStudioExample: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Hybrid Studio Architecture</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Live drawing concepts integrated into the professional studio system, 
          providing smooth drawing performance while preserving all advanced features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="secondary">Live</Badge>
              Real-time Drawing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Strokes are drawn in real-time with live preview before being committed to the document.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="secondary">Pro</Badge>
              Professional Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Maintains all existing features: print surfaces, 3D mode, mockups, and advanced canvas settings.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="secondary">Performance</Badge>
              Optimized History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              History snapshots only created when strokes are committed, reducing memory usage.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <LiveDrawingDemo />
    </div>
  );
};