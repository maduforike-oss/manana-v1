import { useRef, useState } from 'react';
import { Camera, Upload, User, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadAvatar, uploadCover } from '@/lib/profile';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

interface QuickImageUploadProps {
  avatarUrl?: string;
  coverUrl?: string;
  displayName?: string;
}

export function QuickImageUpload({ avatarUrl, coverUrl, displayName }: QuickImageUploadProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [coverPreview, setCoverPreview] = useState(coverUrl);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    if (!file) return;

    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `${type === 'avatar' ? 'Avatar' : 'Cover'} image must be under ${maxSize / (1024 * 1024)}MB`,
        variant: 'destructive'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    const setLoading = type === 'avatar' ? setIsUploadingAvatar : setIsUploadingCover;
    const setPreview = type === 'avatar' ? setAvatarPreview : setCoverPreview;
    
    setLoading(true);
    
    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Supabase
      const uploadFn = type === 'avatar' ? uploadAvatar : uploadCover;
      const publicUrl = await uploadFn(file);
      
      // Update preview with actual URL
      setPreview(publicUrl);
      await refreshProfile();
      
      toast({
        title: 'Upload successful',
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover image'} updated`
      });
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Profile Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Cover Image</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
            </Button>
          </div>
          
          <div 
            className="relative w-full h-32 rounded-lg border-2 border-dashed border-border/50 hover:border-border cursor-pointer overflow-hidden group"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <img 
                src={coverPreview} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Add a cover image</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload('cover', file);
            }}
          />
        </div>

        {/* Avatar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Profile Picture</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <User className="w-4 h-4 mr-2" />
              {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl">
                  {displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Click to upload a new profile picture
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
          
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload('avatar', file);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}