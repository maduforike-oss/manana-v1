'use client';

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export default function SignOutButton({ 
  className = '', 
  children, 
  redirectTo = '/auth/signin' 
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Navigate to redirect URL
      window.location.href = redirectTo;
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
      {children || (loading ? 'Signing out…' : 'Sign out')}
    </button>
  );
}