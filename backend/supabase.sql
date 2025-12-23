-- =====================================================
-- COMPLETE DATABASE SETUP - FIREBASE COMPATIBLE VERSION
-- =====================================================
-- This comprehensive script includes all tables needed for full e-commerce functionality
-- Run this entire script in your Supabase Dashboard SQL Editor

-- =====================================================
-- 1. PROFILES TABLE (linked to Firebase Auth UIDs)
-- =====================================================
create table if not exists public.profiles (
  id text not null primary key,
  updated_at timestamp with time zone,
  name text,
  role text default 'user' check (role in ('user', 'admin')),
  constraint username_length check (char_length(name) >= 3)
);

-- Disable RLS for profiles table (Firebase compatibility)
alter table public.profiles disable row level security;

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================

-- Create categories table (don't drop if exists to preserve data)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================

-- Create products table (don't drop if exists to preserve existing data)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]',
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    specifications JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- =====================================================
-- 4. INSERT SAMPLE CATEGORIES
-- =====================================================

-- Note: Sample categories are commented out to preserve existing categories
-- Uncomment if you want to add sample categories later

/*
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashion and apparel items'),
('Home & Garden', 'home-garden', 'Home decoration and garden supplies'),
('Sports', 'sports', 'Sports equipment and accessories'),
('Books', 'books', 'Books and educational materials'),
('Toys', 'toys', 'Toys and games for all ages'),
('Beauty', 'beauty', 'Cosmetics and personal care products'),
('Automotive', 'automotive', 'Car parts and accessories');
*/

-- =====================================================
-- 5. INSERT SAMPLE PRODUCTS
-- =====================================================

-- Note: Sample products are commented out to preserve existing products
-- Uncomment if you want to add sample products later

/*
INSERT INTO products (name, slug, description, price, category_id, stock, featured, specifications, tags) VALUES
-- Electronics
('Wireless Headphones', 'wireless-headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 299.99, 1, 50, true, '{"brand": "AudioTech", "color": "Black", "battery_life": "30 hours", "connectivity": "Bluetooth 5.0"}', '{"wireless", "bluetooth", "noise-cancelling", "audio"}'),

('Smartphone Pro', 'smartphone-pro', 'Latest flagship smartphone with advanced camera system', 999.99, 1, 30, true, '{"brand": "TechCorp", "screen_size": "6.7 inches", "storage": "256GB", "camera": "108MP"}', '{"smartphone", "camera", "5G", "premium"}'),

('Laptop Ultra', 'laptop-ultra', 'High-performance laptop for professionals and creators', 1499.99, 1, 20, false, '{"brand": "ComputeX", "processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD"}', '{"laptop", "professional", "high-performance"}'),

-- Clothing
('Classic T-Shirt', 'classic-t-shirt', 'Comfortable cotton t-shirt in various colors', 19.99, 2, 100, false, '{"material": "100% Cotton", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Black", "Blue", "Gray"]}', '{"casual", "cotton", "everyday"}'),

('Denim Jeans', 'denim-jeans', 'Classic fit denim jeans with modern styling', 49.99, 2, 75, false, '{"material": "Denim", "fit": "Classic", "sizes": ["28", "30", "32", "34", "36"], "colors": ["Blue", "Black"]}', '{"casual", "denim", "classic"}'),

-- Home & Garden
('Smart LED Bulbs (4-pack)', 'smart-led-bulbs-4-pack', 'WiFi-enabled LED bulbs with color changing capabilities', 39.99, 3, 60, true, '{"brand": "SmartHome", "wattage": "9W", "features": ["WiFi", "Color Changing", "Voice Control"], "quantity": 4}', '{"smart-home", "lighting", "energy-efficient"}'),

('Indoor Plant Set', 'indoor-plant-set', 'Set of 3 low-maintenance indoor plants with pots', 34.99, 3, 40, false, '{"plants": ["Snake Plant", "Pothos", "ZZ Plant"], "pot_size": "6 inches", "care_level": "Low"}', '{"plants", "home-decor", "low-maintenance"}'),

-- Sports
('Yoga Mat Premium', 'yoga-mat-premium', 'Extra thick non-slip yoga mat with carrying strap', 29.99, 4, 80, false, '{"material": "TPE", "thickness": "6mm", "dimensions": "72x24 inches", "includes": ["Carrying Strap"]}', '{"yoga", "fitness", "exercise"}'),

('Running Shoes Pro', 'running-shoes-pro', 'Professional running shoes with advanced cushioning', 89.99, 4, 45, true, '{"brand": "SportMax", "size_range": "7-12", "features": ["Breathable mesh", "Cushioned sole", "Reflective details"]}', '{"running", "shoes", "fitness", "professional"}'),

-- Books
('JavaScript Guide', 'javascript-guide', 'Comprehensive guide to modern JavaScript development', 39.99, 5, 60, false, '{"author": "John Developer", "pages": 450, "level": "Intermediate", "format": "Paperback"}', '{"javascript", "programming", "web-development"}'),

('Fiction Novel', 'fiction-novel', 'Bestselling fiction novel with compelling storyline', 24.99, 5, 85, true, '{"author": "Jane Writer", "pages": 320, "genre": "Fiction", "format": "Paperback"}', '{"fiction", "novel", "bestseller"}'),

-- Toys
('Building Blocks Set', 'building-blocks-set', 'Creative building blocks set for kids and adults', 34.99, 6, 55, false, '{"pieces": 500, "age_range": "6+", "material": "Plastic", "includes": ["Instruction manual"]}', '{"toys", "building", "creative", "educational"}'),

('Board Game Family', 'board-game-family', 'Fun board game for family game nights', 29.99, 6, 70, true, '{"players": "2-6", "age": "8+", "duration": "30-45 minutes", "type": "Strategy"}', '{"board-game", "family", "strategy", "fun"}'),

-- Beauty
('Face Cream Premium', 'face-cream-premium', 'Luxurious face cream with anti-aging properties', 59.99, 7, 40, false, '{"brand": "BeautyLux", "size": "50ml", "ingredients": ["Hyaluronic acid", "Vitamin C"], "skin_type": "All"}', '{"beauty", "skincare", "anti-aging", "premium"}'),

('Lipstick Set', 'lipstick-set', 'Set of 5 premium lipstick colors', 44.99, 7, 65, true, '{"brand": "ColorMe", "colors": 5, "finish": "Matte", "long_lasting": true}', '{"beauty", "makeup", "lipstick", "cosmetics"}'),

-- Automotive
('Car Phone Holder', 'car-phone-holder', 'Adjustable phone holder for car dashboard', 19.99, 8, 90, false, '{"mount_type": "Dashboard", "compatible": ["iPhone", "Android"], "adjustable": true, "rotation": "360 degrees"}', '{"automotive", "accessories", "phone-holder"}'),

('LED Car Lights', 'led-car-lights', 'Multi-color LED strip lights for car interior', 39.99, 8, 35, true, '{"length": "4 meters", "colors": "RGB", "remote": true, "installation": "Plug and play"}', '{"automotive", "lighting", "LED", "interior"}');
*/

-- =====================================================
-- 6. DISABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- This is crucial for allowing CRUD operations from the backend
-- Without this, product operations will be blocked

-- Disable RLS for products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Disable RLS for categories table  
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- =====================================================
-- 8. WISHLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Disable RLS for wishlists table
ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CART_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Disable RLS for cart_items table
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- =====================================================
-- 10. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Disable RLS for reviews table
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- =====================================================
-- 11. ADDRESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. USER_PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- =====================================================
-- 13. RECENTLY_VIEWED TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recently_viewed (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- 14. PAYMENT_METHODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'paypal', 'bank')),
    provider VARCHAR(100) NOT NULL,
    last_four VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. RETURNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. STORAGE BUCKET FOR PRODUCT IMAGES
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to product images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- =====================================================
-- 17. CREATE UPDATED_AT TRIGGER
-- =====================================================
-- Automatically update the updated_at timestamp when records are modified

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_returns_updated_at ON returns;
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 18. ADDITIONAL SAMPLE DATA FROM ROOT FILE
-- =====================================================

-- Note: Furniture categories and products are commented out to preserve only existing products
-- Uncomment if you want to add furniture products later

/*
-- Insert furniture categories and products from root file
INSERT INTO categories (name, slug, description) VALUES
('Living Room', 'living-room', 'Sofas, chairs, and coffee tables'),
('Bedroom', 'bedroom', 'Beds, dressers, and nightstands'),
('Dining', 'dining', 'Tables, chairs, and storage')
ON CONFLICT (name) DO NOTHING;

-- Insert furniture products from root file
INSERT INTO products (name, slug, description, price, category_id, images, stock, featured) VALUES
('Modern Sofa', 'modern-sofa', 'Comfortable 3-seater sofa', 799.99, 9, '["https://picsum.photos/300/200?random=1"]', 10, true),
('Oak Dining Table', 'oak-dining-table', 'Solid oak dining table for 6', 1299.99, 10, '["https://picsum.photos/300/200?random=2"]', 5, true),
('King Bed Frame', 'king-bed-frame', 'Sturdy wooden king size bed frame', 599.99, 10, '["https://picsum.photos/300/200?random=3"]', 8, false),
('Coffee Table', 'coffee-table', 'Modern glass coffee table', 299.99, 9, '["https://picsum.photos/300/200?random=4"]', 15, true),
('Office Chair', 'office-chair', 'Ergonomic office chair with lumbar support', 199.99, 9, '["https://picsum.photos/300/200?random=5"]', 20, false),
('Bookshelf', 'bookshelf', '5-tier wooden bookshelf', 149.99, 10, '["https://picsum.photos/300/200?random=6"]', 12, false),
('Dining Chair Set', 'dining-chairs', 'Set of 4 modern dining chairs', 399.99, 10, '["https://picsum.photos/300/200?random=7"]', 8, true),
('Nightstand', 'nightstand', 'Wooden nightstand with drawer', 89.99, 10, '["https://picsum.photos/300/200?random=8"]', 25, false)
ON CONFLICT (slug) DO NOTHING;
*/

-- =====================================================
-- 19. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created correctly
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'categories', 'products', 'orders', 'order_items', 'wishlists', 'cart_items', 'reviews', 'addresses', 'user_preferences', 'recently_viewed', 'payment_methods', 'returns')
ORDER BY table_name;

-- Verify RLS is disabled for all tables
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('profiles', 'categories', 'products', 'orders', 'order_items', 'wishlists', 'cart_items', 'reviews', 'addresses', 'user_preferences', 'recently_viewed', 'payment_methods', 'returns')
ORDER BY relname;

-- Verify sample data was inserted
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
ORDER BY table_name;

-- =====================================================
-- 20. SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Test product queries (uncomment to test)
-- SELECT p.*, c.name as category_name 
-- FROM products p 
-- LEFT JOIN categories c ON p.category_id = c.id 
-- LIMIT 5;

-- SELECT * FROM products WHERE featured = true;
-- SELECT * FROM products WHERE category_id = 1 ORDER BY price DESC;
-- SELECT * FROM products WHERE tags @> '{"electronics"}';

-- Test user-related queries
-- SELECT * FROM cart_items WHERE user_id = 1;
-- SELECT * FROM wishlists WHERE user_id = 1;
-- SELECT * FROM orders WHERE user_id = 1;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your comprehensive database is now ready for full e-commerce functionality
-- All product changes will persist across page reloads
-- The admin panel should work correctly with database persistence
-- All CRUD operations are fully supported with proper RLS configuration
