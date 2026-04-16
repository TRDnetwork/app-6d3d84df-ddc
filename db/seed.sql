-- Sample products
INSERT INTO app_24de_products (name, description, price, category, image_url, stock) VALUES
('Wireless Headphones', 'Noise-cancelling over-ear headphones with 30-hour battery', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 50),
('Organic Coffee Beans', 'Premium single-origin beans, medium roast', 24.99, 'Food', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 200),
('Yoga Mat', 'Non-slip, eco-friendly mat with carrying strap', 34.50, 'Fitness', 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0', 75),
('Desk Lamp', 'Adjustable LED lamp with touch controls', 45.00, 'Home', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', 30),
('Running Shoes', 'Lightweight sneakers with cushion technology', 89.99, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 40),
('Bluetooth Speaker', 'Waterproof portable speaker with 360° sound', 79.99, 'Electronics', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', 60),
('Cookbook', 'Healthy recipes with full-color photography', 29.95, 'Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', 100),
('Plant Pot Set', 'Ceramic pots in assorted sizes', 39.99, 'Home', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411', 55);

-- Sample discount codes
INSERT INTO app_24de_discount_codes (code, discount_percent, is_active, valid_until) VALUES
('WELCOME10', 10, true, NULL),
('SUMMER25', 25, true, '2024-09-01 00:00:00+00'),
('SAVE15', 15, true, '2024-12-31 23:59:59+00'),
('EXPIRED50', 50, false, '2024-01-01 00:00:00+00');