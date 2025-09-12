-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('post_liked', 'comment_added', 'user_followed', 'post_reacted')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'user')),
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reports table for moderation
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create post_reactions table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id, reaction_type)
);

-- Create post_media table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- RLS Policies for reports
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

-- RLS Policies for saved_posts
CREATE POLICY "Users can manage their own saved posts" ON public.saved_posts
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for post_reactions
CREATE POLICY "Post reactions are publicly readable" ON public.post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON public.post_reactions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for post_media
CREATE POLICY "Post media is publicly readable" ON public.post_media
  FOR SELECT USING (true);

CREATE POLICY "Users can manage media for their own posts" ON public.post_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_media.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  recipient UUID,
  actor UUID,
  notification_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't create notification if actor is the same as recipient
  IF actor = recipient THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (recipient_id, actor_id, type, entity_type, entity_id, metadata)
  VALUES (recipient, actor, notification_type, entity_type, entity_id, metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for post likes
CREATE OR REPLACE FUNCTION public.notify_post_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  
  -- Create notification
  PERFORM public.create_notification(
    post_owner,
    NEW.user_id,
    'post_liked',
    'post',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION public.notify_comment_added()
RETURNS TRIGGER  
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  
  -- Create notification
  PERFORM public.create_notification(
    post_owner,
    NEW.user_id,
    'comment_added',
    'comment',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for follows
CREATE OR REPLACE FUNCTION public.notify_user_followed()
RETURNS TRIGGER
LANGUAGE plpgsql  
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification
  PERFORM public.create_notification(
    NEW.followee_id,
    NEW.follower_id,
    'user_followed',
    'user',
    NEW.follower_id
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_notify_post_liked
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_liked();

CREATE TRIGGER trigger_notify_comment_added
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_comment_added();

CREATE TRIGGER trigger_notify_user_followed
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_user_followed();

-- Function to get following feed
CREATE OR REPLACE FUNCTION public.get_following_feed_posts(limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID, user_id UUID, content TEXT, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT, display_name TEXT, avatar_url TEXT, likes_count BIGINT, comments_count BIGINT,
  is_liked_by_user BOOLEAN, media_urls TEXT[], media_types TEXT[], is_saved_by_user BOOLEAN,
  reactions_summary JSONB, user_reaction TEXT
)
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
  LEFT JOIN (SELECT post_id, COUNT(*) as count FROM public.post_likes GROUP BY post_id) like_counts ON like_counts.post_id = p.id
  LEFT JOIN (SELECT post_id, COUNT(*) as count FROM public.comments GROUP BY post_id) comment_counts ON comment_counts.post_id = p.id
  LEFT JOIN (SELECT post_id, TRUE as liked FROM public.post_likes WHERE user_id = auth.uid()) user_likes ON user_likes.post_id = p.id
  LEFT JOIN (SELECT post_id, TRUE as saved FROM public.saved_posts WHERE user_id = auth.uid()) user_saves ON user_saves.post_id = p.id
  LEFT JOIN (SELECT post_id, array_agg(media_url ORDER BY display_order) as urls, array_agg(media_type ORDER BY display_order) as types FROM public.post_media GROUP BY post_id) media_agg ON media_agg.post_id = p.id
  LEFT JOIN (SELECT post_id, jsonb_object_agg(reaction_type, count) as summary FROM (SELECT post_id, reaction_type, COUNT(*) as count FROM public.post_reactions GROUP BY post_id, reaction_type) reaction_counts GROUP BY post_id) reactions_agg ON reactions_agg.post_id = p.id
  LEFT JOIN (SELECT post_id, reaction_type FROM public.post_reactions WHERE user_id = auth.uid()) user_reactions ON user_reactions.post_id = p.id
  WHERE p.user_id IN (SELECT followee_id FROM public.follows WHERE follower_id = auth.uid())
  ORDER BY p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Function to get saved posts
CREATE OR REPLACE FUNCTION public.get_saved_posts(limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID, user_id UUID, content TEXT, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT, display_name TEXT, avatar_url TEXT, likes_count BIGINT, comments_count BIGINT,
  is_liked_by_user BOOLEAN, media_urls TEXT[], media_types TEXT[], is_saved_by_user BOOLEAN,
  reactions_summary JSONB, user_reaction TEXT
)
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
  LEFT JOIN (SELECT post_id, COUNT(*) as count FROM public.post_likes GROUP BY post_id) like_counts ON like_counts.post_id = p.id
  LEFT JOIN (SELECT post_id, COUNT(*) as count FROM public.comments GROUP BY post_id) comment_counts ON comment_counts.post_id = p.id
  LEFT JOIN (SELECT post_id, TRUE as liked FROM public.post_likes WHERE user_id = auth.uid()) user_likes ON user_likes.post_id = p.id
  LEFT JOIN (SELECT post_id, array_agg(media_url ORDER BY display_order) as urls, array_agg(media_type ORDER BY display_order) as types FROM public.post_media GROUP BY post_id) media_agg ON media_agg.post_id = p.id
  LEFT JOIN (SELECT post_id, jsonb_object_agg(reaction_type, count) as summary FROM (SELECT post_id, reaction_type, COUNT(*) as count FROM public.post_reactions GROUP BY post_id, reaction_type) reaction_counts GROUP BY post_id) reactions_agg ON reactions_agg.post_id = p.id
  LEFT JOIN (SELECT post_id, reaction_type FROM public.post_reactions WHERE user_id = auth.uid()) user_reactions ON user_reactions.post_id = p.id
  INNER JOIN public.saved_posts sp ON sp.post_id = p.id AND sp.user_id = auth.uid()
  ORDER BY sp.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Function to toggle saved posts
CREATE OR REPLACE FUNCTION public.toggle_post_save(post_id_param UUID)
RETURNS BOOLEAN
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