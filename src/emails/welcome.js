```javascript
/**
 * Generate welcome email template
 * @param {string} name - User's name
 * @returns {string} - HTML email template
 */
export function generateWelcomeTemplate(name = 'there') {
  const content = `
    <div class="email-content">
      <h2>Welcome to Gradient Cart! 🎉</h2>
      
      <p>Hi ${name},</p>
      
      <p>Welcome to the future of shopping! We're thrilled to have you join our cyberpunk marketplace.</p>
      
      <p>At Gradient Cart, you'll discover:</p>
      
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Curated tech and lifestyle products</li>
        <li>Exclusive discount codes for members</li>
        <li>Secure, seamless checkout experience</li>
        <li>Real-time order tracking</li>
      </ul>
      
      <p>Ready to explore? Start shopping now and experience the future of e-commerce.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="[APP_URL]" class="button" style="color: white; text-decoration: none;">
          Start Shopping
        </a>
      </div>
      
      <p>Need help? Our support team is always here to assist you.</p>
      
      <p>Welcome aboard,<br>
      The Gradient Cart Team</p>
    </div>
  `;
  
  return generateBaseTemplate(content);
}

/**
 * Send welcome email (wrapper function)
 * @param {string} email - User email
 * @param {string} name - User name
 */
export async function sendWelcomeEmail(email, name) {
  // This would be called from your auth flow
  // For now, it's a template function
  console.log(`Welcome email would be sent to: ${email}`);
  return { success: true };
}
```