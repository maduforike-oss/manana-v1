-- ========================================
-- FIX LAST FUNCTION SEARCH PATH ISSUE
-- ========================================

-- Fix is_username_available function (overload version)
CREATE OR REPLACE FUNCTION public.is_username_available(name text, self_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select not exists (
    select 1
    from public.profiles p
    where p.username is not null
      and lower(p.username) = lower(name)
      and (self_id is null or p.id <> self_id)
  );
$$;