"use client"

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

export default function ProfileViewPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.user_metadata?.username) {
      router.replace(`/u/${user.user_metadata.username}`);
    } else {
      router.replace('/profile');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}