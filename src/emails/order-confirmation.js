```javascript
/**
 * Generate order confirmation email template
 * @param {Object} order - Order details
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total
 * @param {Array} order.items - Order items
 * @param {string} order.date - Order date
 * @returns {string} - HTML email template
 */
export function generateOrderConfirmationTemplate(order) {
  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const itemsHtml = order.items.map(item => `
    <div class="order-item">
      <div>
        <strong>${item.name}</strong><br>
        <small>Quantity: ${item.quantity}</small>
      </div>
      <div>$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
  
  const content = `
    <div class="email-content">
      <h2>Order Confirmed! ✅</h2>
      
      <p>Thank you for your purchase! We're preparing your order for shipment.</p>
      
      <div class="order-details">
        <h3 style="margin-bottom: 15px; color: #333;">Order Details</h3>
        
        <div style="margin-bottom: 15px;">
          <strong>Order Number:</strong> ${order.id}<br>
          <strong>Order Date:</strong> ${formattedDate}
        </div>
        
        <h4 style="margin: 20px 0 10px 0; color: #555;">Items Ordered</h4>
        ${itemsHtml}
        
        <div class="order-total">
          <span>Total:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>
      
      <p><strong>Shipping Information:</strong></p>
      <p>Your order will be processed within 24 hours. You'll receive another email with tracking information once your order ships.</p>
      
      <p><strong>Need to make changes?</strong><br>
      If you need to modify or cancel your order, please contact our support team within the next hour.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="[ORDER_TRACKING_URL]" class="button" style="color: white; text-decoration: none;">
          Track Your Order
        </a>
      </div>
      
      <p>Thank you for shopping with us!<br>
      The Gradient Cart Team</p>
    </div>
  `;
  
  return generateBaseTemplate(content);
}

/**
 * Generate payment success email template
 * @param {Object} payment - Payment details
 * @param {string} payment.orderId - Order ID
 * @param {number} payment.amount - Payment amount
 * @param {string} payment.transactionId - Transaction ID
 * @returns {string} - HTML email template
 */
export function generatePaymentSuccessTemplate(payment) {
  const content = `
    <div class="email-content">
      <h2>Payment Successful! 💳</h2>
      
      <p>Your payment has been processed successfully.</p>
      
      <div class="order-details">
        <h3 style="margin-bottom: 15px; color: #333;">Payment Details</h3>
        
        <div class="order-item">
          <div>Order Number</div>
          <div>${payment.orderId}</div>
        </div>
        
        <div class="order-item">
          <div>Transaction ID</div>
          <div>${payment.transactionId}</div>
        </div>
        
        <div class="order-item">
          <div>Amount Paid</div>
          <div>$${payment.amount.toFixed(2)}</div>
        </div>
        
        <div class="order-item">
          <div>Payment Method</div>
          <div>Credit/Debit Card</div>
        </div>
        
        <div class="order-item">
          <div>Payment Status</div>
          <div style="color: #28a745; font-weight: bold;">Completed</div>
        </div>
      </div>
      
      <p><strong>What's next?</strong></p>
      <p>Your order is now being processed. You'll receive a separate email with shipping details and tracking information.</p>
      
      <p><strong>Receipt</strong><br>
      A detailed receipt is available in your account dashboard. You can also download it for your records.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="[RECEIPT_URL]" class="button" style="color: white; text-decoration: none;">
          Download Receipt
        </a>
      </div>
      
      <p>Thank you for your purchase!<br>
      The Gradient Cart Team</p>
    </div>
  `;
  
  return generateBaseTemplate(content);
}
```