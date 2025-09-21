import React, { createContext, useContext, useEffect } from 'react';
import { useRealProfile } from '@/hooks/useRealProfile';
import { useAppStore } from '@/store/useAppStore';
import type { MyProfile } from '@/lib/profile-api';

interface RealUserContextType {
  profile: MyProfile | null;
  loading: boolean;
  error: string | null;
  isUnlimited: boolean;
  canCreateDesign: boolean;
  refreshProfile: () => void;
}

const RealUserContext = createContext<RealUserContextType | null>(null);

export const useRealUser = () => {
  const context = useContext(RealUserContext);
  if (!context) {
    throw new Error('useRealUser must be used within RealUserProvider');
  }
  return context;
};

interface RealUserProviderProps {
  children: React.ReactNode;
}

export const RealUserProvider: React.FC<RealUserProviderProps> = ({ children }) => {
  const realProfile = useRealProfile();
  const { setUser } = useAppStore();

  // Sync real profile with app store
  useEffect(() => {
    if (realProfile.profile) {
      setUser({
        id: realProfile.profile.user_id,
        email: 'Maduforike@icloud.com', // Your email
        name: realProfile.profile.display_name || 'Ike',
        username: realProfile.profile.username || 'mad4ike',
        bio: realProfile.profile.bio || 'Designer and creator',
        location: realProfile.profile.location || '',
        website: realProfile.profile.website || '',
        avatar: realProfile.profile.avatar_url || '',
        specialties: ['Design', 'Creative'],
        plan: realProfile.isUnlimited ? 'premium' : 'basic',
        designsThisMonth: realProfile.profile.total_designs || 0,
        maxDesigns: realProfile.isUnlimited ? -1 : 20,
        followers: realProfile.profile.followers || 0,
        following: realProfile.profile.following || 0,
        totalDesigns: realProfile.profile.total_designs || 0,
        totalOrders: 0, // Not tracked in current schema
        socialLinks: [
          ...(realProfile.profile.social_instagram ? [{ platform: 'instagram' as const, url: realProfile.profile.social_instagram }] : []),
          ...(realProfile.profile.social_twitter ? [{ platform: 'twitter' as const, url: realProfile.profile.social_twitter }] : []),
          ...(realProfile.profile.website ? [{ platform: 'website' as const, url: realProfile.profile.website }] : []),
        ],
        featuredDesigns: [], // TODO: Fetch from design_documents
      });
    } else if (!realProfile.loading) {
      setUser(null);
    }
  }, [realProfile.profile, realProfile.loading, realProfile.isUnlimited, setUser]);

  return (
    <RealUserContext.Provider value={realProfile}>
      {children}
    </RealUserContext.Provider>
  );
};