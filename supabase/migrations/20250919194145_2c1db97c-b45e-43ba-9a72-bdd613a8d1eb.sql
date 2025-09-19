-- ========================================
-- FIX FINAL SEARCH PATH FUNCTIONS
-- ========================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_discoverable_profiles function
CREATE OR REPLACE FUNCTION public.search_discoverable_profiles(search_term text, limit_count integer DEFAULT 10)
RETURNS TABLE(user_id uuid, username text, display_name text, avatar_url text, bio text, followers integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    COALESCE(pm.followers, 0)
  FROM public.profiles p
  LEFT JOIN public.profile_metrics pm ON pm.user_id = p.id
  WHERE 
    p.privacy_settings->>'profile_visibility' = 'public' AND
    p.privacy_settings->>'discoverable' = 'true' AND
    (
      p.username ILIKE '%' || search_term || '%' OR
      p.display_name ILIKE '%' || search_term || '%'
    )
  ORDER BY pm.followers DESC NULLS LAST
  LIMIT limit_count;
END;
$$;