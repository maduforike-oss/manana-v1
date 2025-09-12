-- Fix security issues: add SET search_path to all functions and fix the view
drop view if exists public.me_profile_full;

-- Create the view without SECURITY DEFINER (views don't need it, they use RLS of underlying tables)
create or replace view public.me_profile_full as
select
  p.id                     as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.cover_url,
  p.bio,
  p.location,
  p.website,
  p.social_instagram,
  p.social_twitter,
  p.preferences,
  pm.total_designs,
  pm.followers,
  pm.following,
  pm.updated_at          as metrics_updated_at
from public.profiles p
join public.profile_metrics pm on pm.user_id = p.id;

grant select on public.me_profile_full to authenticated;

-- 1) Username availability (case-insensitive), exclude self - ADD SET search_path
create or replace function public.is_username_available(username_to_check text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles p
    where lower(p.username) = lower(username_to_check)
      and p.id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );
$$;

-- 2) Get my profile (joined view) - ADD SET search_path
create or replace function public.get_my_profile()
returns public.me_profile_full
language sql
security definer
stable
set search_path = public
as $$
  select *
  from public.me_profile_full
  where user_id = auth.uid();
$$;

-- 3) Get a public profile by username - ADD SET search_path
create or replace function public.get_public_profile(u text)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  website text,
  social_instagram text,
  social_twitter text,
  followers int,
  following int
)
language sql
security definer
stable
set search_path = public
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.location,
    p.website,
    p.social_instagram,
    p.social_twitter,
    pm.followers,
    pm.following
  from public.profiles p
  join public.profile_metrics pm on pm.user_id = p.id
  where lower(p.username) = lower(u)
  limit 1;
$$;

-- 4) Update my profile - ADD SET search_path
create or replace function public.set_my_profile(patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
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
$fn$;

-- 5) List followers - ADD SET search_path
create or replace function public.list_followers(target uuid, lim int default 20, off int default 0)
returns table (follower_id uuid, created_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select f.follower_id, f.created_at
  from public.follows f
  where f.followee_id = target
  order by f.created_at desc
  limit lim offset off;
$$;

-- 6) List following - ADD SET search_path
create or replace function public.list_following(target uuid, lim int default 20, off int default 0)
returns table (followee_id uuid, created_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select f.followee_id, f.created_at
  from public.follows f
  where f.follower_id = target
  order by f.created_at desc
  limit lim offset off;
$$;