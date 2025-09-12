-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  brand_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_movements table
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_alerts table
CREATE TABLE public.stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  threshold INTEGER NOT NULL DEFAULT 5,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_analytics table
CREATE TABLE public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, day)
);

-- Create search_analytics table
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access on catalog tables
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product analytics are publicly readable" ON public.product_analytics FOR SELECT USING (true);

-- Create RLS policies for user-specific data
CREATE POLICY "Users can view search analytics" ON public.search_analytics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create search analytics" ON public.search_analytics FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admin-only policies for inventory management (can be updated later for specific roles)
CREATE POLICY "Inventory movements are read-only for users" ON public.inventory_movements FOR SELECT USING (true);
CREATE POLICY "Stock alerts are read-only for users" ON public.stock_alerts FOR SELECT USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_alerts_updated_at
  BEFORE UPDATE ON public.stock_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_variant_id ON public.product_images(variant_id);
CREATE INDEX idx_product_images_display_order ON public.product_images(display_order);
CREATE INDEX idx_inventory_movements_variant_id ON public.inventory_movements(variant_id);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX idx_stock_alerts_variant_id ON public.stock_alerts(variant_id);
CREATE INDEX idx_product_analytics_product_id ON public.product_analytics(product_id);
CREATE INDEX idx_product_analytics_day ON public.product_analytics(day);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(query);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);

-- Insert sample categories
INSERT INTO public.categories (name, slug) VALUES 
  ('T-Shirts', 't-shirts'),
  ('Hoodies', 'hoodies'),
  ('Accessories', 'accessories'),
  ('Bottoms', 'bottoms');

-- Insert sample products with specific UUIDs for mapping
INSERT INTO public.products (id, name, slug, description, base_price, category_id, status) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Classic T-Shirt', 'classic-t-shirt', 'A comfortable cotton t-shirt perfect for everyday wear.', 24.99, (SELECT id FROM public.categories WHERE slug = 't-shirts'), 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Premium Hoodie', 'premium-hoodie', 'A warm and cozy hoodie made from premium materials.', 64.99, (SELECT id FROM public.categories WHERE slug = 'hoodies'), 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Polo Shirt', 'polo-shirt', 'A classic polo shirt for any occasion.', 34.99, (SELECT id FROM public.categories WHERE slug = 't-shirts'), 'active'),
  ('44444444-4444-4444-4444-444444444444', 'Zip Hoodie', 'zip-hoodie', 'A comfortable zip-up hoodie.', 69.99, (SELECT id FROM public.categories WHERE slug = 'hoodies'), 'active'),
  ('55555555-5555-5555-5555-555555555555', 'Long Sleeve', 'long-sleeve', 'A comfortable long sleeve shirt.', 29.99, (SELECT id FROM public.categories WHERE slug = 't-shirts'), 'active');

-- Clear existing data from tables that will be updated
DELETE FROM public.cart_items;
DELETE FROM public.order_items; 
DELETE FROM public.wishlists;
DELETE FROM public.product_reviews;
DELETE FROM public.recently_viewed;
DELETE FROM public.pricing_history;
DELETE FROM public.product_variants;

-- Recreate product_variants with proper UUID references
INSERT INTO public.product_variants (product_id, sku, price, size, color, stock_quantity) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TS-BLK-S', 24.99, 'S', 'Black', 50),
  ('11111111-1111-1111-1111-111111111111', 'TS-BLK-M', 24.99, 'M', 'Black', 75),
  ('11111111-1111-1111-1111-111111111111', 'TS-BLK-L', 24.99, 'L', 'Black', 60),
  ('11111111-1111-1111-1111-111111111111', 'TS-WHT-S', 24.99, 'S', 'White', 40),
  ('11111111-1111-1111-1111-111111111111', 'TS-WHT-M', 24.99, 'M', 'White', 55),
  ('11111111-1111-1111-1111-111111111111', 'TS-WHT-L', 24.99, 'L', 'White', 45),
  ('22222222-2222-2222-2222-222222222222', 'HD-GRY-M', 64.99, 'M', 'Gray', 30),
  ('22222222-2222-2222-2222-222222222222', 'HD-GRY-L', 64.99, 'L', 'Gray', 25),
  ('22222222-2222-2222-2222-222222222222', 'HD-GRY-XL', 64.99, 'XL', 'Gray', 20),
  ('33333333-3333-3333-3333-333333333333', 'PL-NVY-M', 34.99, 'M', 'Navy', 35),
  ('33333333-3333-3333-3333-333333333333', 'PL-NVY-L', 34.99, 'L', 'Navy', 40),
  ('44444444-4444-4444-4444-444444444444', 'ZH-CHR-L', 69.99, 'L', 'Charcoal', 25),
  ('44444444-4444-4444-4444-444444444444', 'ZH-CHR-XL', 69.99, 'XL', 'Charcoal', 30),
  ('55555555-5555-5555-5555-555555555555', 'LS-HTH-M', 29.99, 'M', 'Heather', 45),
  ('55555555-5555-5555-5555-555555555555', 'LS-HTH-L', 29.99, 'L', 'Heather', 50);

-- Add foreign key constraints for inventory and stock management
ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

ALTER TABLE public.stock_alerts ADD CONSTRAINT stock_alerts_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Insert sample product images
INSERT INTO public.product_images (product_id, url, display_order, alt_text) VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 0, 'Classic T-Shirt Front View'),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 0, 'Premium Hoodie Front View'),
  ('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', 0, 'Polo Shirt Front View'),
  ('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500', 0, 'Zip Hoodie Front View'),
  ('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1583743814966-8936f37f798e?w=500', 0, 'Long Sleeve Front View');