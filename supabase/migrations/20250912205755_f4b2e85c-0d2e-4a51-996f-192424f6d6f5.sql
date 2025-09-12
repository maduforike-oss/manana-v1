-- Categories (global, public read)
create table if not exists garment_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Template images (one per image/view/color)
create table if not exists garment_template_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references garment_categories(id) on delete cascade,
  view text not null check (view in ('front','back','left','right','angle_left','angle_right')),
  color_slug text not null default 'white',
  storage_path text not null,
  width_px int not null,
  height_px int not null,
  dpi int not null default 300,
  print_area jsonb not null default jsonb_build_object('x',0,'y',0,'w',0,'h',0),
  safe_area  jsonb not null default jsonb_build_object('x',0,'y',0,'w',0,'h',0),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists idx_gti_category_view_color
  on garment_template_images(category_id, view, color_slug);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'uniq_template_by_cat_view_color'
  ) then
    alter table garment_template_images
      add constraint uniq_template_by_cat_view_color
      unique (category_id, view, color_slug);
  end if;
end$$;

-- Public bucket (only if missing)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'design-templates') then
    insert into storage.buckets (id, name, public) values ('design-templates', 'design-templates', true);
  end if;
end$$;

-- RLS: public read; staff-only writes
alter table garment_categories enable row level security;
alter table garment_template_images enable row level security;

create table if not exists staff_users ( user_id uuid primary key );

do $$
begin
  if not exists (select 1 from pg_policies where policyname='garment_categories_select_public') then
    create policy "garment_categories_select_public"
    on garment_categories for select
    to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname='garment_categories_write_staff') then
    create policy "garment_categories_write_staff"
    on garment_categories for all
    to authenticated
    using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
    with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where policyname='gti_select_public') then
    create policy "gti_select_public"
    on garment_template_images for select
    to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname='gti_write_staff') then
    create policy "gti_write_staff"
    on garment_template_images for all
    to authenticated
    using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
    with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
  end if;
end$$;

-- Storage policies (public read; staff write)
do $$
begin
  if not exists (select 1 from storage.policies where bucket_id='design-templates' and name='public-read') then
    insert into storage.policies (name, bucket_id, command, definition)
    values ('public-read','design-templates','SELECT','(bucket_id = ''design-templates'')');
  end if;

  if not exists (select 1 from storage.policies where bucket_id='design-templates' and name='staff-write') then
    insert into storage.policies (name, bucket_id, command, definition)
    values ('staff-write','design-templates','INSERT',
           '(bucket_id = ''design-templates'') and (exists (select 1 from staff_users s where s.user_id = auth.uid()))');
  end if;

  if not exists (select 1 from storage.policies where bucket_id='design-templates' and name='staff-update') then
    insert into storage.policies (name, bucket_id, command, definition)
    values ('staff-update','design-templates','UPDATE',
           '(bucket_id = ''design-templates'') and (exists (select 1 from staff_users s where s.user_id = auth.uid()))');
  end if;

  if not exists (select 1 from storage.policies where bucket_id='design-templates' and name='staff-delete') then
    insert into storage.policies (name, bucket_id, command, definition)
    values ('staff-delete','design-templates','DELETE',
           '(bucket_id = ''design-templates'') and (exists (select 1 from staff_users s where s.user_id = auth.uid()))');
  end if;
end$$;

-- Add staff user (your email)
insert into staff_users (user_id) values ('93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52') on conflict do nothing;

-- Seed the categories (safe upsert)
insert into garment_categories (slug, name) values
  ('long-sleeve-tee','Long-Sleeve Tee'),
  ('crop-top-tee','Crop Top Tee'),
  ('oversized-tee','Oversized Tee'),
  ('tank-vest','Tank Top / Vest'),
  ('polo-shirt','Polo Shirt'),
  ('cropped-long-sleeve-top','Cropped Long-Sleeve Top'),
  ('hooded-pullover-hoodie','Hooded Pullover Hoodie'),
  ('zip-up-hoodie','Zip-Up Hoodie'),
  ('oversized-hoodie','Oversized Hoodie'),
  ('cropped-sweatshirt','Cropped Sweatshirt'),
  ('windbreaker-jacket','Windbreaker Jacket'),
  ('track-jacket','Track Jacket'),
  ('lightweight-bomber-and-tracksuit-bottoms','Lightweight Bomber Jacket and Tracksuit Bottoms'),
  ('joggers','Joggers'),
  ('sweatpants-relaxed','Sweatpants (Relaxed)'),
  ('cargo-pants','Cargo Pants'),
  ('wide-leg-pants','Wide-Leg Pants'),
  ('casual-shorts','Casual Shorts'),
  ('skirt-casual-mini','Skirt (Casual Mini)'),
  ('tennis-skirt','Tennis Skirt'),
  ('slip-dress-minimalist','Slip Dress (Minimalist)'),
  ('casual-summer-dress','Casual Summer Dress'),
  ('bucket-hat','Bucket Hat'),
  ('beanie','Beanie'),
  ('tote-bag','Tote Bag')
on conflict (slug) do update set name = excluded.name;