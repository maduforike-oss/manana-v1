import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProfileStore } from '@/store/useProfileStore';
import { Shield, Eye, Users, Globe } from 'lucide-react';

export function PrivacySettingsSection() {
  const { profile, patch } = useProfileStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const privacySettings = profile?.privacy_settings || {
    profile_visibility: 'public',
    show_location: true,
    show_social_links: true,
    show_email: false,
    discoverable: true,
  };

  const [settings, setSettings] = useState(privacySettings);

  const handleSave = async () => {
    setLoading(true);
    try {
      await patch({ privacy_settings: settings } as any);
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(privacySettings);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile information and how others can discover you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-3">
          <Label htmlFor="profile-visibility" className="text-sm font-medium">
            Profile Visibility
          </Label>
          <Select
            value={settings.profile_visibility}
            onValueChange={(value: 'public' | 'followers' | 'private') =>
              setSettings({ ...settings, profile_visibility: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Public - Anyone can view your profile</span>
                </div>
              </SelectItem>
              <SelectItem value="followers">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Followers Only - Only your followers can view your profile</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Private - Only you can view your profile</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {settings.profile_visibility === 'public' && "Your profile will be visible to all users and can appear in search results."}
            {settings.profile_visibility === 'followers' && "Only users who follow you can see your complete profile."}
            {settings.profile_visibility === 'private' && "Your profile is completely private and won't be visible to others."}
          </p>
        </div>

        {/* Show Location */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="show-location" className="text-sm font-medium">
              Show Location
            </Label>
            <p className="text-xs text-muted-foreground">
              Display your location on your public profile
            </p>
          </div>
          <Switch
            id="show-location"
            checked={settings.show_location}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, show_location: checked })
            }
          />
        </div>

        {/* Show Social Links */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="show-social" className="text-sm font-medium">
              Show Social Links
            </Label>
            <p className="text-xs text-muted-foreground">
              Display your Instagram and Twitter links on your profile
            </p>
          </div>
          <Switch
            id="show-social"
            checked={settings.show_social_links}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, show_social_links: checked })
            }
          />
        </div>

        {/* Discoverable */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="discoverable" className="text-sm font-medium">
              Discoverable in Search
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to find your profile through search
            </p>
          </div>
          <Switch
            id="discoverable"
            checked={settings.discoverable}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, discoverable: checked })
            }
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}