-- Add created_at to the view for compatibility
drop view if exists public.me_profile_full;

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
  p.created_at,
  pm.total_designs,
  pm.followers,
  pm.following,
  pm.updated_at          as metrics_updated_at
from public.profiles p
join public.profile_metrics pm on pm.user_id = p.id;

grant select on public.me_profile_full to authenticated;