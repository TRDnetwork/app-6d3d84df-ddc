```javascript
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  const { customer_email, metadata, amount_total } = session;
  const cartItems = JSON.parse(metadata.cart_items || '[]');
  const discount_percent = parseFloat(metadata.discount_percent || '0');
  const total_amount = parseFloat(metadata.total_amount || '0');

  // Calculate amounts
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const discount_amount = discount_percent > 0 ? 
    (subtotal * discount_percent / 100) : 0;

  // Create order in database
  const { data: order, error } = await supabase
    .from('app_24de_orders')
    .insert({
      customer_email,
      total_amount: subtotal,
      discount_applied: discount_amount,
      final_amount: total_amount,
      status: 'paid',
      items: cartItems,
      stripe_session_id: session.id,
      payment_status: 'succeeded'
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create order:', error);
    throw error;
  }

  console.log('Order created successfully:', order.id);

  // Update product stock (if tracking inventory)
  for (const item of cartItems) {
    if (item.product_id) {
      await supabase.rpc('decrement_product_stock', {
        product_id: item.product_id,
        quantity: item.quantity
      }).catch(err => {
        console.error('Failed to update stock for product:', item.product_id, err);
      });
    }
  }

  // Send confirmation email (optional)
  // await sendOrderConfirmationEmail(customer_email, order);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update order status if needed
  if (paymentIntent.metadata.order_id) {
    await supabase
      .from('app_24de_orders')
      .update({
        payment_status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', paymentIntent.metadata.order_id);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update order status if needed
  if (paymentIntent.metadata.order_id) {
    await supabase
      .from('app_24de_orders')
      .update({
        payment_status: 'failed',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'payment_failed'
      })
      .eq('id', paymentIntent.metadata.order_id);
  }
}
```