# Email Integration Setup for Gradient Cart

## 1. Resend Setup

### Create a Resend Account
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. Navigate to API Keys section

### Get API Key
1. Click "Add API Key"
2. Name it "Gradient Cart Production"
3. Copy the generated API key

## 2. Environment Variables

Add to your `.env` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
APP_NAME=Gradient Cart
APP_URL=https://yourdomain.com
```

## 3. Integration Points

### 1. User Registration (Auth Flow)
When a user signs up, send welcome email:

```javascript
// In your auth signup function
import { sendWelcomeEmail } from './lib/email';

async function handleSignUp(email, name) {
  // ... existing signup logic
  
  // Send welcome email (don't await to avoid blocking)
  sendWelcomeEmail(email, name).catch(console.error);
  
  // ... continue with signup
}
```

### 2. Order Confirmation
After successful order creation:

```javascript
// In your order creation function
import { sendOrderConfirmationEmail } from './lib/email';

async function createOrder(orderData) {
  // ... create order in database
  
  // Send confirmation email
  const order = {
    id: orderId,
    total: totalAmount,
    items: cartItems,
    date: new Date().toISOString()
  };
  
  sendOrderConfirmationEmail(customerEmail, order).catch(console.error);
  
  return order;
}
```

### 3. Payment Success
After Stripe payment webhook:

```javascript
// In your Stripe webhook handler
import { sendPaymentSuccessEmail } from './lib/email';

async function handlePaymentSuccess(session) {
  // ... process payment
  
  // Send payment success email
  const payment = {
    orderId: order.id,
    amount: session.amount_total / 100, // Convert from cents
    transactionId: session.id
  };
  
  sendPaymentSuccessEmail(customerEmail, payment).catch(console.error);
}
```

### 4. Password Reset
In your password reset flow:

```javascript
// In your password reset function
import { sendPasswordResetEmail } from './lib/email';

async function requestPasswordReset(email) {
  // Generate reset token and link
  const resetToken = generateResetToken();
  const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  
  // Send reset email
  await sendPasswordResetEmail(email, resetLink);
  
  return { success: true };
}
```

## 4. Email Templates Customization

### Update Branding
Edit the base template in `src/lib/email.js`:
- Change colors in CSS to match your cyberpunk theme
- Update logo/header design
- Modify footer information

### Update Content
Each template file can be customized:
- `welcome.js`: Welcome message and onboarding content
- `order-confirmation.js`: Order details and shipping info
- `password-reset.js`: Security instructions

### Add Dynamic Content
Replace placeholders in templates:
- `[APP_URL]`: Your application URL
- `[ORDER_TRACKING_URL]`: Order tracking page
- `[RECEIPT_URL]`: Receipt download link
- `[UNSUBSCRIBE_LINK]`: Unsubscribe management

## 5. Testing

### Development Testing
1. Use Resend's test mode
2. Send test emails to yourself
3. Check email rendering on different clients

### Test Email Addresses
Resend provides test domains:
- `@resend.dev` domains work without verification
- Use for development and testing

### Production Verification
1. Verify your sending domain in Resend dashboard
2. Set up DKIM/SPF records
3. Warm up your domain reputation

## 6. Monitoring & Analytics

### Resend Dashboard
Monitor from [Resend Dashboard](https://resend.com/overview):
- Email delivery rates
- Open rates
- Click-through rates
- Bounce rates

### Error Handling
The email service includes error handling:
- Failed emails won't crash your app
- Errors are logged to console
- You can implement retry logic if needed

## 7. Best Practices

### 1. Rate Limiting
- Resend has rate limits (check current limits)
- Implement queueing for bulk emails
- Use background jobs for non-critical emails

### 2. Unsubscribe Compliance
- Include unsubscribe link in all emails
- Honor unsubscribe requests promptly
- Maintain suppression lists

### 3. Content Guidelines
- Avoid spam trigger words
- Include physical address in footer
- Provide clear sender identification

### 4. Performance
- Use async/await for email sending
- Don't block user flows waiting for emails
- Implement email queue for better performance

## 8. Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check RESEND_API_KEY environment variable
   - Verify Resend account is active
   - Check rate limits

2. **Emails going to spam**
   - Verify domain authentication
   - Check email content
   - Warm up domain reputation

3. **Template rendering issues**
   - Test in different email clients
   - Check CSS support
   - Validate HTML

### Support
- Resend Documentation: https://resend.com/docs
- Email deliverability guides
- API reference

## 9. Next Steps

1. Set up Resend account and get API key
2. Add environment variables
3. Test email sending in development
4. Verify domain for production
5. Monitor initial email performance
6. Set up email analytics tracking

---

**Note:** Remember to replace all placeholder URLs (`[APP_URL]`, etc.) with your actual application URLs before going to production.