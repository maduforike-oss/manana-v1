-- Market Profiles v1: Analytics, Favorites, Reviews, Badges (Fixed)
-- This migration is idempotent and safe to run multiple times

-- 1) product_analytics: counters + trend
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='product_analytics' AND policyname='analytics_public_read'
  ) THEN
    CREATE POLICY analytics_public_read ON public.product_analytics
      FOR SELECT TO public USING (true);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_product_analytics_trend ON public.product_analytics (trend_score DESC);

-- 2) favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='favorites_owner_all') THEN
    CREATE POLICY favorites_owner_all ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(product_id);

-- 3) product_reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_public_read') THEN
    CREATE POLICY reviews_public_read ON public.product_reviews FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_owner_write') THEN
    CREATE POLICY reviews_owner_write ON public.product_reviews FOR ALL TO authenticated 
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON public.product_reviews(product_id, created_at DESC);

-- 4) product_badges
CREATE TABLE IF NOT EXISTS public.product_badges (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  PRIMARY KEY(product_id, key)
);

ALTER TABLE public.product_badges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_badges' AND policyname='badges_public_read') THEN
    CREATE POLICY badges_public_read ON public.product_badges FOR SELECT TO public USING (true);
  END IF;
END$$;

-- 5) Trigger functions
CREATE OR REPLACE FUNCTION public.on_favorite_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.product_analytics(product_id, favorites) VALUES (NEW.product_id, 1)
    ON CONFLICT (product_id) DO UPDATE SET 
      favorites = public.product_analytics.favorites + 1,
      trend_score = views + 2*(public.product_analytics.favorites + 1) + 10*recent_reviews,
      updated_at = now();
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.product_analytics
    SET favorites = GREATEST(favorites - 1, 0),
        trend_score = views + 2*GREATEST(favorites - 1, 0) + 10*recent_reviews,
        updated_at = now()
    WHERE product_id = OLD.product_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END
$fn$;

DROP TRIGGER IF EXISTS tr_favorites_change ON public.favorites;
CREATE TRIGGER tr_favorites_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_change();

CREATE OR REPLACE FUNCTION public.on_review_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  pid uuid := COALESCE(NEW.product_id, OLD.product_id);
  avg_r numeric(3,2);
  cnt int;
  recent_cnt int;
BEGIN
  SELECT COALESCE(AVG(rating),0)::numeric(3,2), COUNT(*)
  INTO avg_r, cnt
  FROM public.product_reviews
  WHERE product_id = pid;

  SELECT COUNT(*) INTO recent_cnt
  FROM public.product_reviews
  WHERE product_id = pid AND created_at >= now() - INTERVAL '14 days';

  INSERT INTO public.product_analytics(product_id, avg_rating, reviews_count, recent_reviews)
  VALUES (pid, avg_r, cnt, recent_cnt)
  ON CONFLICT (product_id) DO UPDATE
  SET avg_rating = EXCLUDED.avg_rating,
      reviews_count = EXCLUDED.reviews_count,
      recent_reviews = EXCLUDED.recent_reviews,
      trend_score = views + 2*favorites + 10*EXCLUDED.recent_reviews,
      updated_at = now();

  RETURN COALESCE(NEW, OLD);
END
$fn$;

DROP TRIGGER IF EXISTS tr_reviews_change ON public.product_reviews;
CREATE TRIGGER tr_reviews_change
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

-- 6) RPC functions
CREATE OR REPLACE FUNCTION public.mark_product_view(pid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  INSERT INTO public.product_analytics(product_id, views) VALUES (pid, 1)
  ON CONFLICT (product_id) DO UPDATE
  SET views = public.product_analytics.views + 1,
      trend_score = (public.product_analytics.views + 1) + 2*favorites + 10*recent_reviews,
      updated_at = now();
END
$fn$;

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

-- 7) Market cards view
CREATE OR REPLACE VIEW public.v_market_cards AS
SELECT
  p.id as product_id,
  p.name as title,
  p.description,
  (p.base_price * 100)::int as price_cents, -- Convert to cents
  'USD' as currency,
  CASE 
    WHEN p.images IS NOT NULL AND jsonb_typeof(p.images) = 'array' AND jsonb_array_length(p.images) > 0 
    THEN p.images->>0 
    ELSE NULL 
  END as primary_image,
  COALESCE(pa.avg_rating, 0) as avg_rating,
  COALESCE(pa.reviews_count, 0) as reviews_count,
  COALESCE(pa.views, 0) as views,
  COALESCE(pa.favorites, 0) as favorites,
  COALESCE(pa.trend_score, 0) as trend_score,
  p.created_at,
  p.status
FROM public.products p
LEFT JOIN public.product_analytics pa ON pa.product_id = p.id
WHERE p.status = 'active';

GRANT SELECT ON public.v_market_cards TO public;

-- 8) Main listing function
CREATE OR REPLACE FUNCTION public.list_market_cards(
  tab text DEFAULT 'all', 
  q text DEFAULT NULL, 
  lim int DEFAULT 24, 
  off int DEFAULT 0
)
RETURNS SETOF public.v_market_cards
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT c.* FROM public.v_market_cards c
  WHERE ($2 IS NULL OR c.title ILIKE '%'||$2||'%' OR c.description ILIKE '%'||$2||'%')
    AND CASE LOWER($1)
      WHEN 'saved' THEN EXISTS (
        SELECT 1 FROM public.favorites f 
        WHERE f.user_id = auth.uid() AND f.product_id = c.product_id
      )
      ELSE true
    END
  ORDER BY CASE LOWER($1)
    WHEN 'trending' THEN c.trend_score
    WHEN 'new' THEN EXTRACT(epoch FROM c.created_at)
    ELSE EXTRACT(epoch FROM c.created_at)
  END DESC
  LIMIT $3 OFFSET $4;
$$;