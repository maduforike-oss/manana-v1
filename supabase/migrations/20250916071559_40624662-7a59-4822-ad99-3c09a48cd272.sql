-- Create demo marketplace listing for white baseball cap

-- First, ensure we have an Accessories category (create if not exists)
INSERT INTO public.categories (id, name, slug, image_url)
VALUES (
  'acc-category-id'::uuid,
  'Accessories',
  'accessories',
  'https://ajnbtevgzhkilokflntj.supabase.co/storage/v1/object/public/product-images/White%20Baseball%20Cap%20Front%20_.png'
)
ON CONFLICT (slug) DO NOTHING;

-- Create the baseball cap product
INSERT INTO public.products (
  id,
  name,
  description,
  base_price,
  status,
  category_id,
  slug,
  owner_id
) VALUES (
  gen_random_uuid(),
  'Classic White Baseball Cap',
  'A premium quality white baseball cap perfect for any casual outfit. Made with breathable cotton material and adjustable strap for the perfect fit.',
  24.99,
  'active',
  (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  'classic-white-baseball-cap',
  NULL  -- No specific owner for demo product
) RETURNING id as product_id;

-- Get the product ID for the subsequent inserts
DO $$
DECLARE
  cap_product_id uuid;
BEGIN
  -- Get the product ID
  SELECT id INTO cap_product_id 
  FROM public.products 
  WHERE slug = 'classic-white-baseball-cap' 
  LIMIT 1;

  -- Insert product image
  INSERT INTO public.product_images (
    product_id,
    url,
    display_order,
    alt_text
  ) VALUES (
    cap_product_id,
    'https://ajnbtevgzhkilokflntj.supabase.co/storage/v1/object/public/design-templates/White%20Baseball%20Cap%20Front%20_.png',
    0,
    'Classic White Baseball Cap - Front View'
  );

  -- Insert product variant
  INSERT INTO public.product_variants (
    product_id,
    size,
    color,
    price,
    stock_quantity,
    sku
  ) VALUES (
    cap_product_id,
    'One Size',
    'White',
    24.99,
    50,
    'CAP-WHITE-ONESIZE'
  );
END $$;