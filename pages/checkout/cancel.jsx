```jsx
import React from 'react';
import { useRouter } from 'next/router';

const CheckoutCancel = () => {
  const router = useRouter();

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-icon cancel">✕</div>
        <h1>Payment Cancelled</h1>
        <p className="confirmation-message">
          Your payment was cancelled. No charges were made to your account.
        </p>
        
        <div className="cancel-reasons">
          <h3>Common reasons for cancellation:</h3>
          <ul>
            <li>You decided not to complete the purchase</li>
            <li>Payment method was declined</li>
            <li>Technical issue during checkout</li>
          </ul>
        </div>

        <div className="confirmation-actions">
          <button 
            onClick={() => router.push('/cart')}
            className="btn btn-primary"
          >
            Return to Cart
          </button>
          <button 
            onClick={() => router.push('/')}
            className="btn btn-secondary"
          >
            Continue Shopping
          </button>
        </div>

        <div className="confirmation-note">
          <p>💳 If you experienced payment issues, try a different payment method.</p>
          <p>🆘 Need help? Contact our support team at support@gradientcart.com</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
```