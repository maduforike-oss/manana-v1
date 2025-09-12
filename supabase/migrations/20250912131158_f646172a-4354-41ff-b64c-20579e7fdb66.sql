-- Drop and recreate get_feed_posts function with new fields
DROP FUNCTION IF EXISTS public.get_feed_posts(INT, INT);

-- Create updated get_feed_posts function to include media and reactions
CREATE OR REPLACE FUNCTION public.get_feed_posts(limit_count INT DEFAULT 20, offset_count INT DEFAULT 0)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  likes_count BIGINT,
  comments_count BIGINT,
  is_liked_by_user BOOLEAN,
  media_urls TEXT[],
  media_types TEXT[],
  is_saved_by_user BOOLEAN,
  reactions_summary JSONB,
  user_reaction TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions  
GRANT EXECUTE ON FUNCTION public.get_feed_posts(INT, INT) TO authenticated, anon;