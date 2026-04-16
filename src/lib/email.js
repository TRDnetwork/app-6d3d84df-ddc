```javascript
import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (can be changed later by user)
const DEFAULT_FROM = 'onboarding@resend.dev';
const APP_NAME = 'Gradient Cart';

/**
 * Send email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (defaults to DEFAULT_FROM)
 * @returns {Promise<Object>} - Resend response
 */
export async function sendEmail({ to, subject, html, from = DEFAULT_FROM }) {
  try {
    const data = await resend.emails.send({
      from: `${APP_NAME} <${from}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't crash the app on email failure
    return { success: false, error };
  }
}

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} - Send result
 */
export async function sendWelcomeEmail(email, name = 'there') {
  const subject = `Welcome to ${APP_NAME}!`;
  const html = generateWelcomeTemplate(name);
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order details
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total amount
 * @param {Array} order.items - Order items
 * @returns {Promise<Object>} - Send result
 */
export async function sendOrderConfirmationEmail(email, order) {
  const subject = `Your ${APP_NAME} Order #${order.id.slice(0, 8)}`;
  const html = generateOrderConfirmationTemplate(order);
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send payment success email
 * @param {string} email - Customer email
 * @param {Object} payment - Payment details
 * @param {string} payment.orderId - Order ID
 * @param {number} payment.amount - Payment amount
 * @param {string} payment.transactionId - Transaction/Stripe session ID
 * @returns {Promise<Object>} - Send result
 */
export async function sendPaymentSuccessEmail(email, payment) {
  const subject = `Payment Confirmed for Order #${payment.orderId.slice(0, 8)}`;
  const html = generatePaymentSuccessTemplate(payment);
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<Object>} - Send result
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const subject = `Reset Your ${APP_NAME} Password`;
  const html = generatePasswordResetTemplate(resetLink);
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
}

// Helper function to generate base email template
function generateBaseTemplate(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        
        .email-header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .email-body {
          padding: 40px 30px;
        }
        
        .email-content {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
        }
        
        .email-content h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 22px;
        }
        
        .email-content p {
          margin-bottom: 20px;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        
        .order-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .order-item:last-child {
          border-bottom: none;
        }
        
        .order-total {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #dee2e6;
        }
        
        .email-footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        
        .email-footer a {
          color: #667eea;
          text-decoration: none;
        }
        
        @media (max-width: 600px) {
          .email-body {
            padding: 20px 15px;
          }
          
          .email-header {
            padding: 20px 15px;
          }
          
          .email-header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${APP_NAME}</h1>
          <p>Cyberpunk E-Commerce Experience</p>
        </div>
        
        <div class="email-body">
          ${content}
        </div>
        
        <div class="email-footer">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          <p>
            <a href="[UNSUBSCRIBE_LINK]" style="color: #6c757d; text-decoration: underline;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```