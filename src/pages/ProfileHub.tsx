import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Crown, 
  Eye, 
  TrendingUp, 
  Users, 
  Package,
  ArrowRight,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  ExternalLink,
  Edit3,
  Shield,
  CreditCard
} from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { useProfileStore } from '@/store/useProfileStore';
import { getOrderStats } from '@/lib/orders';
import { getProfileMetrics } from '@/lib/profile';
import RequireAuth from '@/components/auth/RequireAuth';
import { Logo } from '@/components/brand/Logo';
import { ProfileInfoSection } from '@/components/profile/ProfileInfoSection';
import { QuickImageUpload } from '@/components/profile/QuickImageUpload';

interface OrderStats {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
}

interface UserMetrics {
  total_designs: number;
  followers: number;
  following: number;
}

export default function ProfileHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, load } = useProfileStore();
  const [orderStats, setOrderStats] = useState<OrderStats>({ 
    total_orders: 0, 
    total_spent: 0, 
    pending_orders: 0 
  });
  const [metrics, setMetrics] = useState<UserMetrics>({ 
    total_designs: 0, 
    followers: 0, 
    following: 0 
  });

  // Load profile and stats
  useEffect(() => {
    if (!profile && user) {
      load();
    }
  }, [profile, user, load]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      try {
        const [stats, userMetrics] = await Promise.all([
          getOrderStats(),
          getProfileMetrics(user.id)
        ]);
        setOrderStats(stats);
        if (userMetrics) {
          setMetrics({
            total_designs: userMetrics.total_designs || 0,
            followers: userMetrics.followers || 0,
            following: userMetrics.following || 0
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  const displayName = profile?.display_name || profile?.username || 'Anonymous User';
  const avatarUrl = profile?.avatar_url || '';
  const bio = profile?.bio || 'Complete your profile to let others know more about you.';
  const isProfileIncomplete = !profile?.display_name || !profile?.bio || !profile?.avatar_url;

  // Mock plan data - replace with actual subscription data later
  const currentPlan = 'Basic';
  const designsThisMonth = metrics.total_designs;
  const maxDesigns = 30;
  const progressPercentage = Math.min((designsThisMonth / maxDesigns) * 100, 100);

  if (loading && !profile) {
    return (
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader title="Profile Hub" subtitle="Loading..." />
        <div className="container mx-auto py-6 px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="h-full bg-background overflow-auto modern-scroll">
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Logo size={28} showWordmark={false} />
              <div>
                <h1 className="text-2xl font-bold">Profile Hub</h1>
                <p className="text-muted-foreground">Manage your profile and account</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
          {/* Profile Information Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/u/${profile?.username || user?.id}`)}
                disabled={!profile?.username}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              <ProfileInfoSection
                title="Display Name"
                value={profile?.display_name || ''}
                field="display_name"
                placeholder="Your display name"
              />
              
              <ProfileInfoSection
                title="Username"
                value={profile?.username || ''}
                field="username"
                placeholder="your_username"
              />
              
              <ProfileInfoSection
                title="Bio"
                value={profile?.bio || ''}
                field="bio"
                placeholder="Tell people about yourself..."
                isTextarea={true}
                maxLength={200}
              />
            </div>

            {isProfileIncomplete && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  Your profile is incomplete. Add a display name, bio, and profile picture to improve your visibility.
                </p>
              </div>
            )}
          </div>

          {/* Quick Image Upload */}
          <QuickImageUpload
            avatarUrl={avatarUrl}
            coverUrl={profile?.cover_url || ''}
            displayName={displayName}
          />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile/edit')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Edit3 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Edit Profile</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Update your details, photos, and social links
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <span>Customize profile</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile/upgrade')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold">Upgrade Plan</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Current: {currentPlan} • Unlock more features
                </p>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <span>Explore plans</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile/settings')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="font-semibold">Account Settings</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Privacy, security, and data management
                </p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                  <span>Manage account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Designs this month</span>
                    <span className="font-medium">{designsThisMonth} / {maxDesigns}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {maxDesigns - designsThisMonth} designs remaining
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{metrics.total_designs}</p>
                    <p className="text-xs text-muted-foreground">Total Designs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{metrics.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4" disabled>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                  <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Profile viewed {metrics.followers > 0 ? '12 times' : '0 times'} this week</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">{orderStats.total_orders} total orders placed</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm">Account created {new Date(profile?.created_at || user?.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/profile/followers')}>
                  <Users className="w-4 h-4 mr-2" />
                  View Followers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Billing & Subscription (Ready for Stripe) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan: {currentPlan}</p>
                  <p className="text-muted-foreground text-sm">
                    {currentPlan === 'Basic' ? 'Free plan with basic features' : 'Premium features unlocked'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </Button>
                  <Button size="sm" onClick={() => navigate('/profile/upgrade')}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}