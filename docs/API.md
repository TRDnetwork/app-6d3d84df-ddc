# Gradient Cart API Documentation

## Overview

The Gradient Cart backend consists of Supabase database tables and Edge Functions for discount validation and order creation. All endpoints require proper CORS headers and input validation.

## Base URL

- **Development**: `http://localhost:54321/functions/v1/`
- **Production**: `https://[your-project-ref].supabase.co/functions/v1/`

## Authentication

Most endpoints use Supabase's Row Level Security (RLS). The `create-order` endpoint requires a JWT token in the Authorization header.

## Database Schema

### Tables

#### `app_24de_products`
Stores product information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Product price (≥ 0) |
| category | TEXT | Product category |
| image_url | TEXT | Product image URL |
| stock | INTEGER | Available stock (≥ 0) |

**RLS Policy**: Public read access

#### `app_24de_discount_codes`
Stores active discount codes.

| Column | Type | Description |
|--------|------|-------------|
| code | TEXT | Unique discount code |
| discount_percent | INTEGER | Percentage discount (0-100) |
| is_active | BOOLEAN | Whether code is active |
| valid_until | TIMESTAMPTZ | Expiration date (optional) |

**RLS Policy**: Public can view active, non-expired codes

#### `app_24de_orders`
Stores completed orders.

| Column | Type | Description |
|--------|------|-------------|
| customer_email | TEXT | Customer email |
| total_amount | DECIMAL(10,2) | Order subtotal |
| discount_applied | DECIMAL(10,2) | Discount amount |
| final_amount | DECIMAL(10,2) | Final amount after discount |
| status | TEXT | Order status (pending/confirmed/paid) |
| items | JSONB | Cart items as JSON array |

**RLS Policy**: Anyone can insert, users can view own orders by email

## Edge Functions

### 1. Validate Discount Code

Validates a discount code and returns the discount percentage if valid.

**Endpoint**: `POST /validate-discount`

**Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "SUMMER25"
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "discount_percent": 25,
  "message": "Discount 25% applied successfully"
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "message": "Invalid discount code"
}
```

**Response (Expired)**:
```json
{
  "valid": false,
  "message": "Discount code is expired or inactive"
}
```

**cURL Example**:
```bash
curl -X POST 'https://[project-ref].supabase.co/functions/v1/validate-discount' \
  -H 'Content-Type: application/json' \
  -d '{"code": "SUMMER25"}'
```

**Validation Rules**:
- Code must exist in `app_24de_discount_codes`
- `is_active` must be `true`
- `valid_until` must be in the future (if set)
- Code is case-insensitive (converted to uppercase)

### 2. Create Order

Creates a new order record in the database. Requires authentication.

**Endpoint**: `POST /create-order`

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]
```

**Request Body**:
```json
{
  "customer_email": "customer@example.com",
  "total_amount": 150.75,
  "discount_applied": 15.08,
  "final_amount": 135.67,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Wireless Headphones",
      "price": 199.99,
      "quantity": 1
    }
  ]
}
```

**Response (Success)**:
```json
{
  "success": true,
  "order_id": "550e8400-e29b-41d4-a716-446655440001",
  "order_date": "2024-01-01T00:00:00.000Z",
  "message": "Order created successfully"
}
```

**Response (Error)**:
```json
{
  "error": "Valid email is required"
}
```

**cURL Example**:
```bash
curl -X POST 'https://[project-ref].supabase.co/functions/v1/create-order' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [JWT_TOKEN]' \
  -d '{
    "customer_email": "test@example.com",
    "total_amount": 100.00,
    "discount_applied": 10.00,
    "final_amount": 90.00,
    "items": [{"id": "1", "name": "Product", "price": 100, "quantity": 1}]
  }'
```

**Validation Rules**:
- Valid email format required
- `total_amount` and `final_amount` must be positive numbers
- `items` must be a non-empty array
- Each item must have `id`, `name`, `price`, and `quantity`
- Email length limited to 255 characters
- Quantity limited to 999 per item

## Frontend Integration

### Supabase Client Initialization

```javascript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const supabase = createClient(
  window.__SUPABASE_URL__,
  window.__SUPABASE_ANON_KEY__
);
```

### Fetching Products

```javascript
async function fetchProducts() {
  const { data, error } = await supabase
    .from('app_24de_products')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

### Applying Discount

```javascript
async function validateDiscount(code) {
  const response = await fetch('/functions/v1/validate-discount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  return await response.json();
}
```

### Creating Order

```javascript
async function createOrder(orderData) {
  const token = await supabase.auth.getSession();
  
  const response = await fetch('/functions/v1/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.session.access_token}`
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `500`: Internal server error

Error responses include a JSON object with an `error` field describing the issue.

## Rate Limiting

Implement rate limiting in production:
- Discount validation: 10 requests per minute per IP
- Order creation: 5 requests per minute per user

## CORS Configuration

Allowed origins (configured in Edge Functions):
- Development: `http://localhost:3000`, `http://localhost:5173`
- Production: Your domain only

## Webhooks (Optional)

### Stripe Payment Webhook

**Endpoint**: `POST /api/webhooks/stripe`

Handles Stripe payment events:
- `checkout.session.completed`: Creates order record
- `payment_intent.succeeded`: Updates order status
- `payment_intent.payment_failed`: Marks order as failed

## Database Indexes

For optimal performance, the following indexes are created:

```sql
-- Products table
CREATE INDEX idx_app_24de_products_category ON app_24de_products(category);
CREATE INDEX idx_app_24de_products_price ON app_24de_products(price);
CREATE INDEX idx_app_24de_products_name ON app_24de_products(name);

-- Discount codes
CREATE INDEX idx_app_24de_discount_codes_active ON app_24de_discount_codes(is_active, valid_until);

-- Orders
CREATE INDEX idx_app_24de_orders_email ON app_24de_orders(customer_email);
CREATE INDEX idx_app_24de_orders_created ON app_24de_orders(created_at);
```

## Storage

Product images are stored in Supabase Storage:

- **Bucket**: `app_24de_product_images`
- **Permissions**: Public read, authenticated upload
- **URL Format**: `https://[project-ref].supabase.co/storage/v1/object/public/app_24de_product_images/[filename]`

## Real-time Updates (Optional)

Products and orders tables are added to Supabase's realtime publication for potential admin dashboards:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_24de_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_24de_orders;
```

## Sample Data

### Products
```sql
INSERT INTO app_24de_products (name, description, price, category, image_url, stock) VALUES
('Wireless Headphones', 'Noise-cancelling over-ear headphones', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 50),
('Organic Coffee Beans', 'Premium single-origin beans', 24.99, 'Food', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 200);
```

### Discount Codes
```sql
INSERT INTO app_24de_discount_codes (code, discount_percent, is_active, valid_until) VALUES
('WELCOME10', 10, true, NULL),
('SUMMER25', 25, true, '2024-09-01 00:00:00+00');
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `ALLOWED_ORIGIN` environment variable matches your frontend URL
2. **Authentication Errors**: Verify JWT token is valid and not expired
3. **Database Errors**: Check RLS policies and table permissions
4. **Rate Limiting**: Implement exponential backoff for failed requests

### Logging

Edge Functions log to Supabase Function logs. Check the dashboard for:
- Input validation failures
- Database query errors
- Authentication issues

## Security Notes

- All user inputs are validated and sanitized
- SQL queries use parameterized inputs via Supabase client
- Error messages are generic in production
- API keys are stored in environment variables
- HTTPS is required for all production endpoints

---

*Last Updated: [Current Date]*  
*API Version: 1.0*