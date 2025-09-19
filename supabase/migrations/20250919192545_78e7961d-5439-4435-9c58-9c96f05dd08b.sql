-- ========================================
-- SECURITY DEFINER VIEW FIX - STEP 1
-- ========================================
-- 
-- Issue: The me_profile_full view is owned by postgres superuser and when used
-- in SECURITY DEFINER functions, it bypasses Row Level Security (RLS) policies.
--
-- Solution: Replace the view-based approach with direct queries in functions
-- that respect RLS policies, and remove the problematic view.

-- Step 1: Drop the existing functions that depend on the view
DROP FUNCTION IF EXISTS public.ensure_my_profile();
DROP FUNCTION IF EXISTS public.get_my_profile();

-- Step 2: Drop the problematic view
DROP VIEW IF EXISTS public.me_profile_full;

-- Step 3: Create a proper type for the profile data first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'me_profile_full') THEN
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
  END IF;
END $$;