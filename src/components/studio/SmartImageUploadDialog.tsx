import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { recognizeMultipleGarments, RecognitionResult } from '@/lib/studio/imageRecognition';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Image as ImageIcon, 
  Brain, 
  Sparkles,
  Eye,
  FileText
} from 'lucide-react';

interface SmartUploadProgress {
  file: File;
  filename: string;
  progress: number;
  status: 'analyzing' | 'recognized' | 'uploading' | 'complete' | 'error';
  recognition?: RecognitionResult;
  error?: string;
}

interface SmartImageUploadDialogProps {
  trigger?: React.ReactNode;
  onUploadComplete?: (uploadedFiles: { original: string; suggested: string; recognition: RecognitionResult }[]) => void;
}

export const SmartImageUploadDialog: React.FC<SmartImageUploadDialogProps> = ({ 
  trigger, 
  onUploadComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<SmartUploadProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelection = useCallback(async (files: FileList | File[]) => {
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

    // Initialize progress for all files
    const initialProgress: SmartUploadProgress[] = imageFiles.map(file => ({
      file,
      filename: file.name,
      progress: 0,
      status: 'analyzing'
    }));

    setUploadProgress(initialProgress);
    setIsProcessing(true);

    try {
      // Perform smart recognition on all files
      toast({
        title: "🧠 Analyzing images...",
        description: "Using AI to recognize garment types and orientations",
      });

      const recognitionResults = await recognizeMultipleGarments(imageFiles);

      // Update progress with recognition results
      setUploadProgress(prev => prev.map((item, index) => ({
        ...item,
        status: 'recognized',
        progress: 50,
        recognition: recognitionResults[index]
      })));

      toast({
        title: "✨ Recognition complete!",
        description: `Analyzed ${imageFiles.length} images successfully`,
      });

    } catch (error) {
      console.error('Recognition error:', error);
      toast({
        title: "Recognition failed",
        description: "Falling back to manual naming",
        variant: "destructive",
      });

      // Mark all as error
      setUploadProgress(prev => prev.map(item => ({
        ...item,
        status: 'error',
        error: 'Failed to analyze image'
      })));
    }

    setIsProcessing(false);
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

  const handleUpload = useCallback(async () => {
    const recognizedFiles = uploadProgress.filter(p => p.status === 'recognized' && p.recognition);
    
    if (recognizedFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please wait for image analysis to complete",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate upload process
    for (let i = 0; i < recognizedFiles.length; i++) {
      const file = recognizedFiles[i];
      
      // Update status to uploading
      setUploadProgress(prev => prev.map(p => 
        p.filename === file.filename ? { ...p, status: 'uploading', progress: 50 } : p
      ));

      // Simulate upload progress
      for (let progress = 50; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => prev.map(p => 
          p.filename === file.filename ? { ...p, progress } : p
        ));
      }

      // Mark as complete
      setUploadProgress(prev => prev.map(p => 
        p.filename === file.filename ? { ...p, status: 'complete', progress: 100 } : p
      ));
    }

    setIsProcessing(false);
    
    const results = recognizedFiles.map(f => ({
      original: f.filename,
      suggested: f.recognition!.suggestedFilename,
      recognition: f.recognition!
    }));

    toast({
      title: "🎉 Upload complete!",
      description: `Successfully processed ${results.length} images with smart recognition`,
    });
    
    onUploadComplete?.(results);
    
    // Auto-close after a moment
    setTimeout(() => {
      setIsOpen(false);
      setUploadProgress([]);
    }, 3000);
  }, [uploadProgress, onUploadComplete, toast]);

  const getStatusIcon = (status: SmartUploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'analyzing':
        return <Brain className="w-4 h-4 text-purple-500 animate-pulse" />;
      case 'recognized':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: SmartUploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="text-xs bg-green-500/10 text-green-700 border-green-300">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      case 'uploading':
        return <Badge variant="secondary" className="text-xs">Uploading</Badge>;
      case 'analyzing':
        return <Badge className="text-xs bg-purple-500/10 text-purple-700 border-purple-300">Analyzing</Badge>;
      case 'recognized':
        return <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-300">Recognized</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  const recognizedCount = uploadProgress.filter(p => p.status === 'recognized').length;
  const completedCount = uploadProgress.filter(p => p.status === 'complete').length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2">
            <Brain className="w-4 h-4" />
            Smart Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Smart Image Recognition Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Features Info */}
          <Card className="bg-gradient-to-r from-purple-500/5 to-emerald-500/5 border border-purple-200/20 p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI-Powered Recognition
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-emerald-500" />
                  <span>Auto-detects garment types</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>Recognizes orientations</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>Generates proper filenames</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-purple-400 bg-purple-500/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-purple-300 hover:bg-purple-500/2'
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
              disabled={isProcessing}
            />
            
            <div className="space-y-4">
              <div className={`transition-all duration-200 ${isDragging ? 'scale-110' : ''}`}>
                <Brain className={`w-16 h-16 mx-auto ${isDragging ? 'text-purple-500' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop your images for AI analysis' : 'Upload images for smart recognition'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  AI will automatically detect garment types and orientations
                </p>
              </div>
            </div>
          </div>

          {/* Recognition Results */}
          {uploadProgress.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  Recognition Results ({completedCount}/{uploadProgress.length})
                </h4>
                {!isProcessing && uploadProgress.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setUploadProgress([])}>
                    Clear
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {uploadProgress.map((item, index) => (
                    <Card key={index} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusIcon(item.status)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-mono truncate">{item.filename}</p>
                            {item.recognition && (
                              <p className="text-xs text-muted-foreground">
                                → {item.recognition.suggestedFilename}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      {(item.status === 'uploading' || item.status === 'analyzing') && (
                        <Progress value={item.progress} className="h-2" />
                      )}
                      
                      {item.recognition && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline">{item.recognition.garmentType}</Badge>
                            <span className="text-muted-foreground">View:</span>
                            <Badge variant="outline">{item.recognition.orientation}</Badge>
                            <span className="text-muted-foreground">Confidence:</span>
                            <Badge variant="secondary">{Math.round(item.recognition.confidence * 100)}%</Badge>
                          </div>
                          {item.recognition.reasoning.length > 0 && (
                            <div className="bg-muted/30 rounded p-2">
                              <p className="text-xs font-medium mb-1">AI Reasoning:</p>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {item.recognition.reasoning.map((reason, i) => (
                                  <li key={i}>• {reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {item.error && (
                        <div className="flex items-start gap-2 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{item.error}</span>
                        </div>
                      )}
                    </Card>
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
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            {recognizedCount > 0 && (
              <Button 
                onClick={handleUpload}
                disabled={isProcessing || recognizedCount === 0}
                className="flex-1 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Brain className="w-4 h-4 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {recognizedCount} Images
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};