-- Products table
CREATE TABLE IF NOT EXISTS app_24de_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0)
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS app_24de_discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ
);

-- Orders table (for order confirmation, though cart is client-side)
CREATE TABLE IF NOT EXISTS app_24de_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    customer_email TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    items JSONB -- Store cart items as JSON since cart is client-side
);

-- Enable RLS on all tables
ALTER TABLE app_24de_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_24de_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_24de_orders ENABLE ROW LEVEL SECURITY;

-- Public read policies for products and discount codes
DROP POLICY IF EXISTS "Public can view products" ON app_24de_products;
CREATE POLICY "Public can view products"
    ON app_24de_products FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view active discount codes" ON app_24de_discount_codes;
CREATE POLICY "Public can view active discount codes"
    ON app_24de_discount_codes FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Orders policies (authenticated users can only see their own orders via email)
DROP POLICY IF EXISTS "Users can insert orders" ON app_24de_orders;
CREATE POLICY "Users can insert orders"
    ON app_24de_orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON app_24de_orders;
CREATE POLICY "Users can view own orders"
    ON app_24de_orders FOR SELECT
    USING (customer_email = current_user OR current_user = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_24de_products_category ON app_24de_products(category);
CREATE INDEX IF NOT EXISTS idx_app_24de_products_price ON app_24de_products(price);
CREATE INDEX IF NOT EXISTS idx_app_24de_products_name ON app_24de_products(name);
CREATE INDEX IF NOT EXISTS idx_app_24de_discount_codes_active ON app_24de_discount_codes(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_app_24de_orders_email ON app_24de_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_app_24de_orders_created ON app_24de_orders(created_at);

-- Add to realtime publication for live updates (optional for admin dashboards)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_24de_products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_24de_products;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_24de_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_24de_orders;
    END IF;
END $$;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('app_24de_product_images', 'app_24de_product_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket (public read, authenticated upload)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'app_24de_product_images');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'app_24de_product_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'app_24de_product_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'app_24de_product_images' AND auth.role() = 'authenticated');