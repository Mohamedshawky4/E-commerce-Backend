import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn("⚠️ [EMAIL] RESEND_API_KEY is missing. Email transmissions disabled.");
}

export const sendEmail = async ({ to, subject, html }) => {
    if (!resend) {
        console.error("❌ [EMAIL] Attempted to send email but RESEND_API_KEY is missing.");
        return { error: "API Key missing" };
    }
    try {
        const data = await resend.emails.send({
            from: 'Nexus <noreply@yourdomain.com>',
            to,
            subject,
            html,
        });
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendOrderConfirmation = async (userEmail, order) => {
    const subject = `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`;
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #00f2ff;">Nexus Authorization Successful</h2>
      <p>Your order <strong>#${order._id}</strong> has been logged into the fulfillment nexus.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <h3>Order Breakdown</h3>
      <ul style="list-style: none; padding: 0;">
        ${order.orderItems.map(item => `
          <li style="margin-bottom: 10px;">
            <span>${item.name}</span> x ${item.qty} - <strong>$${item.price.toFixed(2)}</strong>
          </li>
        `).join('')}
      </ul>
      <p style="font-size: 1.2em; font-weight: bold; color: #00f2ff;">Total: $${order.totalPrice.toFixed(2)}</p>
      <p style="font-size: 0.8em; color: #666; margin-top: 40px;">This is an automated transmission. Do not reply.</p>
    </div>
  `;

    return sendEmail({ to: userEmail, subject, html });
};
