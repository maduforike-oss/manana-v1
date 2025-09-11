'use client';

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function SignOutButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Hard reload to flush client state
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className || 'px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800'}
      aria-label="Sign out"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}