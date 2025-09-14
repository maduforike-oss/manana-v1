-- Fix the data type mismatch and add proper policies
-- Convert product_variants.product_id from TEXT to UUID
ALTER TABLE public.product_variants 
ALTER COLUMN product_id TYPE UUID USING product_id::UUID;

-- Now add the foreign key constraint
ALTER TABLE public.product_variants 
ADD CONSTRAINT fk_product_variants_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add owner_id to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add missing RLS policies for products table
CREATE POLICY "Products are publicly readable" 
ON public.products FOR SELECT 
USING (true);

-- Allow authenticated users to create products
CREATE POLICY "Users can create products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Allow users to update their own products
CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Allow users to delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = owner_id);

-- Fix product_variants RLS policies
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

-- Enable RLS on staff_users table
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Add policy for staff_users (only viewable by staff)
CREATE POLICY "Staff users can view staff table" 
ON public.staff_users FOR SELECT 
USING (user_id = auth.uid());