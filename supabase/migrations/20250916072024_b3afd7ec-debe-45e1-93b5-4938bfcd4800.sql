-- Add analytics data to make the baseball cap trending

-- Insert analytics data for the baseball cap to make it appear in trending
DO $$
DECLARE
  cap_product_id uuid;
BEGIN
  -- Get the baseball cap product ID
  SELECT id INTO cap_product_id 
  FROM public.products 
  WHERE slug = 'classic-white-baseball-cap' 
  LIMIT 1;

  -- If the product exists, add analytics data for the last 7 days
  IF cap_product_id IS NOT NULL THEN
    -- Add analytics for today
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE, 45, 8, 2);
    
    -- Add analytics for yesterday
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '1 day', 38, 6, 1);
    
    -- Add analytics for 2 days ago
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '2 days', 52, 9, 3);
    
    -- Add analytics for 3 days ago
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '3 days', 41, 7, 1);
    
    -- Add analytics for 4 days ago
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '4 days', 35, 5, 2);
    
    -- Add analytics for 5 days ago
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '5 days', 29, 4, 1);
    
    -- Add analytics for 6 days ago
    INSERT INTO public.product_analytics (product_id, day, views, clicks, conversions)
    VALUES (cap_product_id, CURRENT_DATE - INTERVAL '6 days', 33, 6, 0);
  END IF;
END $$;