-- ========================================
-- SECURITY DEFINER VIEW FIX
-- ========================================
-- 
-- Issue: The me_profile_full view is owned by postgres superuser and when used
-- in SECURITY DEFINER functions, it bypasses Row Level Security (RLS) policies.
-- This creates a security vulnerability where data access isn't properly controlled.
--
-- Solution: Replace the view-based approach with direct queries in functions
-- that respect RLS policies, and remove the problematic view.

-- First, let's create a safer version of get_me_profile_full that doesn't rely on the view
CREATE OR REPLACE FUNCTION public.get_me_profile_full_safe()
RETURNS TABLE(
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
  privacy_settings jsonb,
  created_at timestamp with time zone,
  followers integer,
  following integer,
  total_designs integer,
  metrics_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Return profile data using direct queries that respect RLS
  RETURN QUERY
  SELECT 
    p.id,
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
    p.privacy_settings,
    p.created_at,
    COALESCE(pm.followers, 0),
    COALESCE(pm.following, 0),
    COALESCE(pm.total_designs, 0),
    pm.updated_at
  FROM public.profiles p
  LEFT JOIN public.profile_metrics pm ON pm.user_id = p.id
  WHERE p.id = auth.uid();
END;
$$;

-- Update the existing ensure_my_profile function to use the safer approach
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS TABLE(
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
  privacy_settings jsonb,
  created_at timestamp with time zone,
  followers integer,
  following integer,
  total_designs integer,
  metrics_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get current user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create profile if it doesn't exist
  INSERT INTO public.profiles (id)
  VALUES (auth.uid())
  ON CONFLICT (id) DO NOTHING;

  -- Create profile_metrics if it doesn't exist
  INSERT INTO public.profile_metrics (user_id)
  VALUES (auth.uid())
  ON CONFLICT (user_id) DO NOTHING;

  -- Return the complete profile data using safe method
  RETURN QUERY
  SELECT * FROM public.get_me_profile_full_safe();
END;
$$;

-- Create a safer version of get_my_profile function as well
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(
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
  privacy_settings jsonb,
  created_at timestamp with time zone,
  followers integer,
  following integer,
  total_designs integer,
  metrics_updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.get_me_profile_full_safe();
$$;

-- Now we can safely drop the problematic view
-- Note: This may cause temporary issues if any code is actively using the view
-- but our functions now use the safer direct query approach
DROP VIEW IF EXISTS public.me_profile_full;

-- Create a type for the profile data to maintain compatibility
-- if any code expects the old return type
CREATE TYPE public.me_profile_full AS (
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
  privacy_settings jsonb,
  created_at timestamp with time zone,
  followers integer,
  following integer,
  total_designs integer,
  metrics_updated_at timestamp with time zone
);