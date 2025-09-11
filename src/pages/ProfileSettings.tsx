'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandHeader } from '@/components/ui/brand-header';
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';
import { useAuth } from '@/lib/auth-context';
import { useAppStore } from '@/store/useAppStore';

export function ProfileSettings() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { setActiveTab } = useAppStore();

  useEffect(() => {
    setActiveTab('profile');
  }, [setActiveTab]);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/signin');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-full bg-background overflow-auto">
        <BrandHeader title="Profile Settings" subtitle="Loading..." />
        <div className="container mx-auto py-4 px-3 sm:px-4 max-w-2xl">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-full bg-background overflow-auto modern-scroll">
      <BrandHeader 
        title="Profile Settings" 
        subtitle="Update your profile information"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="glass-effect border-border/20 min-h-[48px] min-w-[48px] rounded-2xl"
          aria-label="Back to profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <ProfileSettingsForm />
      </div>
    </div>
  );
}

export default ProfileSettings;