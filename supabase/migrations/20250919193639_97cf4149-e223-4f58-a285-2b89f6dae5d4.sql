-- ========================================
-- FIX LAST 3 SEARCH PATH FUNCTIONS
-- ========================================

-- Fix get_product_detail function
CREATE OR REPLACE FUNCTION public.get_product_detail(pid uuid)
RETURNS TABLE(product_id uuid, slug text, name text, description text, base_price numeric, status text, created_at timestamp with time zone, updated_at timestamp with time zone, creator_id uuid, creator_username text, creator_display_name text, creator_avatar_url text, creator_bio text, category_id uuid, category_name text, category_slug text, total_views integer, total_favorites bigint, avg_rating numeric, total_reviews bigint, images jsonb, variants jsonb, recent_reviews jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix get_product_images_with_views function
CREATE OR REPLACE FUNCTION public.get_product_images_with_views(pid uuid)
RETURNS TABLE(image_id uuid, url text, alt_text text, display_order integer, variant_id uuid, view_type text, color_variant text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix set_order_number function
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;