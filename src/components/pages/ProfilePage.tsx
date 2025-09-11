import { useState, useEffect } from 'react';
import { Settings, Palette, Package, Crown, LogOut, Trash2, Users, CreditCard, ArrowRight, MapPin, Globe, User as UserIcon } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FeaturedDesignsGallery } from '@/components/FeaturedDesignsGallery';
import { ProfileTags } from '@/components/ProfileTags';
import { SocialLinks } from '@/components/SocialLinks';
import { useAuth } from '@/lib/auth-context';
import { getProfileMetrics, ProfileMetrics } from '@/lib/profile';
import SignOutButton from '@/components/auth/SignOutButton';

export const ProfilePage = () => {
  const { setActiveTab } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (user) {
        try {
          const data = await getProfileMetrics(user.id);
          setMetrics(data);
        } catch (error) {
          console.error('Error loading metrics:', error);
        }
      }
      setMetricsLoading(false);
    };
    
    loadMetrics();
  }, [user]);

  // Default data when no profile exists yet
  const displayData = {
    name: profile?.display_name || profile?.username || 'Anonymous User',
    email: user?.email || '',
    bio: profile?.bio || 'Welcome to Manana! Complete your profile to get started.',
    location: profile?.location || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url || '',
    specialties: ['New User'],
    joinDate: profile?.created_at || user?.created_at || new Date().toISOString(),
    plan: 'Basic',
    designsThisMonth: 0,
    maxDesigns: 30,
    totalDesigns: metrics?.total_designs || 0,
    totalOrders: 0,
    followers: metrics?.followers || 0,
    following: metrics?.following || 0,
    socialLinks: [
      ...(profile?.website ? [{ platform: 'website' as const, url: profile.website }] : []),
      ...(profile?.social_instagram ? [{ platform: 'instagram' as const, url: `https://instagram.com/${profile.social_instagram}` }] : []),
      ...(profile?.social_twitter ? [{ platform: 'twitter' as const, url: `https://twitter.com/${profile.social_twitter}` }] : []),
    ],
    featuredDesigns: [
      { id: '1', name: 'Get started in Studio', thumbnail: '', garmentType: 'Create your first design', likes: 0, views: 0 },
    ],
  };

  const progressPercentage = (displayData.designsThisMonth / displayData.maxDesigns) * 100;

  const handleProfileSettings = () => {
    navigate('/profile/settings');
  };

  const handleUpgradePlan = () => {
    navigate('/profile/upgrade');
  };

  const handleFollowers = () => {
    navigate('/profile/followers?tab=followers');
  };

  const handleFollowing = () => {
    navigate('/profile/followers?tab=following');
  };

  const handleOrderHistory = () => {
    setActiveTab('orders');
  };

  const handleSignIn = () => {
    navigate('/auth/signin');
  };

  const handleDeleteAccount = () => {
    toast({ 
      title: "Delete Account", 
      description: "Account deletion confirmation will appear here",
      variant: "destructive"
    });
  };

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader title="Profile" subtitle="Sign in to view your profile" />
        <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl space-y-6">
          <Card className="p-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Manana</h2>
                <p className="text-muted-foreground mb-4">
                  Sign in to access your profile, designs, and account settings.
                </p>
              </div>
              <Button onClick={handleSignIn} className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white">
                Sign In
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why sign in?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span className="text-sm">Create and save your designs</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">Connect with the community</span>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm">Track your orders</span>
              </div>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-sm">Access premium features</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-auto modern-scroll">
      <BrandHeader 
        title="Profile" 
        subtitle="Manage your designs and account"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile/settings')}
          className="glass-effect border-border/20 min-h-[48px] min-w-[48px] rounded-2xl"
          aria-label="Profile settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <Card className="p-4 sm:p-6">
          {/* Mobile-optimized header layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 sm:w-16 sm:h-16">
                <AvatarImage src={displayData.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                  {displayData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">{displayData.name}</h1>
                <p className="text-muted-foreground text-sm sm:text-base truncate">{displayData.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {displayData.bio && (
                <p className="text-sm text-foreground leading-relaxed">{displayData.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {displayData.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{displayData.location}</span>
                  </div>
                )}
                {displayData.website && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <a href={displayData.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      Portfolio
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  {displayData.plan} Plan
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(displayData.joinDate).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2">
                <ProfileTags specialties={displayData.specialties} maxDisplay={3} />
                <SocialLinks links={displayData.socialLinks} />
              </div>
            </div>
          </div>

          {/* Mobile-optimized social metrics with larger touch targets */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 py-4 border-y border-border">
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={handleFollowers}
            >
              <p className="text-lg sm:text-2xl font-bold">
                {metricsLoading ? '...' : displayData.followers.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={handleFollowing}
            >
              <p className="text-lg sm:text-2xl font-bold">
                {metricsLoading ? '...' : displayData.following.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={() => setActiveTab('studio')}
            >
              <p className="text-lg sm:text-2xl font-bold">
                {metricsLoading ? '...' : displayData.totalDesigns}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Designs</p>
            </div>
          </div>

          {/* Featured Designs with mobile spacing */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg mb-4">
            <FeaturedDesignsGallery designs={displayData.featuredDesigns} maxDisplay={3} />
          </div>

          {/* Design Usage with mobile optimization */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Monthly Designs</span>
              <span className="text-sm text-muted-foreground">
                {displayData.designsThisMonth} / {displayData.maxDesigns}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {displayData.maxDesigns - displayData.designsThisMonth} designs remaining this month
            </p>
          </div>
        </Card>

        {/* Mobile-optimized stats with larger touch targets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card 
            className="p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow min-h-[100px] sm:min-h-auto flex flex-col justify-center" 
            onClick={() => setActiveTab('studio')}
          >
            <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">
              {metricsLoading ? '...' : displayData.totalDesigns}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Designs</p>
          </Card>
          
          <Card 
            className="p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow min-h-[100px] sm:min-h-auto flex flex-col justify-center" 
            onClick={() => setActiveTab('orders')}
          >
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{displayData.totalOrders}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Orders Placed</p>
          </Card>
        </div>

        {/* Account Settings with mobile touch optimization */}
        <Card>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Account Settings</h2>
          </div>
          
          <div className="p-3 sm:p-4 space-y-1">
            <Button variant="ghost" onClick={handleProfileSettings} className="w-full justify-between group h-12 sm:h-10 text-left">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-3" />
                <span className="text-sm sm:text-base">Profile Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            <Button variant="ghost" onClick={handleUpgradePlan} className="w-full justify-between group h-12 sm:h-10 text-left">
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-3" />
                <span className="text-sm sm:text-base">Upgrade Plan</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            <Button variant="ghost" onClick={handleOrderHistory} className="w-full justify-between group h-12 sm:h-10 text-left">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-3" />
                <span className="text-sm sm:text-base">Order History</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </Card>

        {/* Plan Information with mobile optimization */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 mb-4 sm:mb-6">
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
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{displayData.maxDesigns - displayData.designsThisMonth} designs remaining this month</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium">✓ All garment types</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium">✓ Studio tools</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium">✓ Community access</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium">✓ Basic support</p>
              </div>
            </div>
            
            <Button onClick={handleUpgradePlan} className="w-full h-12 sm:h-10 bg-gradient-to-r from-primary to-secondary text-white">
              Upgrade to Pro
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <SignOutButton className="w-full sm:w-auto px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </SignOutButton>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};