-- Fix foreign key relationships and RLS policies for marketplace
-- First, fix the foreign key between products and product_variants
ALTER TABLE public.product_variants 
ADD CONSTRAINT fk_product_variants_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add missing RLS policies for products table
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable" 
ON public.products FOR SELECT 
USING (true);

-- Allow authenticated users to create products
CREATE POLICY "Users can create products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own products (need owner_id field first)
-- Add owner_id to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Update existing products to have an owner (for demo purposes)
UPDATE public.products SET owner_id = auth.uid() WHERE owner_id IS NULL AND auth.uid() IS NOT NULL;

-- Create policy for users to update their own products
CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Allow users to delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = owner_id);

-- Fix product_variants RLS policies
DROP POLICY IF EXISTS "Product variants are publicly readable" ON public.product_variants;
CREATE POLICY "Product variants are publicly readable" 
ON public.product_variants FOR SELECT 
USING (true);

-- Allow product owners to manage variants
CREATE POLICY "Product owners can manage variants" 
ON public.product_variants FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE products.id = product_variants.product_id 
  AND products.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.products 
  WHERE products.id = product_variants.product_id 
  AND products.owner_id = auth.uid()
));

-- Fix product_images RLS policies
DROP POLICY IF EXISTS "Product images are publicly readable" ON public.product_images;
DROP POLICY IF EXISTS "Public images view" ON public.product_images;
CREATE POLICY "Product images are publicly readable" 
ON public.product_images FOR SELECT 
USING (true);

-- Allow product owners to manage images
CREATE POLICY "Product owners can manage images" 
ON public.product_images FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE products.id = product_images.product_id 
  AND products.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.products 
  WHERE products.id = product_images.product_id 
  AND products.owner_id = auth.uid()
));