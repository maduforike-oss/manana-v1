-- Create real product listings for existing garments
-- First, clear any existing products to avoid conflicts
DELETE FROM product_variants;
DELETE FROM product_images;
DELETE FROM products WHERE owner_id = '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52';

-- Create realistic T-Shirt products
INSERT INTO products (id, name, slug, description, base_price, status, category_id, owner_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Urban Graphic Tee Collection', 'urban-graphic-tee-collection', 'Express your creativity with our premium cotton graphic tees. Perfect for street style and everyday comfort.', 24.99, 'active', '2e6e20c2-54a4-4483-b544-a63a490d469f', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Minimalist Essential Tee', 'minimalist-essential-tee', 'Clean, simple design meets premium quality. A wardrobe staple for the modern minimalist.', 19.99, 'active', '2e6e20c2-54a4-4483-b544-a63a490d469f', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440003', 'Vintage Oversized Tee', 'vintage-oversized-tee', 'Embrace the oversized trend with our vintage-inspired graphic tees. Comfort meets style.', 27.99, 'active', '2e6e20c2-54a4-4483-b544-a63a490d469f', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '1 day'),

-- Create Hoodie products
('550e8400-e29b-41d4-a716-446655440004', 'Premium Pullover Hoodie', 'premium-pullover-hoodie', 'Luxury comfort in our heavyweight cotton blend hoodie. Perfect for layering or wearing solo.', 49.99, 'active', '19d56af1-494c-44db-860a-35f4e6ce123b', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440005', 'Zip-Up Hoodie Pro', 'zip-up-hoodie-pro', 'Versatile zip-up design with modern fit. Ideal for active lifestyles and casual wear.', 54.99, 'active', '19d56af1-494c-44db-860a-35f4e6ce123b', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440006', 'Oversized Comfort Hoodie', 'oversized-comfort-hoodie', 'Ultra-soft fleece in a relaxed oversized fit. Your new favorite cozy companion.', 44.99, 'active', '19d56af1-494c-44db-860a-35f4e6ce123b', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '4 days'),

-- Create Bottoms products
('550e8400-e29b-41d4-a716-446655440007', 'Cargo Pants Street Style', 'cargo-pants-street-style', 'Functional meets fashionable with multiple pockets and modern tailoring.', 39.99, 'active', '555711c7-0719-43ce-8cec-44182ef035d9', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440008', 'Premium Joggers', 'premium-joggers', 'Elevated comfort with tapered fit and premium cotton-blend fabric.', 34.99, 'active', '555711c7-0719-43ce-8cec-44182ef035d9', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440009', 'Wide Leg Pants Trendy', 'wide-leg-pants-trendy', 'Fashion-forward wide leg design in flowing fabric. Perfect for contemporary style.', 42.99, 'active', '555711c7-0719-43ce-8cec-44182ef035d9', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '9 days'),

-- Create Accessories products
('550e8400-e29b-41d4-a716-446655440010', 'Classic Baseball Cap', 'classic-baseball-cap', 'Timeless baseball cap design with adjustable fit. Essential headwear for any season.', 16.99, 'active', '988324f3-113c-4901-8ece-049bfa948e50', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440011', 'Canvas Tote Bag', 'canvas-tote-bag', 'Sustainable and stylish canvas tote perfect for daily essentials and eco-conscious living.', 22.99, 'active', '988324f3-113c-4901-8ece-049bfa948e50', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '11 days'),
('550e8400-e29b-41d4-a716-446655440012', 'Cozy Knit Beanie', 'cozy-knit-beanie', 'Soft knit beanie for chilly days. Classic style with modern comfort.', 14.99, 'active', '988324f3-113c-4901-8ece-049bfa948e50', '93cc17a6-52ec-42a0-8dcb-ea1ae87d9e52', NOW() - INTERVAL '12 days');

-- Create product variants with realistic colors and sizes
-- T-Shirt variants
INSERT INTO product_variants (id, product_id, sku, color, size, price, stock_quantity, image_url) VALUES
-- Urban Graphic Tee Collection
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'UGT-BLACK-S', 'Black', 'S', 24.99, 15, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'UGT-BLACK-M', 'Black', 'M', 24.99, 20, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'UGT-BLACK-L', 'Black', 'L', 24.99, 18, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'UGT-WHITE-S', 'White', 'S', 24.99, 12, '/mockups/tshirt-white-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'UGT-WHITE-M', 'White', 'M', 24.99, 25, '/mockups/tshirt-white-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440001', 'UGT-WHITE-L', 'White', 'L', 24.99, 22, '/mockups/tshirt-white-front-clean.jpg'),

-- Minimalist Essential Tee
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440002', 'MET-GRAY-S', 'Gray', 'S', 19.99, 30, '/mockups/tshirt-gray-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440002', 'MET-GRAY-M', 'Gray', 'M', 19.99, 35, '/mockups/tshirt-gray-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440002', 'MET-GRAY-L', 'Gray', 'L', 19.99, 28, '/mockups/tshirt-gray-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440002', 'MET-NAVY-S', 'Navy', 'S', 19.99, 20, '/mockups/tshirt-navy-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440002', 'MET-NAVY-M', 'Navy', 'M', 19.99, 24, '/mockups/tshirt-navy-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440002', 'MET-NAVY-L', 'Navy', 'L', 19.99, 18, '/mockups/tshirt-navy-front-clean.jpg'),

-- Vintage Oversized Tee
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440003', 'VOT-BLACK-M', 'Black', 'M', 27.99, 16, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440003', 'VOT-BLACK-L', 'Black', 'L', 27.99, 14, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440003', 'VOT-BLACK-XL', 'Black', 'XL', 27.99, 12, '/mockups/tshirt-black-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440003', 'VOT-WHITE-M', 'White', 'M', 27.99, 20, '/mockups/tshirt-white-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440117', '550e8400-e29b-41d4-a716-446655440003', 'VOT-WHITE-L', 'White', 'L', 27.99, 18, '/mockups/tshirt-white-front-clean.jpg'),
('550e8400-e29b-41d4-a716-446655440118', '550e8400-e29b-41d4-a716-446655440003', 'VOT-WHITE-XL', 'White', 'XL', 27.99, 15, '/mockups/tshirt-white-front-clean.jpg'),

-- Premium Pullover Hoodie
('550e8400-e29b-41d4-a716-446655440119', '550e8400-e29b-41d4-a716-446655440004', 'PPH-CHARCOAL-S', 'Charcoal', 'S', 49.99, 10, '/assets/garments/hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440004', 'PPH-CHARCOAL-M', 'Charcoal', 'M', 49.99, 15, '/assets/garments/hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440004', 'PPH-CHARCOAL-L', 'Charcoal', 'L', 49.99, 12, '/assets/garments/hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440004', 'PPH-BLACK-S', 'Black', 'S', 49.99, 8, '/assets/garments/hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440004', 'PPH-BLACK-M', 'Black', 'M', 49.99, 14, '/assets/garments/hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440124', '550e8400-e29b-41d4-a716-446655440004', 'PPH-BLACK-L', 'Black', 'L', 49.99, 11, '/assets/garments/hoodie-charcoal-front.png'),

-- Zip-Up Hoodie Pro
('550e8400-e29b-41d4-a716-446655440125', '550e8400-e29b-41d4-a716-446655440005', 'ZHP-CHARCOAL-S', 'Charcoal', 'S', 54.99, 9, '/assets/garments/zip-hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440126', '550e8400-e29b-41d4-a716-446655440005', 'ZHP-CHARCOAL-M', 'Charcoal', 'M', 54.99, 13, '/assets/garments/zip-hoodie-charcoal-front.png'),
('550e8400-e29b-41d4-a716-446655440127', '550e8400-e29b-41d4-a716-446655440005', 'ZHP-CHARCOAL-L', 'Charcoal', 'L', 54.99, 10, '/assets/garments/zip-hoodie-charcoal-front.png'),

-- Add more variants for other products (abbreviated for brevity)
('550e8400-e29b-41d4-a716-446655440128', '550e8400-e29b-41d4-a716-446655440007', 'CPS-BLACK-30', 'Black', '30', 39.99, 15, '/assets/garments/tshirt-black-front.png'),
('550e8400-e29b-41d4-a716-446655440129', '550e8400-e29b-41d4-a716-446655440007', 'CPS-BLACK-32', 'Black', '32', 39.99, 18, '/assets/garments/tshirt-black-front.png'),
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440008', 'PJ-GRAY-S', 'Gray', 'S', 34.99, 20, '/assets/garments/tshirt-black-front.png'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440008', 'PJ-GRAY-M', 'Gray', 'M', 34.99, 25, '/assets/garments/tshirt-black-front.png'),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440010', 'CBC-BLACK-OS', 'Black', 'One Size', 16.99, 50, '/assets/garments/cap-black-front.jpg'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440011', 'CTB-NATURAL-OS', 'Natural', 'One Size', 22.99, 30, '/assets/garments/tote-canvas-front.jpg'),
('550e8400-e29b-41d4-a716-446655440134', '550e8400-e29b-41d4-a716-446655440012', 'CKB-BLACK-OS', 'Black', 'One Size', 14.99, 40, '/assets/garments/beanie-black-front.jpg');

