import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { populateTemplatesFromStorage } from '@/lib/api/populate-templates';
import { toast } from 'sonner';

export default function TemplateSyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    processed: number;
    skipped: number;
    inserted: number;
    error?: string;
  } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await populateTemplatesFromStorage();
      setLastResult(result);
      
      if (result.success) {
        toast.success(`Sync completed! Processed ${result.processed} files, inserted ${result.inserted} new templates.`);
      } else {
        toast.error(`Sync failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Template sync error:', error);
      toast.error('Failed to sync templates');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Template Sync</h1>
        <p className="text-muted-foreground">
          Sync garment template images from storage to the database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Template Database Sync
          </CardTitle>
          <CardDescription>
            This will scan the storage bucket for template images and add them to the database.
            Existing templates will not be duplicated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing Templates...
              </>
            ) : (
              'Sync Templates from Storage'
            )}
          </Button>

          {lastResult && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {lastResult.success ? 'Sync Completed' : 'Sync Failed'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Processed: {lastResult.processed}
                </Badge>
                <Badge variant="outline">
                  Inserted: {lastResult.inserted}
                </Badge>
                <Badge variant="outline">
                  Skipped: {lastResult.skipped}
                </Badge>
              </div>

              {lastResult.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {lastResult.error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}