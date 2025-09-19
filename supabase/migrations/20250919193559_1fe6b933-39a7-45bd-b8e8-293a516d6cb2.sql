-- ========================================
-- FIX REMAINING SEARCH PATH ISSUES
-- ========================================
-- 
-- Fix the last remaining functions

-- Fix get_saved_posts function
CREATE OR REPLACE FUNCTION public.get_saved_posts(limit_count integer DEFAULT 100)
RETURNS TABLE(id uuid, user_id uuid, content text, created_at timestamp with time zone, updated_at timestamp with time zone, username text, display_name text, avatar_url text, likes_count bigint, comments_count bigint, is_liked_by_user boolean, media_urls text[], media_types text[], is_saved_by_user boolean, reactions_summary jsonb, user_reaction text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.content, p.created_at, p.updated_at,
    pr.username, pr.display_name, pr.avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    COALESCE(comment_counts.count, 0) as comments_count,
    COALESCE(user_likes.liked, FALSE) as is_liked_by_user,
    COALESCE(media_agg.urls, ARRAY[]::TEXT[]) as media_urls,
    COALESCE(media_agg.types, ARRAY[]::TEXT[]) as media_types,
    TRUE as is_saved_by_user,
    COALESCE(reactions_agg.summary, '{}'::JSONB) as reactions_summary,
    user_reactions.reaction_type as user_reaction
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  LEFT JOIN (
    SELECT pl.post_id, COUNT(*) as count FROM public.post_likes pl GROUP BY pl.post_id
  ) like_counts ON like_counts.post_id = p.id
  LEFT JOIN (
    SELECT c.post_id, COUNT(*) as count FROM public.comments c GROUP BY c.post_id
  ) comment_counts ON comment_counts.post_id = p.id
  LEFT JOIN (
    SELECT pl.post_id, TRUE as liked FROM public.post_likes pl WHERE pl.user_id = auth.uid()
  ) user_likes ON user_likes.post_id = p.id
  LEFT JOIN (
    SELECT pm.post_id, array_agg(pm.media_url ORDER BY pm.display_order) as urls, array_agg(pm.media_type ORDER BY pm.display_order) as types 
    FROM public.post_media pm GROUP BY pm.post_id
  ) media_agg ON media_agg.post_id = p.id
  LEFT JOIN (
    SELECT pr_sub.post_id, jsonb_object_agg(pr_sub.reaction_type, pr_sub.count) as summary 
    FROM (
      SELECT pr_inner.post_id, pr_inner.reaction_type, COUNT(*) as count FROM public.post_reactions pr_inner GROUP BY pr_inner.post_id, pr_inner.reaction_type
    ) pr_sub GROUP BY pr_sub.post_id
  ) reactions_agg ON reactions_agg.post_id = p.id
  LEFT JOIN (
    SELECT pr_user.post_id, pr_user.reaction_type FROM public.post_reactions pr_user WHERE pr_user.user_id = auth.uid()
  ) user_reactions ON user_reactions.post_id = p.id
  INNER JOIN public.saved_posts sp ON sp.post_id = p.id AND sp.user_id = auth.uid()
  ORDER BY sp.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Fix get_post_comments function
CREATE OR REPLACE FUNCTION public.get_post_comments(post_id_param uuid, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, post_id uuid, user_id uuid, content text, created_at timestamp with time zone, updated_at timestamp with time zone, username text, display_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    c.updated_at,
    pr.username,
    pr.display_name,
    pr.avatar_url
  FROM public.comments c
  LEFT JOIN public.profiles pr ON pr.id = c.user_id
  WHERE c.post_id = post_id_param
  ORDER BY c.created_at ASC
  LIMIT limit_count;
END;
$$;

-- Fix list_market_cards function
CREATE OR REPLACE FUNCTION public.list_market_cards(tab text DEFAULT 'all'::text, q text DEFAULT NULL::text, filters jsonb DEFAULT '{}'::jsonb, lim integer DEFAULT 24, off integer DEFAULT 0)
RETURNS TABLE(product_id text, slug text, title text, description text, price_cents integer, currency text, primary_image text, avg_rating numeric, reviews_count bigint, views integer, favorites bigint, trend_score numeric, created_at timestamp with time zone, status text, has_badge_new boolean, has_badge_trending boolean, has_badge_low_stock boolean, creator_id uuid, creator_username text, creator_display_name text, creator_avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    )) as has_badge_low_stock,
    -- Creator info
    prof.id as creator_id,
    prof.username as creator_username,
    prof.display_name as creator_display_name,
    prof.avatar_url as creator_avatar_url
  FROM products p
  LEFT JOIN profiles prof ON prof.id = p.owner_id
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

-- Fix generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN 'MN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$;