"use client"

import { useState } from "react";
import { ArrowLeft, User, Bell, Shield, Globe, Palette, Camera, Trash2, Eye, EyeOff, Lock, Mail, Phone, MapPin, ExternalLink, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "Alex Designer",
    email: "alex@example.com",
    bio: "Passionate fashion designer creating unique streetwear pieces",
    location: "London, UK",
    website: "https://alexdesigner.com",
    phone: "+44 7123 456789",
    username: "alexdesigner",
    timezone: "GMT",
    language: "English",
    profilePicture: null as File | null,
    profilePictureUrl: null as string | null,
    coverImage: null as File | null,
    coverImageUrl: null as string | null,
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    designComments: true,
    orderUpdates: true,
    marketing: false,
    pushNotifications: true,
    weeklyDigest: true,
    followerUpdates: true,
    designLikes: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    showOnlineStatus: true,
    indexProfile: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    downloadData: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    designGridSize: "medium",
    showTutorials: true,
  });

  const [activeSection, setActiveSection] = useState("profile");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Error", description: "Cover image must be less than 10MB", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, coverImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log({ formData, notifications, privacy, security, appearance });
    toast({ title: "Settings Saved", description: "Your profile settings have been updated successfully" });
    setHasUnsavedChanges(false);
    // TODO: Save to backend
  };

  const handleDeleteAccount = () => {
    toast({ 
      title: "Delete Account", 
      description: "This action cannot be undone. Please contact support to proceed.",
      variant: "destructive"
    });
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account information and preferences</p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unsaved changes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* Profile Information Section */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cover Image */}
                  <div>
                    <Label className="text-sm font-medium">Cover Image</Label>
                    <div className="mt-2 relative">
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
                        {formData.coverImageUrl && (
                          <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Label htmlFor="cover-image" className="cursor-pointer">
                            <Button variant="secondary" size="sm" asChild>
                              <span>
                                <Camera className="w-4 h-4 mr-2" />
                                {formData.coverImageUrl ? 'Change Cover' : 'Add Cover'}
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                      <Input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        {formData.profilePictureUrl ? (
                          <AvatarImage src={formData.profilePictureUrl} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl">
                            AD
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Label htmlFor="profile-picture" className="absolute -bottom-2 -right-2 cursor-pointer">
                        <Button size="sm" className="rounded-full w-8 h-8 p-0">
                          <Camera className="w-3 h-3" />
                        </Button>
                      </Label>
                      <Input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{formData.name}</h3>
                      <p className="text-sm text-muted-foreground">@{formData.username}</p>
                      <p className="text-xs text-muted-foreground mt-1">Profile picture: JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleFormChange('username', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleFormChange('bio', e.target.value)}
                      placeholder="Tell us about yourself and your design style"
                      className="h-28"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleFormChange('website', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => handleFormChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GMT">GMT (London)</SelectItem>
                          <SelectItem value="EST">EST (New York)</SelectItem>
                          <SelectItem value="PST">PST (Los Angeles)</SelectItem>
                          <SelectItem value="CET">CET (Paris)</SelectItem>
                          <SelectItem value="JST">JST (Tokyo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => handleFormChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-updates">Account Updates</Label>
                      <p className="text-sm text-muted-foreground">Important updates about your account</p>
                    </div>
                    <Switch
                      id="email-updates"
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="design-comments">Design Comments</Label>
                      <p className="text-sm text-muted-foreground">When someone comments on your designs</p>
                    </div>
                    <Switch
                      id="design-comments"
                      checked={notifications.designComments}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, designComments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="design-likes">Design Likes</Label>
                      <p className="text-sm text-muted-foreground">When someone likes your designs</p>
                    </div>
                    <Switch
                      id="design-likes"
                      checked={notifications.designLikes}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, designLikes: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="follower-updates">New Followers</Label>
                      <p className="text-sm text-muted-foreground">When someone follows you</p>
                    </div>
                    <Switch
                      id="follower-updates"
                      checked={notifications.followerUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, followerUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-updates">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">Order confirmations and shipping updates</p>
                    </div>
                    <Switch
                      id="order-updates"
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, orderUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-digest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Promotional emails and special offers</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Push Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Enable Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === "privacy" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Profile Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-public" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public Profile
                      </Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      id="profile-public"
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profilePublic: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-email">Show Email</Label>
                      <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-phone">Show Phone</Label>
                      <p className="text-sm text-muted-foreground">Display your phone number on your public profile</p>
                    </div>
                    <Switch
                      id="show-phone"
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-online-status">Online Status</Label>
                      <p className="text-sm text-muted-foreground">Show when you're online to other users</p>
                    </div>
                    <Switch
                      id="show-online-status"
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-dm">Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">Allow other users to send you direct messages</p>
                    </div>
                    <Switch
                      id="allow-dm"
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowDirectMessages: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="index-profile">Search Engine Indexing</Label>
                      <p className="text-sm text-muted-foreground">Allow search engines to index your profile</p>
                    </div>
                    <Switch
                      id="index-profile"
                      checked={privacy.indexProfile}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, indexProfile: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {security.twoFactorEnabled ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">Disabled</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="login-alerts">Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified of new logins to your account</p>
                    </div>
                    <Switch
                      id="login-alerts"
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Account Actions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="justify-start">
                        Download Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance & Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select value={appearance.theme} onValueChange={(value) => setAppearance(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Design Grid Size</Label>
                    <Select value={appearance.designGridSize} onValueChange={(value) => setAppearance(prev => ({ ...prev, designGridSize: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-tutorials">Show Tutorials</Label>
                      <p className="text-sm text-muted-foreground">Display helpful tutorials and tips</p>
                    </div>
                    <Switch
                      id="show-tutorials"
                      checked={appearance.showTutorials}
                      onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, showTutorials: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-destructive">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Save Button */}
          <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}