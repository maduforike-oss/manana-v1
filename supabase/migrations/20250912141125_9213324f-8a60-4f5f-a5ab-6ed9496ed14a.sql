-- Fix SQL ambiguous column references in community functions
DROP FUNCTION IF EXISTS public.get_feed_posts(integer, integer);
DROP FUNCTION IF EXISTS public.get_following_feed_posts(integer, integer);
DROP FUNCTION IF EXISTS public.get_saved_posts(integer, integer);

-- Recreate get_feed_posts with fixed column references
CREATE OR REPLACE FUNCTION public.get_feed_posts(limit_count integer DEFAULT 100)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  content text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone,
  username text, 
  display_name text, 
  avatar_url text, 
  likes_count bigint, 
  comments_count bigint, 
  is_liked_by_user boolean,
  media_urls text[], 
  media_types text[], 
  is_saved_by_user boolean, 
  reactions_summary jsonb, 
  user_reaction text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Recreate get_following_feed_posts with fixed column references
CREATE OR REPLACE FUNCTION public.get_following_feed_posts(limit_count integer DEFAULT 100)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  content text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone,
  username text, 
  display_name text, 
  avatar_url text, 
  likes_count bigint, 
  comments_count bigint, 
  is_liked_by_user boolean,
  media_urls text[], 
  media_types text[], 
  is_saved_by_user boolean, 
  reactions_summary jsonb, 
  user_reaction text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Recreate get_saved_posts with fixed column references  
CREATE OR REPLACE FUNCTION public.get_saved_posts(limit_count integer DEFAULT 100)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  content text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone,
  username text, 
  display_name text, 
  avatar_url text, 
  likes_count bigint, 
  comments_count bigint, 
  is_liked_by_user boolean,
  media_urls text[], 
  media_types text[], 
  is_saved_by_user boolean, 
  reactions_summary jsonb, 
  user_reaction text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;