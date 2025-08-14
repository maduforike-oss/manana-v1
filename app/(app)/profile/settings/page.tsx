"use client"

import { useState } from "react";
import { ArrowLeft, User, Bell, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "Alex Designer",
    email: "alex@example.com",
    bio: "Passionate fashion designer creating unique streetwear pieces",
    location: "London, UK",
    website: "https://alexdesigner.com",
    phone: "+44 7123 456789",
    profilePicture: null as File | null,
    profilePictureUrl: null as string | null,
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    designComments: true,
    orderUpdates: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log({ formData, notifications, privacy });
    // TODO: Save to backend
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                {formData.profilePictureUrl ? (
                  <AvatarImage src={formData.profilePictureUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl">
                    AD
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <Label htmlFor="profile-picture" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Change Picture</span>
                  </Button>
                </Label>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                className="h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-updates">Email Updates</Label>
                <p className="text-sm text-muted-foreground">Receive updates about your account</p>
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
                <p className="text-sm text-muted-foreground">Get notified when someone comments on your designs</p>
              </div>
              <Switch
                id="design-comments"
                checked={notifications.designComments}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, designComments: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-updates">Order Updates</Label>
                <p className="text-sm text-muted-foreground">Updates about your orders and shipping</p>
              </div>
              <Switch
                id="order-updates"
                checked={notifications.orderUpdates}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, orderUpdates: checked }))}
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

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-public">Public Profile</Label>
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
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
}