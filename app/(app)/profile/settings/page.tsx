"use client"

import { useState, useEffect } from "react";
import { User, Camera, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  uploadAvatar, 
  uploadCover, 
  checkUsernameAvailability,
  updateMyProfile 
} from '@/lib/profile';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { getErrorMessage } from '@/lib/errors';
import BackButton from '@/components/BackButton';
import { useProfileStore } from '@/store/useProfileStore';
import { PrivacySettingsSection } from '@/components/profile/PrivacySettingsSection';

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const { profile, loading, error, load, refresh, patch } = useProfileStore();
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    social_instagram: "",
    social_twitter: "",
  });

  const [preferences, setPreferences] = useState({
    show_email: false,
    show_socials: true,
    discoverable: true,
  });

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    checking: false,
    available: null,
    error: null,
  });

  useEffect(() => {
    if (!profile) {
      load();
    } else {
      setFormData({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        social_instagram: profile.social_instagram || "",
        social_twitter: profile.social_twitter || "",
      });
      setPreferences({
        show_email: profile.preferences?.show_email !== false,
        show_socials: profile.preferences?.show_socials !== false,
        discoverable: profile.preferences?.discoverable !== false,
      });
    }
  }, [profile, load]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Special handling for username
    if (field === 'username') {
      const sanitized = sanitizeUsername(value);
      if (sanitized !== value) {
        setFormData(prev => ({ ...prev, username: sanitized }));
      }
      
      if (sanitized && sanitized !== profile?.username) {
        checkUsernameDebounced(sanitized);
      } else {
        setUsernameStatus({ checking: false, available: null, error: null });
      }
    }
  };

  const checkUsernameDebounced = (() => {
    let timeout: NodeJS.Timeout;
    return (username: string) => {
      clearTimeout(timeout);
      setUsernameStatus({ checking: true, available: null, error: null });
      
      timeout = setTimeout(async () => {
        const validation = validateUsername(username);
        if (!validation.isValid) {
          setUsernameStatus({ 
            checking: false, 
            available: false, 
            error: validation.error || 'Invalid username' 
          });
          return;
        }

        try {
          const available = await checkUsernameAvailability(username);
          setUsernameStatus({ 
            checking: false, 
            available, 
            error: available ? null : 'Username is already taken' 
          });
        } catch (error) {
          setUsernameStatus({ 
            checking: false, 
            available: false, 
            error: getErrorMessage(error) 
          });
        }
      }, 500);
    };
  })();

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      
      const uploadFunction = type === 'avatar' ? uploadAvatar : uploadCover;
      const publicUrl = await uploadFunction(file);
      
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
      await updateMyProfile({ [updateField]: publicUrl });
      
      // Refresh the store to get updated data
      await refresh();
      
      toast({
        title: "Success",
        description: `${type === 'avatar' ? 'Avatar' : 'Cover photo'} updated successfully`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate username if changed
    if (formData.username !== profile?.username) {
      if (usernameStatus.checking || !usernameStatus.available) {
        toast({
          title: "Invalid Username",
          description: usernameStatus.error || "Please choose a valid username",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setSaving(true);
      
      await patch({
        ...formData,
        preferences: preferences,
      });

      setHasChanges(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <BackButton fallback="/profile" />
        <div className="text-destructive">Error: {error}</div>
        <Button variant="outline" onClick={refresh}>Retry</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton fallback="/profile" />
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              {hasChanges && (
                <Badge variant="outline" className="mt-1">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-gradient-to-r from-primary to-secondary text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Cover Upload */}
            <div className="space-y-4">
              {/* Cover Photo */}
              <div className="relative h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                {profile?.cover_url && (
                  <img 
                    src={profile.cover_url} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('cover', file);
                      }}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={uploading.cover}
                      asChild
                    >
                      <span>
                        {uploading.cover ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        {uploading.cover ? 'Uploading...' : 'Change Cover'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                        {(formData.display_name || formData.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('avatar', file);
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      disabled={uploading.avatar}
                      asChild
                    >
                      <span className="w-8 h-8 p-0">
                        {uploading.avatar ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                <div>
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to help people recognize you
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleFormChange('display_name', e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    placeholder="username"
                    className={
                      usernameStatus.error ? 'border-destructive' : 
                      usernameStatus.available ? 'border-green-500' : ''
                    }
                  />
                  {usernameStatus.checking && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin" />
                  )}
                </div>
                {usernameStatus.error && (
                  <p className="text-sm text-destructive">{usernameStatus.error}</p>
                )}
                {usernameStatus.available && (
                  <p className="text-sm text-green-600">Username is available</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleFormChange('bio', e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleFormChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                  type="url"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram</Label>
                <Input
                  id="social_instagram"
                  value={formData.social_instagram}
                  onChange={(e) => handleFormChange('social_instagram', e.target.value)}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter</Label>
                <Input
                  id="social_twitter"
                  value={formData.social_twitter}
                  onChange={(e) => handleFormChange('social_twitter', e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Email</Label>
                <p className="text-sm text-muted-foreground">Display your email address on your profile</p>
              </div>
              <Switch 
                checked={preferences.show_email}
                onCheckedChange={(checked) => handlePreferenceChange('show_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Social Links</Label>
                <p className="text-sm text-muted-foreground">Display your social media links on your profile</p>
              </div>
              <Switch 
                checked={preferences.show_socials}
                onCheckedChange={(checked) => handlePreferenceChange('show_socials', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Profile Discoverable</Label>
                <p className="text-sm text-muted-foreground">Allow others to find your profile in search</p>
              </div>
              <Switch 
                checked={preferences.discoverable}
                onCheckedChange={(checked) => handlePreferenceChange('discoverable', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <PrivacySettingsSection />
      </div>
    </div>
  );
}