import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, Video, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPostMedia } from '@/lib/community';
import { toast } from 'sonner';

interface MediaUploadProps {
  onMediaUploaded: (url: string, type: 'image' | 'video') => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  postId?: string;
  className?: string;
}

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'video';
  uploading: boolean;
  progress: number;
  error?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUploaded,
  onError,
  maxFiles = 10,
  postId,
  className
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = 'image/*,video/*';
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const handleFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large (max 100MB)`);
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of validFiles) {
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const fileUrl = URL.createObjectURL(file);
      
      const uploadedFile: UploadedFile = {
        file,
        url: fileUrl,
        type: fileType,
        uploading: true,
        progress: 0
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file && f.progress < 90 
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 200);

        const { data: uploadedUrl, error } = await uploadPostMedia(file, postId);

        clearInterval(progressInterval);

        if (error) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, uploading: false, error, progress: 0 }
                : f
            )
          );
          onError?.(error);
          toast.error(`Failed to upload ${file.name}: ${error}`);
        } else if (uploadedUrl) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, uploading: false, progress: 100, url: uploadedUrl }
                : f
            )
          );
          onMediaUploaded(uploadedUrl, fileType);
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, uploading: false, error: 'Upload failed', progress: 0 }
              : f
          )
        );
        onError?.('Upload failed');
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
    URL.revokeObjectURL(fileToRemove.url);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Images and videos up to 100MB each (max {maxFiles} files)
            </p>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden bg-muted/30">
                {uploadedFile.type === 'image' ? (
                  <div className="relative aspect-square">
                    <img
                      src={uploadedFile.url}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="bg-background/80 rounded-full p-1">
                        <Image className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square bg-muted/50 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute top-2 left-2">
                      <div className="bg-background/80 rounded-full p-1">
                        <Video className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {uploadedFile.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-16">
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  </div>
                )}

                {/* Error State */}
                {uploadedFile.error && (
                  <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-1" />
                      <p className="text-xs text-destructive">Failed</p>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadedFile);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Card>

              {/* File Name */}
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {uploadedFile.file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};