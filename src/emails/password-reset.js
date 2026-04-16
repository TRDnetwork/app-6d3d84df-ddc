```javascript
/**
 * Generate password reset email template
 * @param {string} resetLink - Password reset link
 * @returns {string} - HTML email template
 */
export function generatePasswordResetTemplate(resetLink) {
  const content = `
    <div class="email-content">
      <h2>Reset Your Password</h2>
      
      <p>We received a request to reset your password for your Gradient Cart account.</p>
      
      <p>If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button" style="color: white; text-decoration: none;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        <strong>Important:</strong> This link will expire in 1 hour for security reasons.
      </p>
      
      <p>Or copy and paste this link into your browser:<br>
      <code style="background: #f8f9fa; padding: 10px; border-radius: 5px; display: block; margin: 10px 0; word-break: break-all;">
        ${resetLink}
      </code>
      </p>
      
      <p>Need help? Contact our support team if you have any issues resetting your password.</p>
      
      <p>Stay secure,<br>
      The Gradient Cart Team</p>
    </div>
  `;
  
  return generateBaseTemplate(content);
}
```