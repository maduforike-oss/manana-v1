-- Market Profiles v1: Core Tables Only (Step 1)
-- Create tables first, then views and functions separately

-- 1) product_analytics table
CREATE TABLE IF NOT EXISTS public.product_analytics (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  views int NOT NULL DEFAULT 0,
  favorites int NOT NULL DEFAULT 0,
  avg_rating numeric(3,2) NOT NULL DEFAULT 0.00,
  reviews_count int NOT NULL DEFAULT 0,
  recent_reviews int NOT NULL DEFAULT 0,
  trend_score int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- 2) favorites table  
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 3) product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Basic policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_analytics' AND policyname='analytics_public_read') THEN
    CREATE POLICY analytics_public_read ON public.product_analytics FOR SELECT TO public USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='favorites_owner_all') THEN
    CREATE POLICY favorites_owner_all ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_public_read') THEN
    CREATE POLICY reviews_public_read ON public.product_reviews FOR SELECT TO public USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_owner_write') THEN
    CREATE POLICY reviews_owner_write ON public.product_reviews FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

-- Simple RPC functions
CREATE OR REPLACE FUNCTION public.toggle_favorite(pid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $fn$
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

CREATE OR REPLACE FUNCTION public.mark_product_view(pid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  INSERT INTO public.product_analytics(product_id, views) VALUES (pid, 1)
  ON CONFLICT (product_id) DO UPDATE SET views = public.product_analytics.views + 1, updated_at = now();
END
$fn$;