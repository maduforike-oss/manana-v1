-- Fix remaining security issues

-- Fix all remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.create_post(content_text text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_post_id UUID;
BEGIN
  INSERT INTO public.posts (user_id, content)
  VALUES (auth.uid(), content_text)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_post_like(post_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM public.post_likes 
    WHERE post_id = post_id_param AND user_id = auth.uid()
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM public.post_likes 
    WHERE post_id = post_id_param AND user_id = auth.uid();
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (post_id_param, auth.uid());
    RETURN TRUE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_comment(post_id_param uuid, content_text text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_comment_id UUID;
BEGIN
  INSERT INTO public.comments (post_id, user_id, content)
  VALUES (post_id_param, auth.uid(), content_text)
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.get_feed_posts(limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
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
    SELECT post_id, COUNT(*) as count
    FROM public.post_likes
    GROUP BY post_id
  ) like_counts ON like_counts.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM public.comments
    GROUP BY post_id
  ) comment_counts ON comment_counts.post_id = p.id
  LEFT JOIN (
    SELECT post_id, TRUE as liked
    FROM public.post_likes
    WHERE user_id = auth.uid()
  ) user_likes ON user_likes.post_id = p.id
  LEFT JOIN (
    SELECT post_id, TRUE as saved
    FROM public.saved_posts
    WHERE user_id = auth.uid()
  ) user_saves ON user_saves.post_id = p.id
  LEFT JOIN (
    SELECT 
      post_id,
      array_agg(media_url ORDER BY display_order) as urls,
      array_agg(media_type ORDER BY display_order) as types
    FROM public.post_media
    GROUP BY post_id
  ) media_agg ON media_agg.post_id = p.id
  LEFT JOIN (
    SELECT 
      post_id,
      jsonb_object_agg(reaction_type, count) as summary
    FROM (
      SELECT post_id, reaction_type, COUNT(*) as count
      FROM public.post_reactions
      GROUP BY post_id, reaction_type
    ) reaction_counts
    GROUP BY post_id
  ) reactions_agg ON reactions_agg.post_id = p.id
  LEFT JOIN (
    SELECT post_id, reaction_type
    FROM public.post_reactions
    WHERE user_id = auth.uid()
  ) user_reactions ON user_reactions.post_id = p.id
  ORDER BY p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_post_save(post_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  save_exists BOOLEAN;
BEGIN
  -- Check if save already exists
  SELECT EXISTS(
    SELECT 1 FROM public.saved_posts 
    WHERE post_id = post_id_param AND user_id = auth.uid()
  ) INTO save_exists;
  
  IF save_exists THEN
    -- Remove save
    DELETE FROM public.saved_posts 
    WHERE post_id = post_id_param AND user_id = auth.uid();
    RETURN FALSE;
  ELSE
    -- Add save
    INSERT INTO public.saved_posts (post_id, user_id)
    VALUES (post_id_param, auth.uid());
    RETURN TRUE;
  END IF;
END;
$$;