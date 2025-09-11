'use client';

import { useEffect, useState } from 'react';
import { followUser, unfollowUser, isFollowing } from '@/lib/follows';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  targetUserId: string;
};

export default function FollowButton({ targetUserId }: Props) {
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      if (user && user.id !== targetUserId) {
        const res = await isFollowing(targetUserId);
        setFollowing(res);
      }
      setLoading(false);
    };
    init();
  }, [targetUserId]);

  if (loading) return <button disabled className="px-3 py-1 rounded bg-gray-300">...</button>;
  if (!currentUserId) return null; // don't show follow button if not signed in
  if (currentUserId === targetUserId) return null; // don't show for self

  const handleClick = async () => {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 rounded font-medium ${
        following ? 'bg-gray-200 text-gray-700' : 'bg-pink-600 text-white'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}