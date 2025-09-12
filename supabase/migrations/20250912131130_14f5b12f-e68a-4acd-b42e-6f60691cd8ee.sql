-- Community API v2: Media uploads, saves, emoji reactions

-- Create post_media table for images and videos
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for videos
  thumbnail_url TEXT, -- for videos
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_posts table for bookmarking
CREATE TABLE public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_reactions table for emoji reactions
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_media
CREATE POLICY "Post media is publicly readable" ON public.post_media
  FOR SELECT USING (true);

CREATE POLICY "Users can upload media to their posts" ON public.post_media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" ON public.post_media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON public.post_media
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_posts
CREATE POLICY "Users can view their own saved posts" ON public.saved_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON public.saved_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own saved posts" ON public.saved_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_reactions
CREATE POLICY "Post reactions are publicly readable" ON public.post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.post_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX idx_post_media_user_id ON public.post_media(user_id);
CREATE INDEX idx_post_media_display_order ON public.post_media(post_id, display_order);
CREATE INDEX idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX idx_saved_posts_created_at ON public.saved_posts(user_id, created_at DESC);
CREATE INDEX idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON public.post_reactions(user_id);

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post media uploads
CREATE POLICY "Post media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload their own post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own post media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update get_feed_posts function to include media and reactions
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

-- Create RPCs for new functionality
CREATE OR REPLACE FUNCTION public.toggle_post_save(post_id_param UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.toggle_post_reaction(post_id_param UUID, reaction_type_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  reaction_exists BOOLEAN;
BEGIN
  -- Check if reaction already exists
  SELECT EXISTS(
    SELECT 1 FROM public.post_reactions 
    WHERE post_id = post_id_param AND user_id = auth.uid() AND reaction_type = reaction_type_param
  ) INTO reaction_exists;
  
  IF reaction_exists THEN
    -- Remove reaction
    DELETE FROM public.post_reactions 
    WHERE post_id = post_id_param AND user_id = auth.uid() AND reaction_type = reaction_type_param;
    RETURN FALSE;
  ELSE
    -- Remove any existing reaction from this user on this post, then add new one
    DELETE FROM public.post_reactions 
    WHERE post_id = post_id_param AND user_id = auth.uid();
    
    INSERT INTO public.post_reactions (post_id, user_id, reaction_type)
    VALUES (post_id_param, auth.uid(), reaction_type_param);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.upload_post_media(
  post_id_param UUID, 
  media_url_param TEXT, 
  media_type_param TEXT,
  file_size_param BIGINT DEFAULT NULL,
  width_param INTEGER DEFAULT NULL,
  height_param INTEGER DEFAULT NULL,
  alt_text_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  media_id UUID;
  max_order INTEGER;
BEGIN
  -- Get the next display order
  SELECT COALESCE(MAX(display_order), -1) + 1 
  INTO max_order
  FROM public.post_media 
  WHERE post_id = post_id_param;
  
  INSERT INTO public.post_media (
    post_id, user_id, media_url, media_type, file_size, 
    width, height, alt_text, display_order
  )
  VALUES (
    post_id_param, auth.uid(), media_url_param, media_type_param, 
    file_size_param, width_param, height_param, alt_text_param, max_order
  )
  RETURNING id INTO media_id;
  
  RETURN media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.toggle_post_save(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_post_reaction(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upload_post_media(UUID, TEXT, TEXT, BIGINT, INTEGER, INTEGER, TEXT) TO authenticated;