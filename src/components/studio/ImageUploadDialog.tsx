import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { validateImageFileName, createImageMetadata, UploadProgress } from '@/lib/studio/imageMapping';
import { Upload, File, CheckCircle, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageUploadDialogProps {
  trigger?: React.ReactNode;
  onUploadComplete?: (uploadedFiles: string[]) => void;
}

export const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({ 
  trigger, 
  onUploadComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelection = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && /\.(png|jpg|jpeg)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      toast({
        title: "No valid images",
        description: "Please select PNG, JPG, or JPEG files",
        variant: "destructive",
      });
      return;
    }

    // Validate filenames and create upload progress
    const progress: UploadProgress[] = imageFiles.map(file => {
      const validation = validateImageFileName(file.name);
      return {
        filename: file.name,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error,
      };
    });

    setUploadProgress(progress);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  }, [handleFileSelection]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(e.target.files);
    }
  }, [handleFileSelection]);

  const simulateUpload = useCallback(async () => {
    setIsUploading(true);
    const validFiles = uploadProgress.filter(p => p.status === 'pending');
    
    // Simulate upload progress
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      // Update status to uploading
      setUploadProgress(prev => prev.map(p => 
        p.filename === file.filename ? { ...p, status: 'uploading' } : p
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => prev.map(p => 
          p.filename === file.filename ? { ...p, progress } : p
        ));
      }

      // Mark as complete
      setUploadProgress(prev => prev.map(p => 
        p.filename === file.filename ? { ...p, status: 'complete', progress: 100 } : p
      ));
    }

    setIsUploading(false);
    
    const uploadedFiles = validFiles.map(f => f.filename);
    toast({
      title: "Upload complete",
      description: `Successfully uploaded ${uploadedFiles.length} images`,
    });
    
    onUploadComplete?.(uploadedFiles);
    
    // Auto-close after a moment
    setTimeout(() => {
      setIsOpen(false);
      setUploadProgress([]);
    }, 2000);
  }, [uploadProgress, onUploadComplete, toast]);

  const clearProgress = () => {
    setUploadProgress([]);
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const validFileCount = uploadProgress.filter(p => p.status !== 'error').length;
  const completedCount = uploadProgress.filter(p => p.status === 'complete').length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Images
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Upload Apparel Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Naming Convention</h4>
            <p className="text-xs text-muted-foreground">
              Use the format: <code className="bg-background px-1 rounded">garment-orientation.ext</code>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">tshirt-front.png</Badge>
              <Badge variant="outline" className="text-xs">hoodie-back.jpg</Badge>
              <Badge variant="outline" className="text-xs">tank-side.jpeg</Badge>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="space-y-3">
              <Upload className={`w-12 h-12 mx-auto ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop your images here' : 'Drop images here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, JPEG files
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  Upload Progress ({completedCount}/{validFileCount})
                </h4>
                {!isUploading && uploadProgress.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearProgress}>
                    Clear
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-48">
                <div className="space-y-3">
                  {uploadProgress.map((item, index) => (
                    <div key={index} className="bg-card rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(item.status)}
                          <span className="text-sm font-mono truncate">
                            {item.filename}
                          </span>
                        </div>
                        <Badge 
                          variant={
                            item.status === 'complete' ? 'default' :
                            item.status === 'error' ? 'destructive' :
                            item.status === 'uploading' ? 'secondary' : 'outline'
                          }
                          className="text-xs ml-2"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      
                      {item.status === 'uploading' && (
                        <Progress value={item.progress} className="h-2" />
                      )}
                      
                      {item.error && (
                        <div className="flex items-start gap-2 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{item.error}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            {validFileCount > 0 && (
              <Button 
                onClick={simulateUpload}
                disabled={isUploading || validFileCount === 0}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : `Upload ${validFileCount} Images`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};