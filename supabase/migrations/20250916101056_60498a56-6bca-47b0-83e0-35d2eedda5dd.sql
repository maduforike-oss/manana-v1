-- Market Profiles v1: Analytics, Favorites, Reviews, Badges
-- This migration is idempotent and safe to run multiple times

-- 1) product_analytics: counters + trend
CREATE TABLE IF NOT EXISTS public.product_analytics (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  views int NOT NULL DEFAULT 0,
  favorites int NOT NULL DEFAULT 0,
  avg_rating numeric(3,2) NOT NULL DEFAULT 0.00,
  reviews_count int NOT NULL DEFAULT 0,
  recent_reviews int NOT NULL DEFAULT 0, -- last 14d rolling count
  trend_score int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- Public read of analytics
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

-- Index for trending
CREATE INDEX IF NOT EXISTS idx_product_analytics_trend ON public.product_analytics (trend_score DESC);

-- 2) favorites (per-user saves)
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='favorites_owner_read') THEN
    CREATE POLICY favorites_owner_read ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='favorites_owner_write') THEN
    CREATE POLICY favorites_owner_write ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(product_id);

-- 3) product_reviews (ratings)
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_insert_auth') THEN
    CREATE POLICY reviews_insert_auth ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_owner_update') THEN
    CREATE POLICY reviews_owner_update ON public.product_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reviews' AND policyname='reviews_owner_delete') THEN
    CREATE POLICY reviews_owner_delete ON public.product_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON public.product_reviews(product_id, created_at DESC);

-- 4) product_badges (persisted)
CREATE TABLE IF NOT EXISTS public.product_badges (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key text NOT NULL, -- e.g., 'new','trending','low_stock'
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_badges' AND policyname='badges_owner_write') THEN
    CREATE POLICY badges_owner_write ON public.product_badges FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.owner_id = auth.uid())
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.owner_id = auth.uid())
    );
  END IF;
END$$;

-- 5) TRIGGERS: keep analytics in sync
CREATE OR REPLACE FUNCTION public.on_favorite_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.product_analytics(product_id, favorites) VALUES (NEW.product_id, 1)
    ON CONFLICT (product_id) DO UPDATE SET favorites = public.product_analytics.favorites + 1, updated_at = now();
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.product_analytics
       SET favorites = GREATEST(favorites - 1, 0),
           updated_at = now()
     WHERE product_id = OLD.product_id;
  END IF;
  -- trend recompute
  UPDATE public.product_analytics
     SET trend_score = views + 2*favorites + 10*recent_reviews,
         updated_at = now()
   WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END
$fn$;

DROP TRIGGER IF EXISTS tr_favorites_change ON public.favorites;
CREATE TRIGGER tr_favorites_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_change();

-- reviews trigger
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
  WHERE product_id = pid
    AND created_at >= now() - INTERVAL '14 days';

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

DROP TRIGGER IF EXISTS tr_reviews_insert ON public.product_reviews;
DROP TRIGGER IF EXISTS tr_reviews_update ON public.product_reviews;
DROP TRIGGER IF EXISTS tr_reviews_delete ON public.product_reviews;

CREATE TRIGGER tr_reviews_insert AFTER INSERT ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

CREATE TRIGGER tr_reviews_update AFTER UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

CREATE TRIGGER tr_reviews_delete AFTER DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

-- 6) RPCs
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

