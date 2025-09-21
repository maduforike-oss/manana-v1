import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMyProfile, type MyProfile } from '@/lib/profile-api';

interface RealProfileState {
  profile: MyProfile | null;
  loading: boolean;
  error: string | null;
}

export const useRealProfile = () => {
  const [state, setState] = useState<RealProfileState>({
    profile: null,
    loading: true,
    error: null
  });

  const loadProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ profile: null, loading: false, error: null });
        return;
      }

      const profile = await getMyProfile();
      setState({ 
        profile, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setState({ 
        profile: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  useEffect(() => {
    loadProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setState({ profile: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    ...state,
    refreshProfile,
    isUnlimited: state.profile?.preferences?.plan === 'unlimited' || state.profile?.preferences?.max_designs === -1,
    canCreateDesign: !state.loading && (
      state.profile?.preferences?.plan === 'unlimited' || 
      state.profile?.preferences?.max_designs === -1 ||
      (state.profile?.total_designs || 0) < (state.profile?.preferences?.max_designs || 20)
    )
  };
};