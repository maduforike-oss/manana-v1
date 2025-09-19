-- ========================================
-- FIX FINAL SECURITY VULNERABILITIES  
-- ========================================
-- 
-- Fix the last remaining Function Search Path Mutable warnings

-- Fix create_product_with_variants function
CREATE OR REPLACE FUNCTION public.create_product_with_variants(product_name text, product_slug text, product_description text DEFAULT NULL::text, base_price_val numeric DEFAULT 0, category_id_val uuid DEFAULT NULL::uuid, variants_data jsonb DEFAULT '[]'::jsonb, images_data jsonb DEFAULT '[]'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_product_id uuid;
  variant_item jsonb;
  image_item jsonb;
  new_variant_id uuid;
BEGIN
  -- Create the product
  INSERT INTO products (
    name, slug, description, base_price, category_id, owner_id, status
  ) VALUES (
    product_name, product_slug, product_description, base_price_val, category_id_val, auth.uid(), 'active'
  ) RETURNING id INTO new_product_id;

  -- Create variants if provided
  FOR variant_item IN SELECT * FROM jsonb_array_elements(variants_data)
  LOOP
    INSERT INTO product_variants (
      product_id, sku, price, size, color, stock_quantity
    ) VALUES (
      new_product_id,
      variant_item->>'sku',
      (variant_item->>'price')::numeric,
      variant_item->>'size',
      variant_item->>'color',
      COALESCE((variant_item->>'stock_quantity')::integer, 0)
    ) RETURNING id INTO new_variant_id;
  END LOOP;

  -- Create images if provided
  FOR image_item IN SELECT * FROM jsonb_array_elements(images_data)
  LOOP
    INSERT INTO product_images (
      product_id, url, alt_text, display_order, variant_id
    ) VALUES (
      new_product_id,
      image_item->>'url',
      image_item->>'alt_text',
      COALESCE((image_item->>'display_order')::integer, 0),
      CASE WHEN image_item->>'variant_id' != '' THEN (image_item->>'variant_id')::uuid ELSE NULL END
    );
  END LOOP;

  -- Initialize analytics
  INSERT INTO product_analytics (product_id, views, clicks, conversions) 
  VALUES (new_product_id, 0, 0, 0)
  ON CONFLICT (product_id) DO NOTHING;

  RETURN new_product_id;
END;
$$;

-- Fix set_my_profile function
CREATE OR REPLACE FUNCTION public.set_my_profile(patch jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  allowed jsonb := patch - 'id';
begin
  update public.profiles p
  set
    display_name      = coalesce(allowed->>'display_name', p.display_name),
    username          = coalesce(allowed->>'username', p.username),
    bio               = coalesce(allowed->>'bio', p.bio),
    location          = coalesce(allowed->>'location', p.location),
    website           = coalesce(allowed->>'website', p.website),
    social_instagram  = coalesce(allowed->>'social_instagram', p.social_instagram),
    social_twitter    = coalesce(allowed->>'social_twitter', p.social_twitter),
    cover_url         = coalesce(allowed->>'cover_url', p.cover_url),
    avatar_url        = coalesce(allowed->>'avatar_url', p.avatar_url),
    preferences       = coalesce((allowed->'preferences')::jsonb, p.preferences)
  where p.id = auth.uid();
end
$$;

-- Fix get_feed_posts function
CREATE OR REPLACE FUNCTION public.get_feed_posts(limit_count integer DEFAULT 100)
RETURNS TABLE(id uuid, user_id uuid, content text, created_at timestamp with time zone, updated_at timestamp with time zone, username text, display_name text, avatar_url text, likes_count bigint, comments_count bigint, is_liked_by_user boolean, media_urls text[], media_types text[], is_saved_by_user boolean, reactions_summary jsonb, user_reaction text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.created_at,
    p.updated_at,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    COALESCE(like_counts.count, 0) as likes_count,
    COALESCE(comment_counts.count, 0) as comments_count,
    COALESCE(user_likes.liked, FALSE) as is_liked_by_user,
    COALESCE(media_agg.urls, ARRAY[]::TEXT[]) as media_urls,
    COALESCE(media_agg.types, ARRAY[]::TEXT[]) as media_types,
    COALESCE(user_saves.saved, FALSE) as is_saved_by_user,
    COALESCE(reactions_agg.summary, '{}'::JSONB) as reactions_summary,
    user_reactions.reaction_type as user_reaction
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  LEFT JOIN (
    SELECT pl.post_id, COUNT(*) as count
    FROM public.post_likes pl
    GROUP BY pl.post_id
  ) like_counts ON like_counts.post_id = p.id
  LEFT JOIN (
    SELECT c.post_id, COUNT(*) as count
    FROM public.comments c
    GROUP BY c.post_id
  ) comment_counts ON comment_counts.post_id = p.id
  LEFT JOIN (
    SELECT pl.post_id, TRUE as liked
    FROM public.post_likes pl
    WHERE pl.user_id = auth.uid()
  ) user_likes ON user_likes.post_id = p.id
  LEFT JOIN (
    SELECT sp.post_id, TRUE as saved
    FROM public.saved_posts sp
    WHERE sp.user_id = auth.uid()
  ) user_saves ON user_saves.post_id = p.id
  LEFT JOIN (
    SELECT 
      pm.post_id,
      array_agg(pm.media_url ORDER BY pm.display_order) as urls,
      array_agg(pm.media_type ORDER BY pm.display_order) as types
    FROM public.post_media pm
    GROUP BY pm.post_id
  ) media_agg ON media_agg.post_id = p.id
  LEFT JOIN (
    SELECT 
      pr_sub.post_id,
      jsonb_object_agg(pr_sub.reaction_type, pr_sub.count) as summary
    FROM (
      SELECT pr_inner.post_id, pr_inner.reaction_type, COUNT(*) as count
      FROM public.post_reactions pr_inner
      GROUP BY pr_inner.post_id, pr_inner.reaction_type
    ) pr_sub
    GROUP BY pr_sub.post_id
  ) reactions_agg ON reactions_agg.post_id = p.id
  LEFT JOIN (
    SELECT pr_user.post_id, pr_user.reaction_type
    FROM public.post_reactions pr_user
    WHERE pr_user.user_id = auth.uid()
  ) user_reactions ON user_reactions.post_id = p.id
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Fix get_following_feed_posts function  
CREATE OR REPLACE FUNCTION public.get_following_feed_posts(limit_count integer DEFAULT 100)
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
    COALESCE(user_saves.saved, FALSE) as is_saved_by_user,
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
    SELECT sp.post_id, TRUE as saved FROM public.saved_posts sp WHERE sp.user_id = auth.uid()
  ) user_saves ON user_saves.post_id = p.id
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
  WHERE p.user_id IN (SELECT f.followee_id FROM public.follows f WHERE f.follower_id = auth.uid())
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;