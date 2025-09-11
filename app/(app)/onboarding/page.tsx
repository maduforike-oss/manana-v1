'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateMyProfile, checkUsernameAvailability } from '@/lib/profile';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { getErrorMessage } from '@/lib/errors';
import { useRouter } from 'next/navigation';
import { Loader2, User, AtSign } from 'lucide-react';

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  });

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameError('');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameError(validation.error || '');
      return;
    }

    setIsCheckingUsername(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setUsernameError('This username is already taken');
      } else {
        setUsernameError('');
      }
    } catch (error) {
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = sanitizeUsername(value);
    setFormData(prev => ({ ...prev, username: sanitized }));
    
    // Debounce username check
    setTimeout(() => checkUsername(sanitized), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameError) {
      toast({
        title: 'Username Error',
        description: usernameError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await updateMyProfile({
        display_name: formData.display_name || null,
        username: formData.username || null,
        bio: formData.bio || null,
      });
      
      await refreshProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Welcome to Manana! Your profile has been set up.',
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md glass-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Manana!</CardTitle>
          <p className="text-muted-foreground">Let's set up your profile to get started</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your display name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-1">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  className={`pl-10 ${usernameError ? 'border-destructive' : ''}`}
                />
                {isCheckingUsername && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>
              {usernameError && (
                <p className="text-sm text-destructive mt-1">{usernameError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isCheckingUsername || !!usernameError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}