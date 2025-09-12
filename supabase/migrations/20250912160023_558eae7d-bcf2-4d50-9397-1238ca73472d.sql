-- Idempotent migration for Mañana marketplace backend system
-- Core tables creation with proper RLS and demo data

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('design-assets', 'design-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance (non-concurrent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_parent_id') THEN
    CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_slug') THEN
    CREATE INDEX idx_categories_slug ON public.categories(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category_id') THEN
    CREATE INDEX idx_products_category_id ON public.products(category_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_slug') THEN
    CREATE INDEX idx_products_slug ON public.products(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_status') THEN
    CREATE INDEX idx_products_status ON public.products(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_variants_product_id') THEN
    CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_variants_sku') THEN
    CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_images_product_id') THEN
    CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_images_variant_id') THEN
    CREATE INDEX idx_product_images_variant_id ON public.product_images(variant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_reviews_product_id') THEN
    CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_reviews_user_id') THEN
    CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wishlists_user_id') THEN
    CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wishlists_product_id') THEN
    CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recently_viewed_user_id') THEN
    CREATE INDEX idx_recently_viewed_user_id ON public.recently_viewed(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recently_viewed_session_id') THEN
    CREATE INDEX idx_recently_viewed_session_id ON public.recently_viewed(session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_movements_variant_id') THEN
    CREATE INDEX idx_inventory_movements_variant_id ON public.inventory_movements(variant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pricing_history_variant_id') THEN
    CREATE INDEX idx_pricing_history_variant_id ON public.pricing_history(variant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_alerts_variant_id') THEN
    CREATE INDEX idx_stock_alerts_variant_id ON public.stock_alerts(variant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_analytics_product_id') THEN
    CREATE INDEX idx_product_analytics_product_id ON public.product_analytics(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_analytics_day') THEN
    CREATE INDEX idx_product_analytics_day ON public.product_analytics(day);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_search_analytics_query') THEN
    CREATE INDEX idx_search_analytics_query ON public.search_analytics(query);
  END IF;
END $$;