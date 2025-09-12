import { supabase } from '@/integrations/supabase/client';

export type MyProfile = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  preferences: Record<string, any>;
  total_designs: number;
  followers: number;
  following: number;
  metrics_updated_at: string;
  created_at: string;
};

export type PublicProfile = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  followers: number;
  following: number;
};

const BUCKET = 'design-assets';

function uid() {
  // Small helper for unique filenames
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Get the signed-in user's profile via RPC */
export async function getMyProfile(): Promise<MyProfile | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) return null;
  
  const { data, error: rpcErr } = await supabase.rpc('get_my_profile');
  if (rpcErr) throw rpcErr;
  return data as MyProfile;
}

/** Get a public profile by username via RPC */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.rpc('get_public_profile', { u: username });
  if (error) throw error;
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  // Supabase returns array for set-returning functions; normalize
  return (Array.isArray(data) ? data[0] : data) as PublicProfile;
}

/** Check username availability via RPC */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_username_available', { username_to_check: username });
  if (error) throw error;
  return Boolean(data);
}

/** Update profile via RPC with whitelisted fields */
export async function setMyProfile(patch: Partial<Omit<MyProfile, 'user_id' | 'total_designs' | 'followers' | 'following' | 'metrics_updated_at'>>): Promise<void> {
  const safePatch: any = {};
  const keys = ['display_name','username','bio','location','website','social_instagram','social_twitter','cover_url','avatar_url','preferences'] as const;
  for (const k of keys) if (k in patch) (safePatch as any)[k] = (patch as any)[k];
  
  const { error } = await supabase.rpc('set_my_profile', { patch: safePatch });
  if (error) throw error;
}

/** Get followers list via RPC */
export async function listFollowers(userId: string, limit = 20, offset = 0): Promise<{ follower_id: string; created_at: string; }[]> {
  const { data, error } = await supabase.rpc('list_followers', { target: userId, lim: limit, off: offset });
  if (error) throw error;
  return (data ?? []) as any[];
}

/** Get following list via RPC */
export async function listFollowing(userId: string, limit = 20, offset = 0): Promise<{ followee_id: string; created_at: string; }[]> {
  const { data, error } = await supabase.rpc('list_following', { target: userId, lim: limit, off: offset });
  if (error) throw error;
  return (data ?? []) as any[];
}

/** Upload a file to Storage and return { path, publicUrl } */
async function uploadToStorage(file: File, pathPrefix: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `${pathPrefix}/${user.id}/${uid()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl as string };
}

/** Upload avatar image; saves avatar_url on profile and returns the public URL */
export async function uploadAvatar(file: File): Promise<string> {
  const { publicUrl } = await uploadToStorage(file, 'avatars');
  await setMyProfile({ avatar_url: publicUrl });
  return publicUrl;
}

/** Upload cover image; saves cover_url on profile and returns the public URL */
export async function uploadCover(file: File): Promise<string> {
  const { publicUrl } = await uploadToStorage(file, 'covers');
  await setMyProfile({ cover_url: publicUrl });
  return publicUrl;
}