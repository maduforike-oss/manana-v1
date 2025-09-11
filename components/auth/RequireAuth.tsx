'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

type Props = { children: React.ReactNode; redirectTo?: string };

export default function RequireAuth({ children, redirectTo = '/auth/signin' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (user) { setAuthed(true); setLoading(false); }
      else { router.replace(redirectTo); }
    })();
    return () => { mounted = false; };
  }, [router, redirectTo]);

  if (loading) return null;
  return <>{authed ? children : null}</>;
}