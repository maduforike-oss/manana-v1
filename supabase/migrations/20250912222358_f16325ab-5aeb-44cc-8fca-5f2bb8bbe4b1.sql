-- Create an RPC function to ensure user has profile and metrics
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS me_profile_full
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result me_profile_full;
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

  -- Return the complete profile data
  SELECT * INTO result
  FROM public.me_profile_full
  WHERE user_id = auth.uid();

  RETURN result;
END;
$function$;

-- Create trigger for new auth users
CREATE OR REPLACE FUNCTION public.on_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Call existing handle_new_user function
  PERFORM public.handle_new_user();
  RETURN NEW;
END;
$function$;

-- Note: The actual trigger creation would need to be done on auth.users
-- which requires superuser permissions. This is typically configured
-- in the Supabase dashboard under Authentication > Settings > Hooks