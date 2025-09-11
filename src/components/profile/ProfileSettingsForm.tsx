'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { updateMyProfile, uploadAvatar, uploadCover, checkUsernameAvailability } from '@/lib/profile';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FormData {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  social_instagram: string;
  social_twitter: string;
}

export function ProfileSettingsForm() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    social_instagram: '',
    social_twitter: '',
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const usernameTimeoutRef = useRef<NodeJS.Timeout>();

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        social_instagram: profile.social_instagram || '',
        social_twitter: profile.social_twitter || '',
      });
      setAvatarPreview(profile.avatar_url || '');
      setCoverPreview(profile.cover_url || '');
    }
  }, [profile]);

  // Debounced username validation
  const checkUsername = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameStatus('invalid');
      setUsernameError(validation.error || 'Invalid username');
      return;
    }

    setUsernameStatus('checking');
    try {
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
      setUsernameError(isAvailable ? '' : 'Username is already taken');
    } catch (error) {
      setUsernameStatus('invalid');
      setUsernameError('Error checking username availability');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Special handling for username
    if (field === 'username') {
      const sanitized = sanitizeUsername(value);
      if (sanitized !== value) {
        setFormData(prev => ({ ...prev, username: sanitized }));
      }
      
      // Debounce username check
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsername(sanitized);
      }, 500);
    }
  };

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    if (!file) return;

    // Validate file size and type
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for cover
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

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarPreview(previewUrl);
      } else {
        setCoverPreview(previewUrl);
      }

      // Upload to Supabase
      const uploadFn = type === 'avatar' ? uploadAvatar : uploadCover;
      const publicUrl = await uploadFn(file);
      
      // Update preview with actual URL
      if (type === 'avatar') {
        setAvatarPreview(publicUrl);
      } else {
        setCoverPreview(publicUrl);
      }
      
      setHasChanges(true);
      toast({
        title: 'Upload successful',
        description: `${type === 'avatar' ? 'Avatar' : 'Cover'} image updated`
      });
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate username if it changed
    if (formData.username !== profile?.username && usernameStatus !== 'available' && formData.username) {
      toast({
        title: 'Cannot save',
        description: usernameError || 'Please choose a valid username',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateMyProfile(formData);
      await refreshProfile();
      setHasChanges(false);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'taken':
      case 'invalid':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar and Cover */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
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
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Click to upload cover image</p>
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
            <p className="text-xs text-muted-foreground">Recommended: 1200x300px, max 10MB</p>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div 
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl">
                    {formData.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload new photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="your_username"
                  className={cn(
                    "pr-8",
                    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500' : '',
                    usernameStatus === 'available' ? 'border-green-500' : ''
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              {usernameError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {usernameError}
                </p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Username is available
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/200
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
                type="url"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="social_instagram">Instagram</Label>
              <div className="relative">
                <Input
                  id="social_instagram"
                  value={formData.social_instagram}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="username"
                  className="pl-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="social_twitter">Twitter/X</Label>
              <div className="relative">
                <Input
                  id="social_twitter"
                  value={formData.social_twitter}
                  onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                  placeholder="username"
                  className="pl-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving || (formData.username !== profile?.username && usernameStatus !== 'available' && !!formData.username)}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}