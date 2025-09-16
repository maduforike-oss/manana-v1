-- Create demo marketplace listing for white baseball cap

-- First, ensure we have an Accessories category (create if not exists)
INSERT INTO public.categories (id, name, slug, image_url)
VALUES (
  gen_random_uuid(),
  'Accessories',
  'accessories',
  'https://ajnbtevgzhkilokflntj.supabase.co/storage/v1/object/public/design-templates/White%20Baseball%20Cap%20Front%20_.png'
)
ON CONFLICT (slug) DO NOTHING;

-- Create the baseball cap product
DO $$
DECLARE
  cap_product_id uuid;
  accessories_category_id uuid;
BEGIN
  -- Get or create accessories category
  SELECT id INTO accessories_category_id 
  FROM public.categories 
  WHERE slug = 'accessories' 
  LIMIT 1;
  
  -- If no accessories category exists, create one
  IF accessories_category_id IS NULL THEN
    INSERT INTO public.categories (name, slug, image_url)
    VALUES ('Accessories', 'accessories', 'https://ajnbtevgzhkilokflntj.supabase.co/storage/v1/object/public/design-templates/White%20Baseball%20Cap%20Front%20_.png')
    RETURNING id INTO accessories_category_id;
  END IF;

  -- Create the baseball cap product
  INSERT INTO public.products (
    name,
    description,
    base_price,
    status,
    category_id,
    slug
  ) VALUES (
    'Classic White Baseball Cap',
    'A premium quality white baseball cap perfect for any casual outfit. Made with breathable cotton material and adjustable strap for the perfect fit.',
    24.99,
    'active',
    accessories_category_id,
    'classic-white-baseball-cap'
  ) RETURNING id INTO cap_product_id;

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