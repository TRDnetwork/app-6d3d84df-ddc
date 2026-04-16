```jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CheckoutSuccess = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      fetchOrderDetails();
    }
  }, [session_id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('app_24de_orders')
        .select('*')
        .eq('stripe_session_id', session_id)
        .single();

      if (error) throw error;

      setOrder(data);
      
      // Clear cart from localStorage
      localStorage.removeItem('gradient_cart_cart');
      localStorage.removeItem('gradient_cart_discount');
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="confirmation-container">
        <div className="loading-spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-icon success">✓</div>
        <h1>Payment Successful!</h1>
        <p className="confirmation-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        {order && (
          <div className="order-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <strong>{order.id}</strong>
            </div>
            <div className="detail-row">
              <span>Order Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <strong>${order.final_amount}</strong>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-badge paid">Paid</span>
            </div>
          </div>
        )}

        <div className="confirmation-actions">
          <button 
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            Print Receipt
          </button>
        </div>

        <div className="confirmation-note">
          <p>📧 A confirmation email has been sent to your email address.</p>
          <p>🔄 You can track your order status in your account dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
```