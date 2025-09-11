"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Settings, Crown, Package, Users, MapPin, Globe, LogOut, Trash2, ArrowRight, Palette, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getProfileMetrics, type ProfileMetrics } from '@/lib/profile';
import { getErrorMessage } from '@/lib/errors';
import { ProfileTags } from '@/components/ProfileTags';
import { SocialLinks } from '@/components/SocialLinks';
import { useAuth } from '@/lib/auth-context';
import SignOutButton from '@/components/auth/SignOutButton';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (profile?.id) {
        try {
          const metricsData = await getProfileMetrics(profile.id);
          setMetrics(metricsData);
        } catch (error) {
          toast({
            title: "Error loading metrics",
            description: getErrorMessage(error),
            variant: "destructive"
          });
        }
      }
      setLoading(false);
    };

    loadMetrics();
  }, [profile, toast]);

  const handleSignOut = async () => {
    try {
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
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
            <Card className="glass-card border-0 shadow-xl">
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
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="glass-card border-0 text-center">
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

  const progressPercentage = metrics ? (metrics.total_designs / 30) * 100 : 0; // Assuming 30 design limit

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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg mb-6">
          {profile.cover_url && (
            <img 
              src={profile.cover_url} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => router.push('/profile/settings')}
          >
            <Camera className="w-4 h-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="p-6 -mt-6 relative z-10">{/* ... keep existing code (all UI components) */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username || 'User'} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                    {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                variant="secondary"
                size="sm"
                className="absolute -bottom-2 -right-2"
                onClick={() => router.push('/profile/settings')}
              >
                <Camera className="w-3 h-3" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile.display_name || profile.username || 'Unnamed User'}
                  </h2>
                  {profile.username && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-sm mt-2 max-w-md">{profile.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="mt-3">
                    <SocialLinks 
                      links={[
                        profile.website && { platform: 'website' as const, url: profile.website },
                        profile.social_instagram && { platform: 'instagram' as const, url: `https://instagram.com/${profile.social_instagram}` },
                        profile.social_twitter && { platform: 'twitter' as const, url: `https://twitter.com/${profile.social_twitter}` },
                      ].filter(Boolean) as Array<{ platform: 'website' | 'instagram' | 'twitter' | 'linkedin'; url: string }>}
                    />
                  </div>
                </div>

                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Basic Plan
                </Badge>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
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
        </Card>

        {/* Design Usage */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Design Usage</h3>
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
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => router.push('/profile/settings')}
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-3" />
                  Profile Settings
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
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
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <h3 className="text-lg font-semibold mb-4 text-destructive">Account Actions</h3>
            <div className="space-y-2">
              <SignOutButton className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-0 py-2 h-auto font-normal bg-transparent border-none flex items-center">
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </SignOutButton>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}