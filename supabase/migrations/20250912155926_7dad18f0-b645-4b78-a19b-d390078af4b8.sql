-- Idempotent migration for Mañana marketplace backend system
-- This migration ensures all tables exist with proper structure and RLS policies

-- Core Catalog Tables
DO $$ BEGIN
  -- Create categories table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    CREATE TABLE public.categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_id UUID REFERENCES public.categories(id),
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Create products table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    CREATE TABLE public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      category_id UUID REFERENCES public.categories(id),
      brand_id UUID,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Create product_variants table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') THEN
    CREATE TABLE public.product_variants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      sku TEXT UNIQUE,
      price NUMERIC(10,2) NOT NULL,
      size TEXT,
      color TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Create product_images table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_images') THEN
    CREATE TABLE public.product_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
      variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      alt_text TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- Social & UX Tables
DO $$ BEGIN
  -- Create product_reviews table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_reviews') THEN
    CREATE TABLE public.product_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT,
      comment TEXT,
      review_text TEXT,
      verified_purchase BOOLEAN DEFAULT false,
      helpful_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Create wishlists table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wishlists') THEN
    CREATE TABLE public.wishlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, product_id)
    );
  END IF;

  -- Create recently_viewed table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recently_viewed') THEN
    CREATE TABLE public.recently_viewed (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      session_id TEXT,
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      viewed_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- Inventory & Pricing Tables
DO $$ BEGIN
  -- Create inventory_movements table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_movements') THEN
    CREATE TABLE public.inventory_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL CHECK (movement_type IN ('add', 'remove', 'order', 'cancel', 'adjust')),
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Create pricing_history table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_history') THEN
    CREATE TABLE public.pricing_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
      old_price NUMERIC(10,2),
      new_price NUMERIC(10,2) NOT NULL,
      effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now(),
      created_by UUID,
      change_reason TEXT
    );
  END IF;

  -- Create stock_alerts table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stock_alerts') THEN
    CREATE TABLE public.stock_alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
      threshold INTEGER NOT NULL DEFAULT 1,
      notification_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- Analytics Tables
DO $$ BEGIN
  -- Create product_analytics table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_analytics') THEN
    CREATE TABLE public.product_analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      views INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      day DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(product_id, day)
    );
  END IF;

  -- Create search_analytics table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'search_analytics') THEN
    CREATE TABLE public.search_analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      query TEXT NOT NULL,
      results_count INTEGER NOT NULL DEFAULT 0,
      user_id UUID,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies idempotently
-- Catalog tables (public read access)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories are publicly readable') THEN
    CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Products are publicly readable') THEN
    CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Product variants are publicly readable') THEN
    CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Product images are publicly readable') THEN
    CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);
  END IF;
END $$;

-- User-specific tables
DO $$ BEGIN
  -- Product Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Reviews are publicly readable') THEN
    CREATE POLICY "Reviews are publicly readable" ON public.product_reviews FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can create reviews') THEN
    CREATE POLICY "Users can create reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can update their own reviews') THEN
    CREATE POLICY "Users can update their own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can delete their own reviews') THEN
    CREATE POLICY "Users can delete their own reviews" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Wishlists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishlists' AND policyname = 'Users can manage their own wishlist') THEN
    CREATE POLICY "Users can manage their own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Recently Viewed
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can access their recently viewed items') THEN
    CREATE POLICY "Users can access their recently viewed items" ON public.recently_viewed FOR ALL 
    USING (
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
      (auth.uid() IS NULL AND session_id IS NOT NULL)
    );
  END IF;
END $$;

