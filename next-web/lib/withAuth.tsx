import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

interface WithAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P & WithAuthProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { redirectTo = '/login', ...componentProps } = props as any;

    useEffect(() => {
      // Get initial session
      const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      };

      getInitialSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
      if (!loading && !user) {
        const currentPath = router.asPath;
        const authPath = redirectTo || '/login';
        const separator = authPath.includes('?') ? '&' : '?';
        router.replace(`${authPath}${separator}redirect=${encodeURIComponent(currentPath)}`);
      }
    }, [user, loading, router, redirectTo]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...(componentProps as P)} />;
  };
}