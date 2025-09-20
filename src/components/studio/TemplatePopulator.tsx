import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { populateTemplatesFromStorage } from '@/lib/api/populate-templates';

export const TemplatePopulator: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    processed: number;
    skipped: number;
    inserted: number;
    error?: string;
  } | null>(null);

  const handlePopulate = async () => {
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Template Database Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Populate the database with templates from the design-templates storage bucket.
        </p>
        
        <Button 
          onClick={handlePopulate} 
          disabled={isPopulating}
          className="w-full"
        >
          {isPopulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Populating Templates...
            </>
          ) : (
            'Populate Templates'
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
                  <p className="font-medium text-green-800">Templates populated successfully!</p>
                  <p className="text-sm text-green-700">
                    Processed: {result.processed} files<br />
                    Inserted: {result.inserted} templates<br />
                    Skipped: {result.skipped} files
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-800">Failed to populate templates</p>
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