-- ========================================
-- SECURITY DEFINER VIEW FIX - STEP 2
-- ========================================
-- 
-- Now recreate the safe functions that respect RLS policies

-- Create a safe function to get profile data that respects RLS
CREATE OR REPLACE FUNCTION public.get_me_profile_full_safe()
RETURNS public.me_profile_full
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.me_profile_full;
BEGIN
  -- Ensure the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get profile data using direct queries that respect RLS
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
  INTO result
  FROM public.profiles p
  LEFT JOIN public.profile_metrics pm ON pm.user_id = p.id
  WHERE p.id = auth.uid();

  RETURN result;
END;
$$;

-- Recreate ensure_my_profile function safely
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.me_profile_full
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
  RETURN public.get_me_profile_full_safe();
END;
$$;

-- Recreate get_my_profile function safely
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.me_profile_full
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_me_profile_full_safe();
$$;