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

-- Enable RLS on new tables
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.product_reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.pricing_history enable row level security;

-- Create new policies only if they don't exist
do $$
begin
    -- Product variants policies
    if not exists (select 1 from pg_policies where tablename = 'product_variants' and policyname = 'Public variants view') then
        create policy "Public variants view" on public.product_variants for select using (true);
    end if;

    -- Product images policies  
    if not exists (select 1 from pg_policies where tablename = 'product_images' and policyname = 'Public images view') then
        create policy "Public images view" on public.product_images for select using (true);
    end if;

    -- Categories policies
    if not exists (select 1 from pg_policies where tablename = 'categories' and policyname = 'Categories are publicly readable') then
        create policy "Categories are publicly readable" on public.categories for select using (true);
    end if;

    -- Product reviews policies
    if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Reviews are publicly readable') then
        create policy "Reviews are publicly readable" on public.product_reviews for select using (true);
    end if;
    
    if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Users can create reviews') then
        create policy "Users can create reviews" on public.product_reviews for insert with check (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Users can update their own reviews') then
        create policy "Users can update their own reviews" on public.product_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Users can delete their own reviews') then
        create policy "Users can delete their own reviews" on public.product_reviews for delete using (auth.uid() = user_id);
    end if;

    -- Carts policies
    if not exists (select 1 from pg_policies where tablename = 'carts' and policyname = 'Users can access their own cart') then
        create policy "Users can access their own cart" on public.carts 
        for all using ((auth.uid() is not null and user_id = auth.uid()) or (auth.uid() is null and session_id is not null));
    end if;

    -- Cart items policies
    if not exists (select 1 from pg_policies where tablename = 'cart_items' and policyname = 'Users can access their cart items') then
        create policy "Users can access their cart items" on public.cart_items
        for all using (exists (
            select 1 from carts 
            where carts.id = cart_items.cart_id 
            and ((auth.uid() is not null and carts.user_id = auth.uid()) or (auth.uid() is null and carts.session_id is not null))
        ));
    end if;

    -- Orders policies
    if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'Users can view their own orders') then
        create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'Users can create their own orders') then
        create policy "Users can create their own orders" on public.orders for insert with check (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'Users can update their own orders') then
        create policy "Users can update their own orders" on public.orders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;

    -- Order items policies
    if not exists (select 1 from pg_policies where tablename = 'order_items' and policyname = 'Users can view their order items') then
        create policy "Users can view their order items" on public.order_items 
        for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
    end if;

    if not exists (select 1 from pg_policies where tablename = 'order_items' and policyname = 'Users can create order items for their orders') then
        create policy "Users can create order items for their orders" on public.order_items 
        for insert with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
    end if;

    -- Recently viewed policies
    if not exists (select 1 from pg_policies where tablename = 'recently_viewed' and policyname = 'Users can access their recently viewed items') then
        create policy "Users can access their recently viewed items" on public.recently_viewed
        for all using ((auth.uid() is not null and user_id = auth.uid()) or (auth.uid() is null and session_id is not null));
    end if;

    -- Pricing history policies
    if not exists (select 1 from pg_policies where tablename = 'pricing_history' and policyname = 'Pricing history is publicly readable') then
        create policy "Pricing history is publicly readable" on public.pricing_history for select using (true);
    end if;
end
$$;

-- Storage bucket for product images
insert into storage.buckets(id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

-- Storage policy
do $$
begin
    if not exists (select 1 from storage.policies where name = 'Public read on product-images') then
        create policy "Public read on product-images" on storage.objects
        for select using (bucket_id = 'product-images');
    end if;
end
$$;