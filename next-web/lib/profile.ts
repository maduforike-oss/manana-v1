import { supabase } from './supabaseClient';

export type Profile = {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  website?: string;
  social_twitter?: string;
  social_instagram?: string;
  preferences?: Record<string, any>;
  created_at?: string;
};

export type ProfileMetrics = {
  user_id: string;
  total_designs?: number;
  followers?: number;
  following?: number;
  updated_at?: string;
};

// Get the current user's profile
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

// Update the current user's profile
export async function updateMyProfile(fields: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...fields,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

// Upload avatar image
export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
  const avatarUrl = data.publicUrl;

  // Update profile with new avatar URL
  await updateMyProfile({ avatar_url: avatarUrl });

  return avatarUrl;
}

// Upload cover image
export async function uploadCover(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload cover: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
  const coverUrl = data.publicUrl;

  // Update profile with new cover URL
  await updateMyProfile({ cover_url: coverUrl });

  return coverUrl;
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

// Get profile metrics
export async function getProfileMetrics(userId: string): Promise<ProfileMetrics | null> {
  const { data, error } = await supabase
    .from('profile_metrics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile metrics: ${error.message}`);
  }

  return data;
}

// Check username availability
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('profiles')
    .select('id')
    .ilike('username', username);

  // Exclude current user's username if they're logged in
  if (user) {
    query = query.neq('id', user.id);
  }

  const { data, error } = await query.single();

  if (error && error.code === 'PGRST116') {
    return true; // Username is available
  }

  if (error) {
    throw new Error(`Failed to check username: ${error.message}`);
  }

  return !data; // If data exists, username is taken
}