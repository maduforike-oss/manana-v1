"use client"

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Settings, Crown, Package, Users, MapPin, Globe, LogOut, Trash2, ArrowRight, Palette, User as UserIcon, Check, X, AlertCircle, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMyProfile, updateMyProfile, uploadAvatar, uploadCover, checkUsernameAvailability, type Profile, getProfileMetrics, type ProfileMetrics } from '@/lib/profile';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { getErrorMessage } from '@/lib/errors';
import { ProfileTags } from '@/components/ProfileTags';
import { SocialLinks } from '@/components/SocialLinks';
import { useAuth } from '@/lib/auth-context';
import SignOutButton from '@/components/auth/SignOutButton';
import { cn } from '@/lib/utils';

// tiny debounce hook
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

interface FormData {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  social_instagram: string;
  social_twitter: string;
}

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Form state
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
  const [hasChanges, setHasChanges] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const usernameTimeoutRef = useRef<NodeJS.Timeout>();
  const debouncedUsername = useDebounced(formData.username, 450);
  const mounted = useRef(false);

  // Load profile data and metrics
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
        
        if (profileData) {
          setFormData({
            display_name: profileData.display_name || '',
            username: profileData.username || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            website: profileData.website || '',
            social_instagram: profileData.social_instagram || '',
            social_twitter: profileData.social_twitter || '',
          });
          setAvatarPreview(profileData.avatar_url || '');
          setCoverPreview(profileData.cover_url || '');
          
          // Load metrics
          const metricsData = await getProfileMetrics(profileData.id);
          setMetrics(metricsData);
        }
      } catch (error) {
        toast({
          title: "Error loading profile",
          description: getErrorMessage(error),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Username availability check
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!debouncedUsername || debouncedUsername === profile?.username) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    const validation = validateUsername(debouncedUsername);
    if (!validation.isValid) {
      setUsernameStatus('invalid');
      setUsernameError(validation.error || 'Invalid username');
      return;
    }

    setUsernameStatus('checking');
    let cancelled = false;
    
    (async () => {
      try {
        const isAvailable = await checkUsernameAvailability(debouncedUsername);
        if (!cancelled) {
          setUsernameStatus(isAvailable ? 'available' : 'taken');
          setUsernameError(isAvailable ? '' : 'Username is already taken');
        }
      } catch (error) {
        if (!cancelled) {
          setUsernameStatus('invalid');
          setUsernameError('Error checking username availability');
        }
      }
    })();
    
    return () => { cancelled = true; };
  }, [debouncedUsername, profile]);

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
        // checkUsername will be handled by useEffect
      }, 500);
    }
  };

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    if (!file) return;

    // Validate file size and type
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

    setSaving(true);
    try {
      await updateMyProfile(formData);
      const updatedProfile = await getMyProfile();
      setProfile(updatedProfile);
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
      setSaving(false);
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
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const handleSignOut = async () => {
    try {
      const { signOut } = useAuth();
      await signOut();
      toast({ title: "Signed Out", description: "You have been signed out successfully" });
      router.push('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "This feature will be available soon",
      variant: "destructive"
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Welcome to Manana</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Start Your Design Journey
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join thousands of creators using AI-powered tools to design amazing apparel. 
                  Create, share, and bring your ideas to life.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-fashion hover:shadow-xl"
                  onClick={() => router.push('/auth')}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/auth')}
                  className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  Sign In
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                No credit card required • Free to start
              </div>
            </div>

            {/* Right side - Features card */}
            <Card className="glass-effect border-0 shadow-fashion">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Premium Design Tools</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Everything you need to create professional designs
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <Palette className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">AI Design Studio</div>
                      <div className="text-xs text-muted-foreground">Create designs with advanced AI assistance</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mt-0.5">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Community Features</div>
                      <div className="text-xs text-muted-foreground">Share, discover, and collaborate with creators</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Export & Print</div>
                      <div className="text-xs text-muted-foreground">High-quality exports ready for production</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    onClick={() => router.push('/auth')}
                  >
                    Join Manana Today
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social proof section */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-6">Trusted by creators worldwide</p>
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-xs text-muted-foreground">Designs Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">5K+</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99%</div>
                <div className="text-xs text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="glass-effect border-0 text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Loading Profile...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Please wait while we load your profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = metrics ? (metrics.total_designs / 30) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/profile/settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Cover Image */}
        <Card>
          <div className="relative rounded-t-lg overflow-hidden border-b">
            <div className="aspect-[3/1] w-full bg-gradient-to-r from-primary/10 to-secondary/10">
              {coverPreview ? (
                <img 
                  src={coverPreview} 
                  alt="Cover" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No cover image</p>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change cover
            </Button>
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

          {/* Profile Header */}
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-background">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xl">
                    {formData.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
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
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.display_name || profile.username || 'Unnamed User'}
                    </h2>
                    {profile.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Basic Plan
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.total_designs || 0}</p>
                <p className="text-sm text-muted-foreground">Designs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.following || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
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
                      usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-destructive' : '',
                      usernameStatus === 'available' ? 'border-green-500' : ''
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {getUsernameStatusIcon()}
                  </div>
                </div>
                {usernameError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram</Label>
                <div className="relative">
                  <Input
                    id="social_instagram"
                    value={formData.social_instagram}
                    onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                    placeholder="username"
                    className="pl-8"
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
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    @
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || saving || (formData.username !== profile?.username && usernameStatus !== 'available' && !!formData.username)}
                className="min-w-[120px]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Design Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Design Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Designs Created</span>
              <span className="text-sm text-muted-foreground">
                {metrics?.total_designs || 0} / 30
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {30 - (metrics?.total_designs || 0)} designs remaining this month
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => router.push('/studio')}
              >
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-3" />
                  Create Design
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => router.push('/profile/followers')}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-3" />
                  Followers
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <SignOutButton className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-0 py-2 h-auto font-normal bg-transparent border-none flex items-center">
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </SignOutButton>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-0 py-2 h-auto font-normal"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}