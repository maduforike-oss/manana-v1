-- Fix the data type mismatch and add proper policies step by step
-- First, convert product_variants.product_id from TEXT to UUID
ALTER TABLE public.product_variants 
ALTER COLUMN product_id TYPE UUID USING product_id::UUID;

-- Add the foreign key constraint
ALTER TABLE public.product_variants 
ADD CONSTRAINT fk_product_variants_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add owner_id to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Drop existing product policies and recreate them properly
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Public product view" ON public.products;

CREATE POLICY "Products are publicly readable" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Users can create products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = owner_id);