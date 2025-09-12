import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, Check, Copy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getGarmentCategories, 
  upsertTemplateImage, 
  type GarmentCategory, 
  type GarmentView 
} from '@/lib/garmentTemplates';
import { supabase } from '@/integrations/supabase/client';

interface StudioTemplateUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadState {
  file: File | null;
  category: string;
  color: string;
  view: GarmentView;
  dimensions: { width: number; height: number } | null;
  progress: number;
  success: boolean;
  publicUrl?: string;
}

const GARMENT_VIEWS: GarmentView[] = ['front', 'back', 'left', 'right'];
const COMMON_COLORS = ['white', 'black', 'navy', 'heather', 'red', 'blue', 'green'];

export function StudioTemplateUploader({ open, onOpenChange }: StudioTemplateUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<GarmentCategory[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    category: '',
    color: 'white',
    view: 'front',
    dimensions: null,
    progress: 0,
    success: false,
  });

  // Load categories on mount
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const cats = await getGarmentCategories();
      setCategories(cats);
      if (cats.length > 0 && !uploadState.category) {
        setUploadState(prev => ({ ...prev, category: cats[0].slug }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setUploadState(prev => ({
        ...prev,
        file,
        dimensions: { width: img.width, height: img.height },
        success: false,
        publicUrl: undefined,
      }));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.category || !uploadState.dimensions) {
      return;
    }

    setIsUploading(true);
    setUploadState(prev => ({ ...prev, progress: 0 }));

    try {
      // Generate storage path
      const timestamp = Date.now();
      const fileName = `${uploadState.category}-${uploadState.color}-${uploadState.view}-${timestamp}.${uploadState.file.name.split('.').pop()}`;
      const storagePath = `${uploadState.category}/${uploadState.color}/${uploadState.view}/${fileName}`;

      // Upload to Supabase Storage
      setUploadState(prev => ({ ...prev, progress: 30 }));
      
      const { error: uploadError } = await supabase.storage
        .from('design-templates')
        .upload(storagePath, uploadState.file, { upsert: true });

      if (uploadError) throw uploadError;

      // Upsert metadata via edge function
      setUploadState(prev => ({ ...prev, progress: 70 }));
      
      const result = await upsertTemplateImage({
        category_slug: uploadState.category,
        view: uploadState.view,
        color_slug: uploadState.color,
        storage_path: storagePath,
        width_px: uploadState.dimensions.width,
        height_px: uploadState.dimensions.height,
        dpi: 300,
      });

      // Get public URL
      const { data } = supabase.storage
        .from('design-templates')
        .getPublicUrl(storagePath);

      setUploadState(prev => ({
        ...prev,
        progress: 100,
        success: true,
        publicUrl: data.publicUrl,
      }));

      toast({
        title: "Upload successful",
        description: "Template image uploaded successfully!",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyUrl = () => {
    if (uploadState.publicUrl) {
      navigator.clipboard.writeText(uploadState.publicUrl);
      toast({
        title: "URL copied",
        description: "Public URL copied to clipboard",
      });
    }
  };

  const reset = () => {
    setUploadState({
      file: null,
      category: categories[0]?.slug || '',
      color: 'white',
      view: 'front',
      dimensions: null,
      progress: 0,
      success: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Template
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={uploadState.category} 
                onValueChange={(value) => setUploadState(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="view">View</Label>
              <Select 
                value={uploadState.view} 
                onValueChange={(value) => setUploadState(prev => ({ ...prev, view: value as GarmentView }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GARMENT_VIEWS.map((view) => (
                    <SelectItem key={view} value={view}>
                      {view}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="color">Color</Label>
              <Select 
                value={uploadState.color} 
                onValueChange={(value) => setUploadState(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadState.success ? (
              <div className="space-y-2">
                <Check className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium">Upload successful!</p>
                <div className="flex items-center gap-2 text-xs">
                  <Input
                    value={uploadState.publicUrl || ''}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : uploadState.file ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{uploadState.file.name}</p>
                {uploadState.dimensions && (
                  <p className="text-xs text-muted-foreground">
                    {uploadState.dimensions.width} × {uploadState.dimensions.height}px
                  </p>
                )}
                {isUploading && (
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm">Drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 20MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {!uploadState.file && !uploadState.success && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Browse Files
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {uploadState.success ? (
              <Button onClick={reset} className="flex-1">
                Upload Another
              </Button>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={!uploadState.file || !uploadState.category || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Template'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}