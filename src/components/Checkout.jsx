```jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Checkout = ({ cart, discount, customerEmail, onPaymentSuccess, onPaymentCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount ? (subtotal * discount.discount_percent / 100) : 0;
    return (subtotal - discountAmount).toFixed(2);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart.map(item => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url
          })),
          customer_email: customerEmail,
          discount_percent: discount?.discount_percent || 0,
          total_amount: calculateTotal()
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-summary">
        <h2>Payment Summary</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            <span>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
          </div>
          {discount && (
            <div className="summary-row discount">
              <span>Discount ({discount.discount_percent}%)</span>
              <span>-${(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * discount.discount_percent / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>

        <div className="payment-methods">
          <div className="payment-method">
            <div className="payment-icon">💳</div>
            <div className="payment-info">
              <h4>Credit/Debit Card</h4>
              <p>Visa, Mastercard, American Express</p>
            </div>
          </div>
          <div className="payment-method">
            <div className="payment-icon">📱</div>
            <div className="payment-info">
              <h4>Digital Wallets</h4>
              <p>Apple Pay, Google Pay</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isProcessing || cart.length === 0}
          className="checkout-button"
        >
          {isProcessing ? 'Processing...' : `Pay $${calculateTotal()}`}
        </button>

        <p className="secure-notice">
          🔒 Secure payment powered by Stripe. Your payment information is encrypted.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
```