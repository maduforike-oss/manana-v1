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

-- Update existing tables to use proper UUID relationships
-- First, let's backup the existing data and recreate with proper types

-- Drop foreign key constraints temporarily
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE public.pricing_history DROP CONSTRAINT IF EXISTS pricing_history_product_id_fkey;

-- Update product_variants table to reference products table properly
ALTER TABLE public.product_variants ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Update pricing_history to reference variant_id instead of product_id
ALTER TABLE public.pricing_history RENAME COLUMN product_id TO variant_id;
ALTER TABLE public.pricing_history ALTER COLUMN variant_id TYPE UUID USING variant_id::UUID;
ALTER TABLE public.pricing_history ADD CONSTRAINT pricing_history_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Update wishlists table
ALTER TABLE public.wishlists ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.wishlists ADD CONSTRAINT wishlists_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Update product_reviews table
ALTER TABLE public.product_reviews ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.product_reviews ADD CONSTRAINT product_reviews_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Update recently_viewed table
ALTER TABLE public.recently_viewed ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.recently_viewed ADD CONSTRAINT recently_viewed_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Update cart_items table
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Update order_items table
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE UUID USING product_id::UUID;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraints for inventory and stock management
ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

ALTER TABLE public.stock_alerts ADD CONSTRAINT stock_alerts_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;

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

-- Insert sample products
INSERT INTO public.products (name, slug, description, base_price, category_id, status) 
SELECT 
  'Classic T-Shirt',
  'classic-t-shirt',
  'A comfortable cotton t-shirt perfect for everyday wear.',
  24.99,
  c.id,
  'active'
FROM public.categories c WHERE c.slug = 't-shirts';

INSERT INTO public.products (name, slug, description, base_price, category_id, status) 
SELECT 
  'Premium Hoodie',
  'premium-hoodie',
  'A warm and cozy hoodie made from premium materials.',
  64.99,
  c.id,
  'active'
FROM public.categories c WHERE c.slug = 'hoodies';

-- Update existing product_variants to reference the new products
UPDATE public.product_variants SET product_id = (
  SELECT id FROM public.products WHERE slug = 'classic-t-shirt' LIMIT 1
) WHERE size IN ('S', 'M', 'L', 'XL') AND color IN ('Black', 'White', 'Gray');

-- Insert sample product images
INSERT INTO public.product_images (product_id, url, display_order, alt_text)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  0,
  'Classic T-Shirt Front View'
FROM public.products p WHERE p.slug = 'classic-t-shirt';

INSERT INTO public.product_images (product_id, url, display_order, alt_text)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  0,
  'Premium Hoodie Front View'
FROM public.products p WHERE p.slug = 'premium-hoodie';