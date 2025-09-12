import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { getMyProfile, updateMyProfile, uploadAvatar, checkUsernameAvailability, type Profile } from '../../lib/profile';
import { sanitizeUsername, validateUsername } from '../../lib/usernames';
import { withAuth } from '../../lib/withAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from '../../components/ui/toast';
import { User, Camera } from 'lucide-react';

function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  // Username validation
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      
      // Populate form fields
      if (data) {
        setUsername(data.username || '');
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setWebsite(data.website || '');
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced username validation
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameStatus('idle');
      return;
    }

    const timeoutId = setTimeout(async () => {
      const sanitized = sanitizeUsername(username);
      if (sanitized !== username) {
        setUsername(sanitized);
        return;
      }

      const validation = validateUsername(username);
      if (!validation.isValid) {
        setUsernameStatus('invalid');
        setUsernameError(validation.error || 'Invalid username');
        return;
      }

      setUsernameStatus('checking');
      try {
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
        setUsernameError(isAvailable ? '' : 'Username is already taken');
      } catch (error) {
        setUsernameStatus('idle');
        setUsernameError('Failed to check username availability');
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [username, profile?.username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<Profile> = {
        username: username || undefined,
        display_name: displayName || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
      };

      await updateMyProfile(updates);
      
      // Reload to get fresh data
      await loadProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              ← Back
            </Button>
          </div>

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                    <Camera className="w-3 h-3" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-medium">{profile?.display_name || profile?.username || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {uploading ? 'Uploading...' : 'Click the camera icon to upload a new picture'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                />
                {usernameStatus === 'checking' && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-green-600">✓ Username available</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-600">✗ {usernameError}</p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-xs text-red-600">✗ {usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);