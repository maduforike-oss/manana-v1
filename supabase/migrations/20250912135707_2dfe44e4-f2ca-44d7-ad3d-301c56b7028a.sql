-- PHASE 1: Critical Database & Security Fixes

-- Fix security definer view issue by updating me_profile_full view
-- Replace the existing view with proper security definer function
CREATE OR REPLACE FUNCTION public.get_me_profile_full()
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  bio text,
  location text,
  website text,
  social_instagram text,
  social_twitter text,
  avatar_url text,
  cover_url text,
  preferences jsonb,
  created_at timestamp with time zone,
  followers integer,
  following integer,
  total_designs integer,
  metrics_updated_at timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.username,
    p.display_name,
    p.bio,
    p.location,
    p.website,
    p.social_instagram,
    p.social_twitter,
    p.avatar_url,
    p.cover_url,
    p.preferences,
    p.created_at,
    pm.followers,
    pm.following,
    pm.total_designs,
    pm.updated_at as metrics_updated_at
  FROM public.profiles p
  LEFT JOIN public.profile_metrics pm ON pm.user_id = p.id
  WHERE p.id = auth.uid();
$$;

-- Fix search_path for all existing functions
-- Update get_public_profile function
CREATE OR REPLACE FUNCTION public.get_public_profile(u text)
RETURNS TABLE(user_id uuid, username text, display_name text, avatar_url text, cover_url text, bio text, location text, website text, social_instagram text, social_twitter text, followers integer, following integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.location,
    p.website,
    p.social_instagram,
    p.social_twitter,
    pm.followers,
    pm.following
  from public.profiles p
  join public.profile_metrics pm on pm.user_id = p.id
  where lower(p.username) = lower(u)
  limit 1;
$$;

-- Update is_username_available function
CREATE OR REPLACE FUNCTION public.is_username_available(username_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select not exists (
    select 1
    from public.profiles p
    where lower(p.username) = lower(username_to_check)
      and p.id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );
$$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_followee ON public.follows(follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee_created ON public.follows(followee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON public.post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON public.comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON public.notifications(recipient_id, created_at DESC);

-- Enable realtime for key tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;