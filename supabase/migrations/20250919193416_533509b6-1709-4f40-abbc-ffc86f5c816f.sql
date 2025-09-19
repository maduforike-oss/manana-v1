-- ========================================
-- FIX REMAINING SECURITY VULNERABILITIES
-- ========================================
-- 
-- Fix the remaining Function Search Path Mutable warnings

-- Fix toggle_post_like function
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

-- Fix create_post function
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

-- Fix create_comment function
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

-- Fix toggle_post_save function
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