-- Analytics and admin tables (read-only for users)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_movements' AND policyname = 'Inventory movements are read-only for users') THEN
    CREATE POLICY "Inventory movements are read-only for users" ON public.inventory_movements FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_history' AND policyname = 'Pricing history is publicly readable') THEN
    CREATE POLICY "Pricing history is publicly readable" ON public.pricing_history FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_alerts' AND policyname = 'Stock alerts are read-only for users') THEN
    CREATE POLICY "Stock alerts are read-only for users" ON public.stock_alerts FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_analytics' AND policyname = 'Product analytics are publicly readable') THEN
    CREATE POLICY "Product analytics are publicly readable" ON public.product_analytics FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_analytics' AND policyname = 'Users can view search analytics') THEN
    CREATE POLICY "Users can view search analytics" ON public.search_analytics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_analytics' AND policyname = 'Users can create search analytics') THEN
    CREATE POLICY "Users can create search analytics" ON public.search_analytics FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recently_viewed_session_id ON public.recently_viewed(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_movements_variant_id ON public.inventory_movements(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pricing_history_variant_id ON public.pricing_history(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_alerts_variant_id ON public.stock_alerts(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_analytics_product_id ON public.product_analytics(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_analytics_day ON public.product_analytics(day);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(query);

-- Create triggers for updated_at columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON public.products
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_variants_updated_at') THEN
    CREATE TRIGGER update_product_variants_updated_at
      BEFORE UPDATE ON public.product_variants
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_reviews_updated_at') THEN
    CREATE TRIGGER update_product_reviews_updated_at
      BEFORE UPDATE ON public.product_reviews
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stock_alerts_updated_at') THEN
    CREATE TRIGGER update_stock_alerts_updated_at
      BEFORE UPDATE ON public.stock_alerts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('design-assets', 'design-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Seed demo data if tables are empty
DO $$ BEGIN
  -- Insert demo categories if none exist
  IF NOT EXISTS (SELECT 1 FROM public.categories LIMIT 1) THEN
    INSERT INTO public.categories (id, name, slug) VALUES 
      ('11111111-1111-1111-1111-111111111111', 'T-Shirts', 't-shirts'),
      ('22222222-2222-2222-2222-222222222222', 'Hoodies', 'hoodies'),
      ('33333333-3333-3333-3333-333333333333', 'Accessories', 'accessories'),
      ('44444444-4444-4444-4444-444444444444', 'Bottoms', 'bottoms');
  END IF;

  -- Insert demo products if none exist
  IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
    INSERT INTO public.products (id, name, slug, description, base_price, category_id, status) VALUES 
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classic T-Shirt', 'classic-t-shirt', 'A comfortable cotton t-shirt perfect for everyday wear.', 24.99, '11111111-1111-1111-1111-111111111111', 'active'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Premium Hoodie', 'premium-hoodie', 'A warm and cozy hoodie made from premium materials.', 64.99, '22222222-2222-2222-2222-222222222222', 'active'),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Polo Shirt', 'polo-shirt', 'A classic polo shirt for any occasion.', 34.99, '11111111-1111-1111-1111-111111111111', 'active'),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Zip Hoodie', 'zip-hoodie', 'A comfortable zip-up hoodie.', 69.99, '22222222-2222-2222-2222-222222222222', 'active'),
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Long Sleeve', 'long-sleeve', 'A comfortable long sleeve shirt.', 29.99, '11111111-1111-1111-1111-111111111111', 'active');
  END IF;

  -- Insert demo variants if none exist
  IF NOT EXISTS (SELECT 1 FROM public.product_variants LIMIT 1) THEN
    INSERT INTO public.product_variants (product_id, sku, price, size, color, stock_quantity) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-BLK-S', 24.99, 'S', 'Black', 50),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-BLK-M', 24.99, 'M', 'Black', 75),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-BLK-L', 24.99, 'L', 'Black', 60),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-WHT-S', 24.99, 'S', 'White', 40),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-WHT-M', 24.99, 'M', 'White', 55),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TS-WHT-L', 24.99, 'L', 'White', 45),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HD-GRY-M', 64.99, 'M', 'Gray', 30),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HD-GRY-L', 64.99, 'L', 'Gray', 25),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HD-GRY-XL', 64.99, 'XL', 'Gray', 20);
  END IF;

  -- Insert demo images if none exist
  IF NOT EXISTS (SELECT 1 FROM public.product_images LIMIT 1) THEN
    INSERT INTO public.product_images (product_id, url, display_order, alt_text) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 0, 'Classic T-Shirt Front View'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 0, 'Premium Hoodie Front View'),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', 0, 'Polo Shirt Front View'),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500', 0, 'Zip Hoodie Front View'),
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.unsplash.com/photo-1583743814966-8936f37f798e?w=500', 0, 'Long Sleeve Front View');
  END IF;
END $$;