import { supabase } from '@/integrations/supabase/client';

export type FollowEdge = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

/**
 * Follow a user (RLS: follower_id must equal auth.uid()).
 * Idempotent: treat unique-violation (23505) as success.
 */
export async function followUser(targetUserId: string) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, followee_id: targetUserId })
    .select()
    .single();

  if (error && error.code !== '23505') throw error;
}

/** Unfollow a user (owner-only via RLS). */
export async function unfollowUser(targetUserId: string) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: user.id, followee_id: targetUserId });

  if (error) throw error;
}

/** Is current user following target? */
export async function isFollowing(targetUserId: string): Promise<boolean> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .match({ follower_id: user.id, followee_id: targetUserId })
    .limit(1);

  if (error) throw error;
  return !!(data && data.length > 0);
}

/** Get followers of a user (who follows them). */
export async function getFollowers(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, followee_id, created_at')
    .eq('followee_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as FollowEdge[];
}

/** Get following of a user (who they follow). */
export async function getFollowing(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, followee_id, created_at')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as FollowEdge[];
}