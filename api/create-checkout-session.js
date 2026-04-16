```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cartItems, customer_email, discount_percent, total_amount } = req.body;

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    if (!customer_email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Create line items for Stripe
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
          metadata: {
            product_id: item.product_id
          }
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add discount as a separate line item if applicable
    if (discount_percent > 0) {
      const subtotal = cartItems.reduce((sum, item) => 
        sum + (item.price * item.quantity * 100), 0
      );
      const discountAmount = Math.round(subtotal * discount_percent / 100);
      
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Discount (${discount_percent}% off)`,
          },
          unit_amount: -discountAmount, // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: customer_email,
      metadata: {
        discount_percent: discount_percent.toString(),
        total_amount: total_amount.toString(),
        cart_items: JSON.stringify(cartItems)
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
}
```