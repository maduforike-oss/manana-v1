-- Create an RPC function to ensure user has a profile and profile_metrics
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS me_profile_full
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Make sure the trigger exists for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();