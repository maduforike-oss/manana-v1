-- Market Profiles v1 — Step 2: badges, triggers, views, listing RPC (idempotent)

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

-- 5) Trigger functions (favorites/reviews -> analytics)
CREATE OR REPLACE FUNCTION public.on_favorite_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
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
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
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

-- 6) RPCs (with search_path)
CREATE OR REPLACE FUNCTION public.mark_product_view(pid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.product_analytics(product_id, views) VALUES (pid, 1)
  ON CONFLICT (product_id) DO UPDATE
  SET views = public.product_analytics.views + 1,
      trend_score = (public.product_analytics.views + 1) + 2*favorites + 10*recent_reviews,
      updated_at = now();
END
$fn$;

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

CREATE OR REPLACE FUNCTION public.add_review(pid uuid, rating int, body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  INSERT INTO public.product_reviews(product_id, user_id, rating, body)
  VALUES (pid, auth.uid(), rating, body);
END
$fn$;

CREATE OR REPLACE FUNCTION public.list_reviews(pid uuid, lim int DEFAULT 20, off int DEFAULT 0)
RETURNS SETOF public.product_reviews
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT * FROM public.product_reviews
  WHERE product_id = pid
  ORDER BY created_at DESC
  LIMIT lim OFFSET off;
$$;

GRANT EXECUTE ON FUNCTION public.mark_product_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_favorite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_review(uuid,int,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_reviews(uuid,int,int) TO anon, authenticated;

-- 7) Views using product_images as primary image source
CREATE OR REPLACE VIEW public.v_market_cards AS
SELECT
  p.id AS product_id,
  p.slug,
  p.name AS title,
  p.description,
  (p.base_price * 100)::int AS price_cents,
  'USD' AS currency,
  (
    SELECT pi.url FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.display_order ASC, pi.created_at ASC
    LIMIT 1
  ) AS primary_image,
  COALESCE(pa.avg_rating, 0) AS avg_rating,
  COALESCE(pa.reviews_count, 0) AS reviews_count,
  COALESCE(pa.views, 0) AS views,
  COALESCE(pa.favorites, 0) AS favorites,
  COALESCE(pa.trend_score, 0) AS trend_score,
  p.created_at,
  p.status,
  EXISTS (
    SELECT 1 FROM public.product_badges b 
    WHERE b.product_id = p.id AND b.key = 'new' AND (b.expires_at IS NULL OR b.expires_at > now())
  ) AS has_badge_new,
  EXISTS (
    SELECT 1 FROM public.product_badges b 
    WHERE b.product_id = p.id AND b.key = 'trending' AND (b.expires_at IS NULL OR b.expires_at > now())
  ) AS has_badge_trending,
  EXISTS (
    SELECT 1 FROM public.product_badges b 
    WHERE b.product_id = p.id AND b.key = 'low_stock' AND (b.expires_at IS NULL OR b.expires_at > now())
  ) AS has_badge_low_stock
FROM public.products p
LEFT JOIN public.product_analytics pa ON pa.product_id = p.id
WHERE p.status = 'active';

GRANT SELECT ON public.v_market_cards TO public;

CREATE OR REPLACE VIEW public.v_product_detail AS
SELECT
  p.*,
  COALESCE(pa.avg_rating, 0) AS avg_rating,
  COALESCE(pa.reviews_count, 0) AS reviews_count,
  COALESCE(pa.views, 0) AS views,
  COALESCE(pa.favorites, 0) AS favorites,
  COALESCE(pa.trend_score, 0) AS trend_score
FROM public.products p
LEFT JOIN public.product_analytics pa ON pa.product_id = p.id;

GRANT SELECT ON public.v_product_detail TO public;

-- 8) Main listing RPC with filters
CREATE OR REPLACE FUNCTION public.list_market_cards(
  tab text DEFAULT 'all', 
  q text DEFAULT NULL, 
  filters jsonb DEFAULT '{}'::jsonb, 
  lim int DEFAULT 24, 
  off int DEFAULT 0
)
RETURNS SETOF public.v_market_cards
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
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
      WHEN 'saved' THEN EXISTS (
        SELECT 1 FROM public.favorites f WHERE f.user_id = auth.uid() AND f.product_id = b.product_id
      )
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

GRANT EXECUTE ON FUNCTION public.list_market_cards(text,text,jsonb,int,int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_product_detail(pid uuid)
RETURNS public.v_product_detail
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT * FROM public.v_product_detail WHERE id = pid;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_detail(uuid) TO public;