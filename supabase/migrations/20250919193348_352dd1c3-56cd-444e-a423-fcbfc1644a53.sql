-- ========================================
-- FIX ALL SECURITY VULNERABILITIES
-- ========================================
-- 
-- Fix Function Search Path Mutable warnings by adding SET search_path = public to all functions

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.profiles (id) VALUES (new.id);
  
  -- Create profile metrics entry
  INSERT INTO public.profile_metrics (user_id) VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Fix on_follow_created function
CREATE OR REPLACE FUNCTION public.on_follow_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- increment metrics for followee (their followers count)
  update public.profile_metrics
     set followers = followers + 1,
         updated_at = now()
   where user_id = new.followee_id;

  -- increment metrics for follower (their following count)
  update public.profile_metrics
     set following = following + 1,
         updated_at = now()
   where user_id = new.follower_id;

  -- optional activity log (if activity_events exists)
  if to_regclass('public.activity_events') is not null then
    insert into public.activity_events(user_id, kind, subject_id, metadata)
    values (new.follower_id, 'follow.created', new.followee_id, '{}'::jsonb);
  end if;

  return new;
end
$$;

-- Fix on_auth_user_created function
CREATE OR REPLACE FUNCTION public.on_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call existing handle_new_user function
  PERFORM public.handle_new_user();
  RETURN NEW;
END;
$$;

-- Fix on_follow_deleted function
CREATE OR REPLACE FUNCTION public.on_follow_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  update public.profile_metrics
     set followers = greatest(followers - 1, 0),
         updated_at = now()
   where user_id = old.followee_id;

  update public.profile_metrics
     set following = greatest(following - 1, 0),
         updated_at = now()
   where user_id = old.follower_id;

  if to_regclass('public.activity_events') is not null then
    insert into public.activity_events(user_id, kind, subject_id, metadata)
    values (old.follower_id, 'follow.deleted', old.followee_id, '{}'::jsonb);
  end if;

  return old;
end
$$;

-- Fix toggle_favorite function
CREATE OR REPLACE FUNCTION public.toggle_favorite(pid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u uuid := auth.uid();
  exists_row boolean;
BEGIN
  IF u IS NULL THEN
    RAISE EXCEPTION 'Auth required';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.favorites WHERE user_id = u AND product_id = pid) INTO exists_row;
  
  IF exists_row THEN
    DELETE FROM public.favorites WHERE user_id = u AND product_id = pid;
    RETURN false;
  ELSE
    INSERT INTO public.favorites(user_id, product_id) VALUES (u, pid) ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
END
$$;

-- Fix mark_product_view function
CREATE OR REPLACE FUNCTION public.mark_product_view(pid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.product_analytics(product_id, views) VALUES (pid, 1)
  ON CONFLICT (product_id) DO UPDATE SET views = public.product_analytics.views + 1, updated_at = now();
END
$$;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(recipient uuid, actor uuid, notification_type text, entity_type text, entity_id uuid, metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
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

-- Fix notify_post_liked function
CREATE OR REPLACE FUNCTION public.notify_post_liked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix notify_comment_added function
CREATE OR REPLACE FUNCTION public.notify_comment_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix notify_user_followed function
CREATE OR REPLACE FUNCTION public.notify_user_followed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix handle_new_user_metrics function
CREATE OR REPLACE FUNCTION public.handle_new_user_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profile_metrics (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end
$$;