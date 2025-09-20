import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { populateTemplatesFromStorage } from '@/lib/api/populate-templates';

export const TemplateSync: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    processed: number;
    skipped: number;
    inserted: number;
    error?: string;
  } | null>(null);

  const handleSync = async () => {
    setIsPopulating(true);
    setResult(null);
    
    try {
      const response = await populateTemplatesFromStorage();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        processed: 0,
        skipped: 0,
        inserted: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Sync Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Synchronize garment template database with storage bucket. This will add any missing templates.
        </p>
        
        <Button 
          onClick={handleSync} 
          disabled={isPopulating}
          className="w-full"
        >
          {isPopulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Syncing Templates...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {result.success ? (
                <div className="space-y-1">
                  <p className="font-medium text-green-800">Sync completed!</p>
                  <p className="text-sm text-green-700">
                    Processed: {result.processed} files<br />
                    Added: {result.inserted} new templates<br />
                    Skipped: {result.skipped} existing
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-800">Sync failed</p>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};