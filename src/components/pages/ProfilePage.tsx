import { Settings, Palette, Package, Crown, LogOut, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/useToast';

export const ProfilePage = () => {
  const { user, logout, setActiveTab } = useAppStore();
  const { toast } = useToast();

  // Mock user data
  const mockUser = {
    name: 'Alex Designer',
    email: 'alex@example.com',
    joinDate: '2024-01-01',
    plan: 'Basic',
    designsThisMonth: 12,
    maxDesigns: 30,
    totalDesigns: 47,
    totalOrders: 8,
    followers: 1247,
    following: 892,
  };

  const progressPercentage = (mockUser.designsThisMonth / mockUser.maxDesigns) * 100;

  const handleProfileSettings = () => {
    toast({ title: "Profile Settings", description: "Profile settings will open here" });
  };

  const handleUpgradePlan = () => {
    toast({ title: "Upgrade Plan", description: "Plan upgrade page will open here" });
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
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                AD
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{mockUser.name}</h1>
              <p className="text-muted-foreground">{mockUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  {mockUser.plan} Plan
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since {new Date(mockUser.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Social Metrics */}
          <div className="flex justify-center gap-8 mb-4 py-4 border-y border-border">
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 px-4 py-2 rounded-lg transition-colors"
              onClick={() => toast({ title: "Followers", description: "Followers list will open here" })}
            >
              <p className="text-2xl font-bold">{mockUser.followers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 px-4 py-2 rounded-lg transition-colors"
              onClick={() => toast({ title: "Following", description: "Following list will open here" })}
            >
              <p className="text-2xl font-bold">{mockUser.following.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-muted/50 px-4 py-2 rounded-lg transition-colors"
              onClick={() => setActiveTab('studio')}
            >
              <p className="text-2xl font-bold">{mockUser.totalDesigns}</p>
              <p className="text-sm text-muted-foreground">Designs</p>
            </div>
          </div>

          {/* Design Usage */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Monthly Designs</span>
              <span className="text-sm text-muted-foreground">
                {mockUser.designsThisMonth} / {mockUser.maxDesigns}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {mockUser.maxDesigns - mockUser.designsThisMonth} designs remaining this month
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card 
            className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => setActiveTab('studio')}
          >
            <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{mockUser.totalDesigns}</p>
            <p className="text-sm text-muted-foreground">Total Designs</p>
          </Card>
          
          <Card 
            className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => setActiveTab('orders')}
          >
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">{mockUser.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Orders Placed</p>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Account Settings</h2>
          </div>
          
          <div className="p-4 space-y-2">
            <Button variant="ghost" onClick={handleProfileSettings} className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </Button>
            
            <Button variant="ghost" onClick={handleUpgradePlan} className="w-full justify-start">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            
            <Button variant="ghost" onClick={handleOrderHistory} className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Order History
            </Button>
          </div>
        </Card>

        {/* Plan Information */}
        <Card className="mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Your Plan</h2>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Basic Plan</h3>
                <p className="text-sm text-muted-foreground">£10.99/month</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            
            <ul className="text-sm space-y-1 mb-4">
              <li>• 30 designs per month</li>
              <li>• All garment types</li>
              <li>• Studio tools access</li>
              <li>• Community features</li>
            </ul>
            
            <Button onClick={handleUpgradePlan} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Upgrade to Premium
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="p-4 space-y-2">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            
            <Button variant="ghost" onClick={handleDeleteAccount} className="w-full justify-start text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};