-- Enable necessary extensions
create extension if not exists pgcrypto;

-- Product variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sku text,
  price numeric not null,
  size text,
  color text,
  stock_quantity integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

-- Product images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
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
  parent_id uuid references public.categories(id),
  image_url text,
  created_at timestamp with time zone default now()
);

-- Wishlists (per user and product)
create table if not exists public.wishlists (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, product_id)
);

-- Product reviews
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  content text,
  created_at timestamp with time zone default now()
);

-- Carts (persist for guests and users)
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  created_at timestamp with time zone default now()
);

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric not null,
  created_at timestamp with time zone default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_number text unique not null,
  status text not null check (status in ('pending','processing','shipped','delivered','cancelled')),
  total_amount numeric not null,
  shipping_address jsonb,
  billing_address jsonb,
  created_at timestamp with time zone default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity integer not null,
  unit_price numeric not null,
  total_price numeric not null,
  product_name text,
  product_image text
);

-- Recently viewed products
create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id),
  viewed_at timestamp with time zone default now()
);

-- Pricing history (track price changes)
create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  price numeric not null,
  changed_at timestamp with time zone default now()
);

-- Policies (RLS)
alter table public.wishlists enable row level security;
create policy if not exists "Wishlists are user‑owned" on public.wishlists
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.cart_items enable row level security;
create policy if not exists "Cart items are accessible to owner" on public.cart_items
  using (cart_id in (select id from public.carts where (user_id = auth.uid() or session_id = current_setting('request.jwt.claims.session_id', true)::text)))
  with check (cart_id in (select id from public.carts where (user_id = auth.uid() or session_id = current_setting('request.jwt.claims.session_id', true)::text)));

alter table public.orders enable row level security;
create policy if not exists "Orders are user‑owned" on public.orders
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.order_items enable row level security;
create policy if not exists "Order items belong to user orders" on public.order_items
  using (order_id in (select id from public.orders where user_id = auth.uid()));

-- Allow anonymous SELECT on catalog tables for marketplace browsing
alter table public.products enable row level security;
create policy if not exists "Public product view" on public.products
  for select using (true);

alter table public.product_variants enable row level security;
create policy if not exists "Public variants view" on public.product_variants
  for select using (true);

alter table public.product_images enable row level security;
create policy if not exists "Public images view" on public.product_images
  for select using (true);

-- Storage bucket for product images
insert into storage.buckets(id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy if not exists "Public read on product-images" on storage.objects
  for select using (bucket_id = 'product-images');