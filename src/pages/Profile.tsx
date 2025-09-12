import { useState, useEffect, useMemo } from 'react';
import { Settings, Palette, Package, Crown, LogOut, Trash2, Users, CreditCard, ArrowRight, MapPin, Globe, User as UserIcon, Upload, ImagePlus } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FeaturedDesignsGallery } from '@/components/FeaturedDesignsGallery';
import { ProfileTags } from '@/components/ProfileTags';
import { SocialLinks } from '@/components/SocialLinks';
import { useAuth } from '@/lib/auth-context';
import { useProfileStore } from '@/store/useProfileStore';
import { uploadAvatar, uploadCover, checkUsernameAvailability } from '@/lib/profile';
import { getOrderStats } from '@/lib/orders';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { getErrorMessage } from '@/lib/errors';
import SignOutButton from '@/components/auth/SignOutButton';
import RequireAuth from '@/components/auth/RequireAuth';
import BackButton from '@/components/BackButton';

// Debounce hook
function useDebounced<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Form data interface
interface FormData {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  social_instagram: string;
  social_twitter: string;
}

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, load, patch, refresh } = useProfileStore();
  
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    social_instagram: '',
    social_twitter: ''
  });

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [hasChanges, setHasChanges] = useState(false);
  const [orderStats, setOrderStats] = useState({ total_orders: 0, total_spent: 0, pending_orders: 0 });

  const debouncedUsername = useDebounced(formData.username, 500);

  // Load profile data on mount
  useEffect(() => {
    if (!profile && user) {
      load();
    }
  }, [profile, user, load]);

  // Load order stats
  useEffect(() => {
    const loadOrderStats = async () => {
      try {
        const stats = await getOrderStats();
        setOrderStats(stats);
      } catch (error) {
        console.error('Failed to load order stats:', error);
      }
    };
    
    if (user) {
      loadOrderStats();
    }
  }, [user]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        social_instagram: profile.social_instagram || '',
        social_twitter: profile.social_twitter || ''
      });
    }
  }, [profile]);

  // Check username availability when it changes
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername === profile?.username) {
        setUsernameStatus({ checking: false, available: null, error: null });
        return;
      }

      const validation = validateUsername(debouncedUsername);
      if (!validation.isValid) {
        setUsernameStatus({ checking: false, available: false, error: validation.error || 'Invalid username' });
        return;
      }

      setUsernameStatus({ checking: true, available: null, error: null });
      
      try {
        const available = await checkUsernameAvailability(debouncedUsername);
        setUsernameStatus({ checking: false, available, error: null });
      } catch (error) {
        setUsernameStatus({ checking: false, available: false, error: getErrorMessage(error) });
      }
    };

    checkUsername();
  }, [debouncedUsername, profile?.username]);

  // Track form changes
  useEffect(() => {
    if (!profile) return;
    
    const hasFormChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof FormData];
      const profileValue = profile[key as keyof typeof profile] || '';
      return formValue !== profileValue;
    });
    
    setHasChanges(hasFormChanges);
  }, [formData, profile]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'username') {
      value = sanitizeUsername(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      let uploadResult;
      if (type === 'avatar') {
        uploadResult = await uploadAvatar(file);
      } else {
        uploadResult = await uploadCover(file);
      }

      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Avatar' : 'Cover photo'} updated successfully`
      });

      // Refresh profile to get updated URL
      await refresh();
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      if (type === 'avatar') setAvatarFile(null);
      if (type === 'cover') setCoverFile(null);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate username if changed
    if (formData.username !== profile?.username) {
      const validation = validateUsername(formData.username);
      if (!validation.isValid) {
        toast({
          title: 'Invalid Username',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }

      if (usernameStatus.available === false) {
        toast({
          title: 'Username Taken',
          description: 'This username is already taken. Please choose another.',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      await patch(formData);
      setHasChanges(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  };

  // Display data with defaults
  const displayData = useMemo(() => ({
    name: profile?.display_name || profile?.username || 'Anonymous User',
    email: user?.email || '',
    bio: profile?.bio || 'Welcome to Manana! Complete your profile to get started.',
    location: profile?.location || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url || '',
    cover_url: profile?.cover_url || '',
    specialties: ['Designer'],
    joinDate: profile?.created_at || user?.created_at || new Date().toISOString(),
    plan: 'Basic',
    designsThisMonth: 2,
    maxDesigns: 30,
    totalDesigns: 5,
    totalOrders: orderStats.total_orders,
    followers: 0,
    following: 0,
    socialLinks: [
      ...(profile?.website ? [{ platform: 'website' as const, url: profile.website }] : []),
      ...(profile?.social_instagram ? [{ platform: 'instagram' as const, url: `https://instagram.com/${profile.social_instagram}` }] : []),
      ...(profile?.social_twitter ? [{ platform: 'twitter' as const, url: `https://twitter.com/${profile.social_twitter}` }] : []),
    ],
    featuredDesigns: [
      { id: '1', name: 'Create your first design', thumbnail: '', garmentType: 'Get started in Studio', likes: 0, views: 0 },
    ],
  }), [profile, user, orderStats]);

  const progressPercentage = (displayData.designsThisMonth / displayData.maxDesigns) * 100;

  if (loading && !profile) {
    return (
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader title="Profile" subtitle="Loading..." />
        <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl">
          <Card className="p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-3 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader title="Profile" subtitle="Error loading profile" />
        <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl">
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader 
          title="Profile" 
          subtitle="Manage your profile and settings"
        >
          <div className="flex items-center gap-2">
            <BackButton fallback="/" />
            <Button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="h-12 px-6 bg-gradient-to-r from-primary to-secondary text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </BrandHeader>

        <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl space-y-4 sm:space-y-6">
          {/* Profile Header with Edit */}
          <Card className="p-4 sm:p-6">
            {/* Cover Photo */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mb-6 overflow-hidden">
              {displayData.cover_url && (
                <img 
                  src={displayData.cover_url} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      handleImageUpload('cover', file);
                    }
                  }}
                  className="hidden"
                  id="cover-upload"
                />
                <label htmlFor="cover-upload">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                    disabled={uploading.cover}
                    asChild
                  >
                    <span>
                      {uploading.cover ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <ImagePlus className="w-4 h-4" />
                      )}
                      Cover
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={displayData.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                    {displayData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      handleImageUpload('avatar', file);
                    }
                  }}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-1 -right-1 cursor-pointer rounded-full w-8 h-8 p-0"
                    disabled={uploading.avatar}
                    asChild
                  >
                    <span>
                      {uploading.avatar ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="yourusername"
                    />
                    {usernameStatus.checking && (
                      <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
                    )}
                    {usernameStatus.available === true && debouncedUsername !== profile?.username && (
                      <p className="text-xs text-green-600 mt-1">✓ Username available</p>
                    )}
                    {usernameStatus.available === false && (
                      <p className="text-xs text-destructive mt-1">✗ {usernameStatus.error || 'Username not available'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.social_instagram}
                      onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.social_twitter}
                      onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Preview */}
            {displayData.socialLinks.length > 0 && (
              <div className="mb-4">
                <SocialLinks links={displayData.socialLinks} />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold">{displayData.followers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold">{displayData.following}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold">{displayData.totalDesigns}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Designs</p>
              </div>
            </div>

            <div className="mt-4">
              <FeaturedDesignsGallery designs={displayData.featuredDesigns} maxDisplay={3} />
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card 
              className="p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => navigate('/studio')}
            >
              <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">{displayData.totalDesigns}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Designs</p>
            </Card>
            
            <Card 
              className="p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => navigate('/orders')}
            >
              <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">{displayData.totalOrders}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Orders Placed</p>
            </Card>
          </div>

          {/* Plan Information */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Your Plan
                </h2>
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Basic Plan</h3>
                  <p className="text-xl sm:text-2xl font-bold text-primary">£10.99<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                  <p className="text-sm text-muted-foreground mt-1">Renews on Feb 15, 2025</p>
                </div>
                
                <div className="text-center sm:text-right">
                  <div className="bg-background rounded-lg p-3 border inline-block">
                    <p className="text-lg font-bold">{displayData.designsThisMonth}/{displayData.maxDesigns}</p>
                    <p className="text-xs text-muted-foreground">Designs used</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly limit</span>
                  <span>{Math.round(progressPercentage)}% used</span>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">{displayData.maxDesigns - displayData.designsThisMonth} designs remaining this month</p>
              </div>
              
              <Button 
                onClick={() => navigate('/profile/upgrade')} 
                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </Card>

          {/* Account Actions */}
          <Card>
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Account Actions</h2>
            </div>
            
            <div className="p-3 sm:p-4 space-y-1">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/profile/followers')} 
                className="w-full justify-between group h-12 sm:h-10 text-left"
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-3" />
                  <span className="text-sm sm:text-base">Followers & Following</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              
              <div className="border-t border-border my-2"></div>
              
              <SignOutButton className="w-full justify-start h-12 sm:h-10 text-left">
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </SignOutButton>
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  toast({
                    title: "Delete Account",
                    description: "Account deletion feature coming soon",
                    variant: "destructive"
                  });
                }}
                className="w-full justify-start text-destructive hover:text-destructive h-12 sm:h-10 text-left"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}