CREATE OR REPLACE FUNCTION public.add_review(pid uuid, rating int, body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  INSERT INTO public.product_reviews(product_id, user_id, rating, body)
  VALUES (pid, auth.uid(), rating, body);
END
$fn$;

CREATE OR REPLACE FUNCTION public.list_reviews(pid uuid, lim int DEFAULT 20, off int DEFAULT 0)
RETURNS SETOF public.product_reviews
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT * FROM public.product_reviews
  WHERE product_id = pid
  ORDER BY created_at DESC
  LIMIT lim OFFSET off;
$$;

-- 7) Views
CREATE OR REPLACE VIEW public.v_market_cards AS
SELECT
  p.id as product_id,
  p.name as title,
  p.description,
  p.base_price as price_cents,
  'USD' as currency,
  CASE 
    WHEN jsonb_typeof(p.images) = 'array' AND jsonb_array_length(p.images) > 0 
    THEN p.images->>0 
    ELSE NULL 
  END as primary_image,
  COALESCE(pa.avg_rating, 0) as avg_rating,
  COALESCE(pa.reviews_count, 0) as reviews_count,
  COALESCE(pa.views, 0) as views,
  COALESCE(pa.favorites, 0) as favorites,
  COALESCE(pa.trend_score, 0) as trend_score,
  p.created_at,
  p.status,
  (EXISTS(SELECT 1 FROM public.product_badges b WHERE b.product_id = p.id AND b.key = 'new' AND (b.expires_at IS NULL OR b.expires_at > now()))) as has_badge_new,
  (EXISTS(SELECT 1 FROM public.product_badges b WHERE b.product_id = p.id AND b.key = 'trending' AND (b.expires_at IS NULL OR b.expires_at > now()))) as has_badge_trending,
  (EXISTS(SELECT 1 FROM public.product_badges b WHERE b.product_id = p.id AND b.key = 'low_stock' AND (b.expires_at IS NULL OR b.expires_at > now()))) as has_badge_low_stock
FROM public.products p
LEFT JOIN public.product_analytics pa ON pa.product_id = p.id
WHERE p.status = 'active';

GRANT SELECT ON public.v_market_cards TO public;

CREATE OR REPLACE VIEW public.v_product_detail AS
SELECT
  p.*,
  COALESCE(pa.avg_rating, 0) as avg_rating,
  COALESCE(pa.reviews_count, 0) as reviews_count,
  COALESCE(pa.views, 0) as views,
  COALESCE(pa.favorites, 0) as favorites,
  COALESCE(pa.trend_score, 0) as trend_score
FROM public.products p
LEFT JOIN public.product_analytics pa ON pa.product_id = p.id;

GRANT SELECT ON public.v_product_detail TO public;

-- 8) Main listing RPC
CREATE OR REPLACE FUNCTION public.list_market_cards(
  tab text DEFAULT 'all', 
  q text DEFAULT NULL, 
  filters jsonb DEFAULT '{}'::jsonb, 
  lim int DEFAULT 24, 
  off int DEFAULT 0
)
RETURNS SETOF public.v_market_cards
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  WITH base AS (
    SELECT * FROM public.v_market_cards
    WHERE ($2 IS NULL OR title ILIKE '%'||$2||'%' OR description ILIKE '%'||$2||'%')
      AND (
        (COALESCE(($3->>'min_price_cents')::int, 0) = 0 OR price_cents >= ($3->>'min_price_cents')::int)
        AND (COALESCE(($3->>'max_price_cents')::int, 0) = 0 OR price_cents <= ($3->>'max_price_cents')::int)
        AND (COALESCE(($3->>'min_rating')::int, 0) = 0 OR avg_rating >= ($3->>'min_rating')::int)
        AND (COALESCE(($3->>'has_badge_new')::boolean, false) = false OR has_badge_new = true)
        AND (COALESCE(($3->>'has_badge_trending')::boolean, false) = false OR has_badge_trending = true)
        AND (COALESCE(($3->>'has_badge_low_stock')::boolean, false) = false OR has_badge_low_stock = true)
      )
  ),
  scoped AS (
    SELECT b.* FROM base b
    WHERE CASE LOWER($1)
      WHEN 'saved' THEN EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = auth.uid() AND f.product_id = b.product_id)
      ELSE true
    END
  )
  SELECT * FROM scoped
  ORDER BY CASE LOWER($1)
    WHEN 'trending' THEN trend_score
    WHEN 'new' THEN EXTRACT(epoch FROM created_at)
    ELSE EXTRACT(epoch FROM created_at)
  END DESC
  LIMIT $4 OFFSET $5;
$$;

CREATE OR REPLACE FUNCTION public.get_product_detail(pid uuid)
RETURNS public.v_product_detail
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT * FROM public.v_product_detail WHERE id = pid;
$$;