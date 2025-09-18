-- Create the list_market_cards function that the marketplace expects
CREATE OR REPLACE FUNCTION public.list_market_cards(
  tab text DEFAULT 'all',
  q text DEFAULT NULL,
  filters jsonb DEFAULT '{}',
  lim integer DEFAULT 24,
  off integer DEFAULT 0
)
RETURNS TABLE(
  product_id text,
  slug text,
  title text,
  description text,
  price_cents integer,
  currency text,
  primary_image text,
  avg_rating numeric,
  reviews_count bigint,
  views integer,
  favorites bigint,
  trend_score numeric,
  created_at timestamp with time zone,
  status text,
  has_badge_new boolean,
  has_badge_trending boolean,
  has_badge_low_stock boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::text as product_id,
    p.slug,
    p.name as title,
    p.description,
    (p.base_price * 100)::integer as price_cents,
    'USD'::text as currency,
    COALESCE(pi.url, '') as primary_image,
    COALESCE(pr_stats.avg_rating, 0::numeric) as avg_rating,
    COALESCE(pr_stats.reviews_count, 0::bigint) as reviews_count,
    COALESCE(pa.views, 0) as views,
    COALESCE(fav_stats.favorites, 0::bigint) as favorites,
    CASE 
      WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 100
      ELSE 50 + COALESCE(pa.views, 0) * 0.1 + COALESCE(fav_stats.favorites, 0) * 2
    END as trend_score,
    p.created_at,
    p.status,
    (p.created_at > NOW() - INTERVAL '7 days') as has_badge_new,
    (COALESCE(pa.views, 0) > 100 OR COALESCE(fav_stats.favorites, 0) > 10) as has_badge_trending,
    (EXISTS(
      SELECT 1 FROM product_variants pv 
      WHERE pv.product_id = p.id AND pv.stock_quantity < 5
    )) as has_badge_low_stock
  FROM products p
  LEFT JOIN (
    SELECT DISTINCT ON (pi1.product_id) 
      pi1.product_id, pi1.url
    FROM product_images pi1
    ORDER BY pi1.product_id, pi1.display_order
  ) pi ON pi.product_id = p.id
  LEFT JOIN (
    SELECT 
      pr1.product_id,
      AVG(pr1.rating) as avg_rating,
      COUNT(*) as reviews_count
    FROM product_reviews pr1
    GROUP BY pr1.product_id
  ) pr_stats ON pr_stats.product_id = p.id::text
  LEFT JOIN product_analytics pa ON pa.product_id = p.id
  LEFT JOIN (
    SELECT 
      f1.product_id,
      COUNT(*) as favorites
    FROM favorites f1
    GROUP BY f1.product_id
  ) fav_stats ON fav_stats.product_id = p.id
  WHERE 
    p.status = 'active'
    AND (q IS NULL OR (
      p.name ILIKE '%' || q || '%' 
      OR p.description ILIKE '%' || q || '%'
    ))
    AND (
      tab = 'all' 
      OR (tab = 'trending' AND (COALESCE(pa.views, 0) > 50 OR COALESCE(fav_stats.favorites, 0) > 5))
      OR (tab = 'new' AND p.created_at > NOW() - INTERVAL '7 days')
      OR (tab = 'saved' AND EXISTS(
        SELECT 1 FROM favorites f2 
        WHERE f2.product_id = p.id AND f2.user_id = auth.uid()
      ))
    )
  ORDER BY 
    CASE 
      WHEN tab = 'trending' THEN COALESCE(pa.views, 0) + COALESCE(fav_stats.favorites, 0) * 10
      WHEN tab = 'new' THEN EXTRACT(EPOCH FROM p.created_at)
      ELSE EXTRACT(EPOCH FROM p.created_at)
    END DESC
  LIMIT lim OFFSET off;
END;
$$;