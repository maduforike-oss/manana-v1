'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { followUser, unfollowUser, isFollowing } from '@/lib/follows';

interface FollowButtonProps {
  targetUserId: string;
}

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (user && user.id !== targetUserId) {
        try {
          const res = await isFollowing(targetUserId);
          setFollowing(res);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
      setLoading(false);
    };
    init();
  }, [targetUserId, user]);

  if (loading) return <button disabled className="px-3 py-1 rounded bg-gray-300">...</button>;
  if (!user) return null; // don't show follow button if not signed in
  if (user.id === targetUserId) return null; // don't show for self

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
    } catch (error) {
      console.error('Error updating follow status:', error);
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