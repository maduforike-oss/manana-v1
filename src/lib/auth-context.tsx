'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getMyProfile, ExtendedProfile } from './profile';

// Mobile compatibility checks
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isLocalStorageAvailable = () => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ExtendedProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log('[Auth] Setting up authentication...', { 
          isMobile: isMobile(), 
          hasLocalStorage: isLocalStorageAvailable() 
        });

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[Auth] State change:', { event, hasSession: !!session, isMobile: isMobile() });
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Defer profile loading to prevent auth deadlock
            if (session?.user) {
              setTimeout(() => {
                refreshProfile();
              }, 0);
            } else {
              setProfile(null);
            }
            
            setIsLoading(false);
          }
        );

        // Check for existing session with mobile-specific handling
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[Auth] Error getting session:', error);
            setIsLoading(false);
            return;
          }

          console.log('[Auth] Initial session check:', { hasSession: !!session });
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(() => {
              refreshProfile();
            }, 0);
          }
          
          setIsLoading(false);
        } catch (sessionError) {
          console.error('[Auth] Session check failed:', sessionError);
          setIsLoading(false);
        }

        return () => subscription.unsubscribe();
      } catch (setupError) {
        console.error('[Auth] Setup failed:', setupError);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}