// Email notification system stub
// TODO: Integrate with email service provider (Resend, Postmark, SendGrid, etc.)

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderConfirmationData {
  order_id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  total_amount: number;
  currency: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  estimated_delivery?: Date;
  tracking_url?: string;
}

export interface ShippingNotificationData {
  order_id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  tracking_number: string;
  carrier: string;
  tracking_url: string;
  estimated_delivery?: Date;
}

export interface EmailSendResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

// Send order confirmation email
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<EmailSendResult> {
  try {
    console.log('Sending order confirmation email to:', data.customer_email);
    console.log('Order details:', {
      order_number: data.order_number,
      total_amount: data.total_amount,
      items_count: data.items.length
    });

    // STUB: Log email content instead of actually sending
    const template = generateOrderConfirmationTemplate(data);
    console.log('Email template generated:', {
      subject: template.subject,
      html_length: template.html.length,
      text_length: template.text.length
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual email service integration
    // Example with Resend:
    // const { data: result, error } = await resend.emails.send({
    //   from: 'Mañana <orders@manana.store>',
    //   to: [data.customer_email],
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text
    // });

    return {
      success: true,
      message_id: `fake_msg_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send shipping notification email
export async function sendShippingNotification(data: ShippingNotificationData): Promise<EmailSendResult> {
  try {
    console.log('Sending shipping notification email to:', data.customer_email);
    console.log('Shipping details:', {
      order_number: data.order_number,
      tracking_number: data.tracking_number,
      carrier: data.carrier
    });

    // STUB: Log email content instead of actually sending
    const template = generateShippingNotificationTemplate(data);
    console.log('Email template generated:', {
      subject: template.subject,
      html_length: template.html.length,
      text_length: template.text.length
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual email service integration
    return {
      success: true,
      message_id: `fake_msg_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send password reset email
export async function sendPasswordReset(email: string, resetUrl: string): Promise<EmailSendResult> {
  try {
    console.log('Sending password reset email to:', email);
    console.log('Reset URL:', resetUrl);

    const template = generatePasswordResetTemplate(resetUrl);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual email service integration
    return {
      success: true,
      message_id: `fake_msg_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error sending password reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send welcome email to new users
export async function sendWelcomeEmail(email: string, name?: string): Promise<EmailSendResult> {
  try {
    console.log('Sending welcome email to:', email);

    const template = generateWelcomeTemplate(name);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual email service integration
    return {
      success: true,
      message_id: `fake_msg_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Generate order confirmation email template
function generateOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.product_name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">` : ''}
        ${item.product_name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const subject = `Order Confirmation - ${data.order_number}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Thank you for your order!</h1>
      <p>Hi ${data.customer_name || 'there'},</p>
      <p>We've received your order and it's being processed. Here are the details:</p>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h2 style="margin-top: 0;">Order ${data.order_number}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #eee;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background: #f5f5f5;">
              <td colspan="2" style="padding: 10px;">Total</td>
              <td style="padding: 10px; text-align: right;">$${data.total_amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${data.shipping_address ? `
        <div style="margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>
            ${data.shipping_address.line1}<br>
            ${data.shipping_address.line2 ? data.shipping_address.line2 + '<br>' : ''}
            ${data.shipping_address.city}, ${data.shipping_address.state} ${data.shipping_address.postal_code}<br>
            ${data.shipping_address.country}
          </p>
        </div>
      ` : ''}

      ${data.estimated_delivery ? `
        <p><strong>Estimated Delivery:</strong> ${data.estimated_delivery.toLocaleDateString()}</p>
      ` : ''}

      <p>We'll send you another email with tracking information once your order ships.</p>
      
      <p>Thanks for shopping with Mañana!</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        If you have any questions, please contact us at support@manana.store
      </p>
    </body>
    </html>
  `;

  const text = `
    Thank you for your order!

    Order ${data.order_number}
    
    ${data.items.map(item => `${item.product_name} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n')}
    
    Total: $${data.total_amount.toFixed(2)}
    
    ${data.estimated_delivery ? `Estimated Delivery: ${data.estimated_delivery.toLocaleDateString()}` : ''}
    
    We'll send you tracking information once your order ships.
    
    Thanks for shopping with Mañana!
  `;

  return { subject, html, text };
}

// Generate shipping notification email template
function generateShippingNotificationTemplate(data: ShippingNotificationData): EmailTemplate {
  const subject = `Your order ${data.order_number} has shipped!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Your order is on the way!</h1>
      <p>Hi ${data.customer_name || 'there'},</p>
      <p>Great news! Your order ${data.order_number} has shipped and is on its way to you.</p>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h2 style="margin-top: 0;">Tracking Information</h2>
        <p><strong>Carrier:</strong> ${data.carrier}</p>
        <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
        ${data.estimated_delivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimated_delivery.toLocaleDateString()}</p>` : ''}
        
        <p style="margin: 20px 0;">
          <a href="${data.tracking_url}" style="background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Package</a>
        </p>
      </div>
      
      <p>Thanks for shopping with Mañana!</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        If you have any questions, please contact us at support@manana.store
      </p>
    </body>
    </html>
  `;

  const text = `
    Your order is on the way!

    Order ${data.order_number} has shipped.
    
    Carrier: ${data.carrier}
    Tracking Number: ${data.tracking_number}
    ${data.estimated_delivery ? `Estimated Delivery: ${data.estimated_delivery.toLocaleDateString()}` : ''}
    
    Track your package: ${data.tracking_url}
    
    Thanks for shopping with Mañana!
  `;

  return { subject, html, text };
}

// Generate password reset email template
function generatePasswordResetTemplate(resetUrl: string): EmailTemplate {
  const subject = 'Reset your Mañana password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Reset your password</h1>
      <p>We received a request to reset your password for your Mañana account.</p>
      
      <p style="margin: 30px 0;">
        <a href="${resetUrl}" style="background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </p>
      
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        If you're having trouble with the button above, copy and paste this URL into your browser:<br>
        ${resetUrl}
      </p>
    </body>
    </html>
  `;

  const text = `
    Reset your password
    
    We received a request to reset your password for your Mañana account.
    
    Click here to reset your password: ${resetUrl}
    
    If you didn't request this password reset, please ignore this email.
    This link will expire in 24 hours for security reasons.
  `;

  return { subject, html, text };
}

// Generate welcome email template
function generateWelcomeTemplate(name?: string): EmailTemplate {
  const subject = 'Welcome to Mañana!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Welcome to Mañana!</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Welcome to the Mañana marketplace! We're excited to have you join our community of creators and customers.</p>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h2 style="margin-top: 0;">Get Started</h2>
        <ul>
          <li>Browse our marketplace for unique designs</li>
          <li>Create your own designs in our studio</li>
          <li>Follow your favorite creators</li>
          <li>Build your wishlist</li>
        </ul>
      </div>
      
      <p>If you have any questions, our support team is here to help at support@manana.store</p>
      
      <p>Happy creating!</p>
      <p>The Mañana Team</p>
    </body>
    </html>
  `;

  const text = `
    Welcome to Mañana!

    Hi ${name || 'there'},
    
    Welcome to the Mañana marketplace! We're excited to have you join our community.
    
    Get Started:
    - Browse our marketplace for unique designs
    - Create your own designs in our studio
    - Follow your favorite creators
    - Build your wishlist
    
    If you have any questions, contact us at support@manana.store
    
    Happy creating!
    The Mañana Team
  `;

  return { subject, html, text };
}