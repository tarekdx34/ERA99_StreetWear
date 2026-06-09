import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "noreply@qutb.studio";
}

export async function sendOrderConfirmation(order: {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
}) {
  if (!order.customerEmail) return;

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(26, 23, 20, 0.12); color: #1A1714; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px;">
        ${escapeHtml(item.name)} &mdash; ${escapeHtml(item.size)}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(26, 23, 20, 0.12); color: #1A1714; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; text-align: right;">
        ${escapeHtml(item.quantity)} &times; ${escapeHtml(item.unitPrice)} EGP
      </td>
    </tr>
  `,
    )
    .join("");

  await resend.emails.send({
    from: getFromEmail(),
    to: order.customerEmail,
    subject: `QUTB — Order confirmed. ERA 99. ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
      <body style="margin: 0; padding: 0; background-color: #EBE4D8;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #EBE4D8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                <tr>
                  <td style="padding: 0 0 32px 0; text-align: center;">
                    <p style="font-family: 'Cormorant Garamond', 'DM Sans', Arial, serif; font-size: 52px; font-weight: 600; color: #1A1714; margin: 0; letter-spacing: 4px; text-transform: uppercase;">QUTB</p>
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #8C8278; margin: 8px 0 0 0; letter-spacing: 4px; text-transform: uppercase;">ERA 99 — ALEXANDRIA</p>
                  </td>
                </tr>
                <tr><td style="border-top: 1px solid rgba(26, 23, 20, 0.12); padding-bottom: 32px;"></td></tr>
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #8C8278; margin: 0 0 8px 0; letter-spacing: 3px; text-transform: uppercase;">Order confirmed</p>
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 24px; font-weight: 500; color: #1A1714; margin: 0;">${escapeHtml(order.orderNumber)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #EBE4D8; padding: 16px; margin-bottom: 32px;">
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #1A1714; margin: 0;">Our team will call you within 24 hours to confirm your order before shipping.</p>
                  </td>
                </tr>
                <tr><td style="padding: 16px 0;"></td></tr>
                <tr>
                  <td>
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #8C8278; margin: 0 0 16px 0; letter-spacing: 3px; text-transform: uppercase;">Your order</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 16px 0 8px 0; color: #8C8278; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">Subtotal</td>
                        <td style="padding: 16px 0 8px 0; color: #8C8278; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; text-align: right;">${escapeHtml(order.subtotal)} EGP</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #8C8278; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">Delivery</td>
                        <td style="padding: 4px 0; color: #8C8278; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; text-align: right;">${order.deliveryFee === 0 ? "FREE" : `${escapeHtml(order.deliveryFee)} EGP`}</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 0 0; border-top: 1px solid rgba(26, 23, 20, 0.12); color: #1A1714; font-family: 'DM Sans', Arial, sans-serif; font-size: 16px; font-weight: 500;">Total</td>
                        <td style="padding: 16px 0 0 0; border-top: 1px solid rgba(26, 23, 20, 0.12); color: #1A1714; font-family: 'DM Sans', Arial, sans-serif; font-size: 16px; font-weight: 500; text-align: right;">${escapeHtml(order.total)} EGP</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="border-top: 1px solid rgba(26, 23, 20, 0.12); padding: 32px 0;"></td></tr>
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #8C8278; margin: 0 0 12px 0; letter-spacing: 3px; text-transform: uppercase;">Delivering to</p>
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #1A1714; margin: 0; line-height: 1.6;">${escapeHtml(order.customerName)}<br>${escapeHtml(order.address)}<br>${escapeHtml(order.city)}, ${escapeHtml(order.governorate)}<br>${escapeHtml(order.phone)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid rgba(26, 23, 20, 0.12); padding-top: 32px; text-align: center;">
                    <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #8C8278; margin: 0; letter-spacing: 2px;">QUTB · Alexandria, Egypt · The axis holds.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

export async function sendEmailVerification(
  email: string,
  verificationUrl: string,
) {
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "QUTB — Verify your email.",
    html: `
      <body style="margin:0;padding:0;background:#EBE4D8;">
        <table width="100%" style="padding:40px 20px;background:#EBE4D8;">
          <tr><td align="center">
            <table width="600" style="max-width:600px;">
              <tr><td style="text-align:center;padding-bottom:32px;">
                <p style="font-family:'Cormorant Garamond', 'DM Sans', Arial, serif;font-size:52px;font-weight:600;color:#1A1714;margin:0;letter-spacing:4px;text-transform:uppercase;">QUTB</p>
              </td></tr>
              <tr><td style="padding-bottom:24px;">
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:14px;color:#1A1714;margin:0;">Verify your email to access your QUTB account.</p>
              </td></tr>
              <tr><td style="padding-bottom:32px;">
                <a href="${escapeHtml(verificationUrl)}" style="display:inline-block;background:#1A1714;color:#EBE4D8;font-family:'DM Sans', Arial, sans-serif;font-size:13px;font-weight:500;padding:14px 32px;text-decoration:none;letter-spacing:2px;">VERIFY EMAIL</a>
              </td></tr>
              <tr><td>
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:12px;color:#8C8278;margin:0;">This link expires in 24 hours. If you did not create a QUTB account, ignore this email.</p>
              </td></tr>
              <tr><td style="border-top:1px solid rgba(26, 23, 20, 0.12);padding-top:24px;margin-top:32px;">
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:12px;color:#8C8278;margin:0;text-align:center;letter-spacing:2px;">QUTB · Alexandria, Egypt · The axis holds.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    `,
  });
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "QUTB — Reset your password.",
    html: `
      <body style="margin:0;padding:0;background:#EBE4D8;">
        <table width="100%" style="padding:40px 20px;background:#EBE4D8;">
          <tr><td align="center">
            <table width="600" style="max-width:600px;">
              <tr><td style="text-align:center;padding-bottom:32px;">
                <p style="font-family:'Cormorant Garamond', 'DM Sans', Arial, serif;font-size:52px;font-weight:600;color:#1A1714;margin:0;letter-spacing:4px;text-transform:uppercase;">QUTB</p>
              </td></tr>
              <tr><td style="padding-bottom:24px;">
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:14px;color:#1A1714;margin:0;">Someone requested a password reset for your QUTB account. If this was you, click below.</p>
              </td></tr>
              <tr><td style="padding-bottom:32px;">
                <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#1A1714;color:#EBE4D8;font-family:'DM Sans', Arial, sans-serif;font-size:13px;font-weight:500;padding:14px 32px;text-decoration:none;letter-spacing:2px;">RESET PASSWORD</a>
              </td></tr>
              <tr><td>
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:12px;color:#8C8278;margin:0;">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
              </td></tr>
              <tr><td style="border-top:1px solid rgba(26, 23, 20, 0.12);padding-top:24px;margin-top:32px;">
                <p style="font-family:'DM Sans', Arial, sans-serif;font-size:12px;color:#8C8278;margin:0;text-align:center;letter-spacing:2px;">QUTB · Alexandria, Egypt · The axis holds.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    `,
  });
}
