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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="glass-card border-0">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Welcome to Manana</CardTitle>
              <p className="text-muted-foreground">
                Sign in to access your profile and start creating amazing designs
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                onClick={() => router.push('/auth')}
              >
                Get Started
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    onClick={() => router.push('/auth')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3 text-center">What you'll get:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Palette className="h-3 w-3 text-primary" />
                    </div>
                    <span>AI-powered design tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                    <span>Community features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-3 w-3 text-primary" />
                    </div>
                    <span>Export your designs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
              
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