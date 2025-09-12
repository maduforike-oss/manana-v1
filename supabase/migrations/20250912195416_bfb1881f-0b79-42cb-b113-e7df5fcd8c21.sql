-- Enable necessary extensions
create extension if not exists pgcrypto;

-- Product variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  sku text,
  price numeric not null,
  size text,
  color text,
  stock_quantity integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Product images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  variant_id uuid,
  url text not null,
  display_order integer default 0,
  alt_text text,
  created_at timestamp with time zone default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Product reviews
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  verified_purchase boolean default false,
  helpful_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Recently viewed products
create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id text,
  product_id text not null,
  viewed_at timestamp with time zone default now()
);

-- Pricing history (track price changes)
create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  old_price numeric,
  new_price numeric not null,
  effective_date timestamp with time zone default now(),
  change_reason text,
  created_by uuid
);

-- Stock alerts
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null,
  threshold integer not null default 5,
  notification_sent boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Inventory movements
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null,
  movement_type text not null,
  quantity integer not null,
  reason text,
  created_at timestamp with time zone not null default now()
);

-- Product analytics
create table if not exists public.product_analytics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  day date not null default current_date,
  views integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Search analytics
create table if not exists public.search_analytics (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  results_count integer not null default 0,
  user_id uuid,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on tables
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.product_reviews enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.pricing_history enable row level security;
alter table public.stock_alerts enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.product_analytics enable row level security;
alter table public.search_analytics enable row level security;

-- Storage bucket for product images
insert into storage.buckets(id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;