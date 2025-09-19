import { supabase } from '@/integrations/supabase/client';

export type Profile = {
  id?: string;
  user_id?: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  preferences?: Record<string, any>;
  created_at?: string;
  followers?: number;
  following?: number;
  total_designs?: number;
};

// Legacy type alias for compatibility
export type ExtendedProfile = Profile;

export type ProfileMetrics = {
  user_id: string;
  total_designs: number;
  followers: number;
  following: number;
  updated_at: string;
};

const BUCKET = 'design-assets';

function uid() {
  // Small helper for unique filenames
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Get the signed-in user's profile row (or null if not signed in) */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}

/** Update fields on the signed-in user's profile */
export async function updateMyProfile(fields: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<void> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not signed in');

  // Safely merge preferences if provided
  let updateFields = { ...fields };
  if (fields.preferences) {
    const currentProfile = await getMyProfile();
    updateFields.preferences = {
      ...(currentProfile?.preferences || {}),
      ...fields.preferences
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateFields)
    .eq('id', user.id);

  if (error) throw error;
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
  await updateMyProfile({ avatar_url: publicUrl });
  return publicUrl;
}

/** Upload cover image; saves cover_url on profile and returns the public URL */
export async function uploadCover(file: File): Promise<string> {
  const { publicUrl } = await uploadToStorage(file, 'covers');
  await updateMyProfile({ cover_url: publicUrl });
  return publicUrl;
}

/** Get a profile by username (now uses privacy-aware function) */
export async function getProfileByUsername(username: string): Promise<ExtendedProfile | null> {
  const { data, error } = await supabase.rpc('get_public_profile_safe', { 
    username_param: username 
  });

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return (Array.isArray(data) ? data[0] : data) as any;
}

/** Get profile metrics for a user */
export async function getProfileMetrics(userId: string): Promise<ProfileMetrics | null> {
  const { data, error } = await supabase
    .from('profile_metrics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileMetrics | null;
}

/** Ensure a metrics row exists for the signed-in user; returns the row */
export async function ensureProfileMetrics(): Promise<ProfileMetrics | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return null;

  // Try read
  const { data, error } = await supabase
    .from('profile_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!error && data) return data as ProfileMetrics;

  // Insert if missing
  const { data: inserted, error: insErr } = await supabase
    .from('profile_metrics')
    .insert({ user_id: user.id })
    .select('*')
    .single();

  if (insErr) throw insErr;
  return inserted as ProfileMetrics;
}

/** Update metrics with a partial patch (e.g., { followers: 10 }) */
export async function updateProfileMetrics(patch: Partial<Omit<ProfileMetrics, 'user_id'>>): Promise<ProfileMetrics | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profile_metrics')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) {
    // If no row exists yet, create it then try again
    await ensureProfileMetrics();
    const { data: data2, error: err2 } = await supabase
      .from('profile_metrics')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (err2) throw err2;
    return data2 as ProfileMetrics;
  }
  return data as ProfileMetrics;
}

/** Convenience: increment total_designs by n (default 1) */
export async function incrementDesignCount(n = 1): Promise<ProfileMetrics | null> {
  const current = await ensureProfileMetrics();
  if (!current) return null;
  const next = Math.max(0, (current.total_designs ?? 0) + n);
  return updateProfileMetrics({ total_designs: next });
}

/** Check if a username is available (case-insensitive). Excludes current user when provided. */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const name = (username || '').trim();
  if (!name) return false;

  // Prefer RPC if available
  const { data: { user } } = await supabase.auth.getUser();
  try {
    const { data, error } = await supabase.rpc('is_username_available', {
      username_to_check: name
    });
    if (error) throw error;
    return Boolean(data);
  } catch {
    // Fallback: direct query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', name) // case-insensitive
      .limit(1);

    if (error) throw error;
    // If no rows or only our own row, it's available
    if (!data || data.length === 0) return true;
    if (user && data[0]?.id === user.id) return true;
    return false;
  }
}