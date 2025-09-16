-- Create simple market favorites function
CREATE OR REPLACE FUNCTION public.toggle_favorite(pid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  u uuid := auth.uid();
  exists_row boolean;
BEGIN
  IF u IS NULL THEN
    RAISE EXCEPTION 'Auth required';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.favorites WHERE user_id = u AND product_id = pid) INTO exists_row;
  
  IF exists_row THEN
    DELETE FROM public.favorites WHERE user_id = u AND product_id = pid;
    RETURN false;
  ELSE
    INSERT INTO public.favorites(user_id, product_id) VALUES (u, pid) ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
END
$fn$;

-- Simple view function
CREATE OR REPLACE FUNCTION public.mark_product_view(pid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.product_analytics(product_id, views) VALUES (pid, 1)
  ON CONFLICT (product_id) DO UPDATE SET views = public.product_analytics.views + 1, updated_at = now();
END
$fn$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.toggle_favorite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_product_view(uuid) TO anon, authenticated;