-- Create product images
INSERT INTO product_images (id, product_id, variant_id, url, alt_text, display_order) VALUES
-- Urban Graphic Tee Collection images
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', NULL, '/mockups/tshirt-black-front-clean.jpg', 'Urban Graphic Tee Collection - Black', 0),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', NULL, '/mockups/tshirt-white-front-clean.jpg', 'Urban Graphic Tee Collection - White', 1),

-- Minimalist Essential Tee images
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', NULL, '/mockups/tshirt-gray-front-clean.jpg', 'Minimalist Essential Tee - Gray', 0),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', NULL, '/mockups/tshirt-navy-front-clean.jpg', 'Minimalist Essential Tee - Navy', 1),

-- Vintage Oversized Tee images
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440003', NULL, '/mockups/tshirt-black-front-clean.jpg', 'Vintage Oversized Tee - Black', 0),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440003', NULL, '/mockups/tshirt-white-front-clean.jpg', 'Vintage Oversized Tee - White', 1),

-- Premium Pullover Hoodie images
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440004', NULL, '/assets/garments/hoodie-charcoal-front.png', 'Premium Pullover Hoodie - Charcoal', 0),

-- Zip-Up Hoodie Pro images
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440005', NULL, '/assets/garments/zip-hoodie-charcoal-front.png', 'Zip-Up Hoodie Pro - Charcoal', 0),

-- Oversized Comfort Hoodie images
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440006', NULL, '/assets/garments/hoodie-charcoal-front.png', 'Oversized Comfort Hoodie', 0),

-- Cargo Pants Street Style images
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440007', NULL, '/assets/garments/tshirt-black-front.png', 'Cargo Pants Street Style', 0),

-- Premium Joggers images
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440008', NULL, '/assets/garments/tshirt-black-front.png', 'Premium Joggers', 0),

-- Wide Leg Pants Trendy images
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440009', NULL, '/assets/garments/tshirt-black-front.png', 'Wide Leg Pants Trendy', 0),

-- Classic Baseball Cap images
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440010', NULL, '/assets/garments/cap-black-front.jpg', 'Classic Baseball Cap - Black', 0),

-- Canvas Tote Bag images
('550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440011', NULL, '/assets/garments/tote-canvas-front.jpg', 'Canvas Tote Bag - Natural', 0),

-- Cozy Knit Beanie images
('550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440012', NULL, '/assets/garments/beanie-black-front.jpg', 'Cozy Knit Beanie - Black', 0);