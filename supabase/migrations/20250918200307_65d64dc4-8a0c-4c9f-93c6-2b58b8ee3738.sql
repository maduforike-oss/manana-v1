-- Phase 1: Enhanced Database Functions for Complete Product Management

-- Update list_market_cards to include creator profile information
DROP FUNCTION IF EXISTS public.list_market_cards(text, text, jsonb, integer, integer);

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
  has_badge_low_stock boolean,
  -- Creator information
  creator_id uuid,
  creator_username text,
  creator_display_name text,
  creator_avatar_url text
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

-- Create comprehensive product detail function
CREATE OR REPLACE FUNCTION public.get_product_detail(pid uuid)
RETURNS TABLE(
  -- Product info
  product_id uuid,
  slug text,
  name text,
  description text,
  base_price numeric,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  -- Creator info
  creator_id uuid,
  creator_username text,
  creator_display_name text,
  creator_avatar_url text,
  creator_bio text,
  -- Category info
  category_id uuid,
  category_name text,
  category_slug text,
  -- Analytics
  total_views integer,
  total_favorites bigint,
  avg_rating numeric,
  total_reviews bigint,
  -- Images (JSON array)
  images jsonb,
  -- Variants (JSON array)
  variants jsonb,
  -- Reviews (JSON array - limited)
  recent_reviews jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.slug,
    p.name,
    p.description,
    p.base_price,
    p.status,
    p.created_at,
    p.updated_at,
    -- Creator
    prof.id as creator_id,
    prof.username as creator_username,
    prof.display_name as creator_display_name,
    prof.avatar_url as creator_avatar_url,
    prof.bio as creator_bio,
    -- Category
    cat.id as category_id,
    cat.name as category_name,
    cat.slug as category_slug,
    -- Analytics
    COALESCE(pa.views, 0) as total_views,
    COALESCE(fav_count.count, 0) as total_favorites,
    COALESCE(review_stats.avg_rating, 0::numeric) as avg_rating,
    COALESCE(review_stats.total_reviews, 0::bigint) as total_reviews,
    -- Images
    COALESCE(image_data.images, '[]'::jsonb) as images,
    -- Variants
    COALESCE(variant_data.variants, '[]'::jsonb) as variants,
    -- Recent reviews
    COALESCE(review_data.reviews, '[]'::jsonb) as recent_reviews
  FROM products p
  LEFT JOIN profiles prof ON prof.id = p.owner_id
  LEFT JOIN categories cat ON cat.id = p.category_id
  LEFT JOIN product_analytics pa ON pa.product_id = p.id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as count
    FROM favorites
    GROUP BY product_id
  ) fav_count ON fav_count.product_id = p.id
  LEFT JOIN (
    SELECT 
      product_id,
      AVG(rating) as avg_rating,
      COUNT(*) as total_reviews
    FROM product_reviews
    GROUP BY product_id
  ) review_stats ON review_stats.product_id = p.id::text
  LEFT JOIN (
    SELECT 
      product_id,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'url', url,
          'alt_text', alt_text,
          'display_order', display_order,
          'variant_id', variant_id
        ) ORDER BY display_order
      ) as images
    FROM product_images
    GROUP BY product_id
  ) image_data ON image_data.product_id = p.id
  LEFT JOIN (
    SELECT 
      product_id,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'sku', sku,
          'price', price,
          'size', size,
          'color', color,
          'stock_quantity', stock_quantity,
          'image_url', image_url
        ) ORDER BY size, color
      ) as variants
    FROM product_variants
    GROUP BY product_id
  ) variant_data ON variant_data.product_id = p.id
  LEFT JOIN (
    SELECT 
      pr.product_id,
      jsonb_agg(
        jsonb_build_object(
          'id', pr.id,
          'rating', pr.rating,
          'title', pr.title,
          'comment', pr.comment,
          'created_at', pr.created_at,
          'user_display_name', COALESCE(prof.display_name, prof.username, 'Anonymous'),
          'user_avatar_url', prof.avatar_url
        ) ORDER BY pr.created_at DESC
      ) as reviews
    FROM (
      SELECT * FROM product_reviews pr_inner ORDER BY created_at DESC LIMIT 5
    ) pr
    LEFT JOIN profiles prof ON prof.id = pr.user_id
    GROUP BY pr.product_id
  ) review_data ON review_data.product_id = p.id::text
  WHERE p.id = pid
  LIMIT 1;
END;
$$;

-- Create function for managing product images (front/back views)
CREATE OR REPLACE FUNCTION public.get_product_images_with_views(pid uuid)
RETURNS TABLE(
  image_id uuid,
  url text,
  alt_text text,
  display_order integer,
  variant_id uuid,
  view_type text, -- 'front', 'back', 'side', 'detail'
  color_variant text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id as image_id,
    pi.url,
    pi.alt_text,
    pi.display_order,
    pi.variant_id,
    CASE 
      WHEN pi.url LIKE '%front%' OR pi.display_order = 0 THEN 'front'
      WHEN pi.url LIKE '%back%' THEN 'back'
      WHEN pi.url LIKE '%side%' THEN 'side'
      ELSE 'detail'
    END as view_type,
    COALESCE(pv.color, 'default') as color_variant,
    pi.created_at
  FROM product_images pi
  LEFT JOIN product_variants pv ON pv.id = pi.variant_id
  WHERE pi.product_id = pid
  ORDER BY pi.display_order, pi.created_at;
END;
$$;

-- Create function for product management operations
CREATE OR REPLACE FUNCTION public.create_product_with_variants(
  product_name text,
  product_slug text,
  product_description text DEFAULT NULL,
  base_price_val numeric DEFAULT 0,
  category_id_val uuid DEFAULT NULL,
  variants_data jsonb DEFAULT '[]'::jsonb,
  images_data jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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