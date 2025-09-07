import { Settings, Palette, Package, Crown, LogOut, Trash2, Users, CreditCard, ArrowRight, MapPin, Globe, User } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FeaturedDesignsGallery } from '@/components/FeaturedDesignsGallery';
import { ProfileTags } from '@/components/ProfileTags';
import { SocialLinks } from '@/components/SocialLinks';

export const ProfilePage = () => {
  const { user, logout, setActiveTab } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock user data
  const mockUser = {
    name: 'Alex Designer',
    email: 'alex@example.com',
    bio: 'Passionate designer creating unique streetwear and minimalist graphics. Available for custom work.',
    location: 'London, UK',
    website: 'https://alexdesigner.com',
    specialties: ['Streetwear', 'Typography', 'Minimalist', 'Vintage', 'Custom Logos'],
    joinDate: '2024-01-01',
    plan: 'Basic',
    designsThisMonth: 12,
    maxDesigns: 30,
    totalDesigns: 47,
    totalOrders: 8,
    followers: 1247,
    following: 892,
    socialLinks: [
      { platform: 'website' as const, url: 'https://alexdesigner.com' },
      { platform: 'instagram' as const, url: 'https://instagram.com/alexdesigner' },
      { platform: 'twitter' as const, url: 'https://twitter.com/alexdesigner' },
    ],
    featuredDesigns: [
      { id: '1', name: 'Street Art Tee', thumbnail: '', garmentType: 'T-Shirt', likes: 234, views: 1024 },
      { id: '2', name: 'Minimal Logo Hoodie', thumbnail: '', garmentType: 'Hoodie', likes: 189, views: 876 },
      { id: '3', name: 'Vintage Band Tee', thumbnail: '', garmentType: 'T-Shirt', likes: 156, views: 642 },
      { id: '4', name: 'Custom Typography', thumbnail: '', garmentType: 'Tank Top', likes: 98, views: 432 },
    ],
  };

  const progressPercentage = (mockUser.designsThisMonth / mockUser.maxDesigns) * 100;

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

  const handleSignOut = () => {
    logout();
    toast({ title: "Signed Out", description: "You have been signed out successfully" });
  };

  const handleDeleteAccount = () => {
    toast({ 
      title: "Delete Account", 
      description: "Account deletion confirmation will appear here",
      variant: "destructive"
    });
  };

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
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">{mockUser.name}</h1>
                <p className="text-muted-foreground text-sm sm:text-base truncate">{mockUser.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {mockUser.bio && (
                <p className="text-sm text-foreground leading-relaxed">{mockUser.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {mockUser.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{mockUser.location}</span>
                  </div>
                )}
                {mockUser.website && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <a href={mockUser.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      Portfolio
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  {mockUser.plan} Plan
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(mockUser.joinDate).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2">
                <ProfileTags specialties={mockUser.specialties} maxDisplay={3} />
                <SocialLinks links={mockUser.socialLinks} />
              </div>
            </div>
          </div>

          {/* Mobile-optimized social metrics with larger touch targets */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 py-4 border-y border-border">
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={handleFollowers}
            >
              <p className="text-lg sm:text-2xl font-bold">{mockUser.followers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={handleFollowing}
            >
              <p className="text-lg sm:text-2xl font-bold">{mockUser.following.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 p-3 sm:px-4 sm:py-2 rounded-lg transition-colors min-h-[60px] sm:min-h-auto flex flex-col justify-center"
              onClick={() => setActiveTab('studio')}
            >
              <p className="text-lg sm:text-2xl font-bold">{mockUser.totalDesigns}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Designs</p>
            </div>
          </div>

          {/* Featured Designs with mobile spacing */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg mb-4">
            <FeaturedDesignsGallery designs={mockUser.featuredDesigns} maxDisplay={3} />
          </div>

          {/* Design Usage with mobile optimization */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Monthly Designs</span>
              <span className="text-sm text-muted-foreground">
                {mockUser.designsThisMonth} / {mockUser.maxDesigns}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {mockUser.maxDesigns - mockUser.designsThisMonth} designs remaining this month
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
            <p className="text-xl sm:text-2xl font-bold">{mockUser.totalDesigns}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Designs</p>
          </Card>
          
          <Card 
            className="p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow min-h-[100px] sm:min-h-auto flex flex-col justify-center" 
            onClick={() => setActiveTab('orders')}
          >
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{mockUser.totalOrders}</p>
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
                  <p className="text-lg font-bold">12/30</p>
                  <p className="text-xs text-muted-foreground">Designs used</p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly limit</span>
                <span>40% used</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">18 designs remaining this month</p>
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
            
            <Button onClick={handleUpgradePlan} className="w-full h-12 sm:h-10 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-shadow">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </Card>

        {/* Danger Zone with mobile touch optimization */}
        <Card className="border-destructive/50">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="p-3 sm:p-4 space-y-1">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-destructive hover:text-destructive h-12 sm:h-10">
              <LogOut className="w-4 h-4 mr-3" />
              <span className="text-sm sm:text-base">Sign Out</span>
            </Button>
            
            <Button variant="ghost" onClick={handleDeleteAccount} className="w-full justify-start text-destructive hover:text-destructive h-12 sm:h-10">
              <Trash2 className="w-4 h-4 mr-3" />
              <span className="text-sm sm:text-base">Delete Account</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};