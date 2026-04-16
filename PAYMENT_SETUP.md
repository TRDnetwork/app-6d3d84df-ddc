# Stripe Payment Integration Setup

## 1. Stripe Account Setup

### Create a Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up for an account
2. Complete the onboarding process
3. Enable test mode for development

### Get API Keys
1. Navigate to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## 2. Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook Secret (see step 3)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Webhook Setup

### Local Development
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret from the CLI output

### Production
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret

## 4. Database Updates

Run these SQL commands to add payment columns to your orders table:

```sql
-- Add payment-related columns to orders table
ALTER TABLE app_24de_orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_24de_orders_stripe_session ON app_24de_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_app_24de_orders_payment_status ON app_24de_orders(payment_status);
```

## 5. Stock Management Function

Create this PostgreSQL function to handle inventory updates:

```sql
-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(
    product_id UUID,
    quantity INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE app_24de_products
    SET stock = GREATEST(0, stock - quantity)
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
```

## 6. Testing Payments

### Test Cards
Use these test card numbers in Stripe test mode:

- **Successful payment**: `4242 4242 4242 4242`
- **Authentication required**: `4000 0025 0000 3155`
- **Declined card**: `4000 0000 0000 0002`

### Test Flow
1. Add items to cart
2. Proceed to checkout
3. Enter test card details
4. Verify payment success page appears
5. Check Stripe dashboard for payment record
6. Verify order created in database

## 7. Going Live

### Switch to Live Mode
1. In Stripe Dashboard, toggle from "Test" to "Live" mode
2. Update environment variables with live keys
3. Set up production webhook endpoint
4. Update `NEXT_PUBLIC_APP_URL` to your production domain

### Required Business Information
Before processing live payments, ensure you have:
- Business name and address
- Bank account for payouts
- Terms of service and refund policy
- PCI compliance (handled by Stripe)

## 8. Monitoring & Support

### Dashboard Access
- [Stripe Dashboard](https://dashboard.stripe.com): Monitor payments, customers, and revenue
- [Stripe Logs](https://dashboard.stripe.com/test/logs): Debug API requests

### Common Issues

1. **Webhook failures**: Verify webhook secret and endpoint URL
2. **Payment declines**: Check card details and Stripe Radar rules
3. **Order not created**: Check database connection and webhook handler
4. **CORS errors**: Ensure proper headers in API routes

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [API Reference](https://stripe.com/docs/api)

## 9. Security Notes

- Never commit Stripe keys to version control
- Use environment variables for all secrets
- Enable HTTPS in production
- Regularly rotate API keys
- Monitor for suspicious activity in Stripe Dashboard
- Implement rate limiting on API endpoints

## 10. Additional Features (Optional)

Consider adding these features later:

1. **Subscription payments**: For recurring products
2. **Saved payment methods**: Using Stripe Customer objects
3. **Multiple currencies**: Configure in Stripe dashboard
4. **Tax calculation**: Integrate with TaxJar or Stripe Tax
5. **Fraud prevention**: Enable Stripe Radar

---

**Next Steps:**
1. Set up environment variables
2. Test with Stripe test cards
3. Deploy to production
4. Monitor initial transactions
5. Set up email notifications for new orders