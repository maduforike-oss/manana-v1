-- Fix the data type mismatch and add proper policies
-- First check the column types
SELECT 
  'products.id' as table_column,
  data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'id'
UNION ALL
SELECT 
  'product_variants.product_id' as table_column,
  data_type 
FROM information_schema.columns 
WHERE table_name = 'product_variants' AND column_name = 'product_id';