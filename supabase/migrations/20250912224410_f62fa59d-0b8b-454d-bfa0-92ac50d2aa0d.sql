-- Create sweatshirt category (regular sweatshirt, not cropped)
INSERT INTO public.garment_categories (slug, name) 
VALUES ('sweatshirt', 'Sweatshirt')
ON CONFLICT (slug) DO NOTHING;