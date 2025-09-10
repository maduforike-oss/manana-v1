import { supabase } from '@/integrations/supabase/client';

export type ExtendedProfile = {
  id: string;
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
  created_at: string;
};

export type ProfileMetrics = {
  user_id: string;
  total_designs: number;
  followers: number;
  following: number;
  updated_at: string;
};

export async function getMyProfile(): Promise<ExtendedProfile | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as ExtendedProfile;
}

export async function getProfileByUsername(username: string): Promise<ExtendedProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data as ExtendedProfile | null;
}

export async function getProfileMetrics(userId: string): Promise<ProfileMetrics | null> {
  const { data, error } = await supabase
    .from('profile_metrics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ProfileMetrics | null;
}

export async function updateMyProfile(fields: Partial<Omit<ExtendedProfile, 'id' | 'created_at'>>) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', user.id);

  if (error) throw error;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_username_available', {
    username_to_check: username
  });

  if (error) throw error;
  return data as boolean;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not signed in');

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `avatars/${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('design-assets')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('design-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadCover(file: File): Promise<string> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not signed in');

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `covers/${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('design-assets')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('design-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}