type WhatsAppOrderPayload = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building?: string | null;
  notes?: string | null;
  items: Array<{
    name: string;
    color: string;
    size: string;
    qty: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
};

type WhatsAppCredentials = {
  accountSid?: string;
  authToken?: string;
  from?: string;
  to?: string;
};

function buildMessage(payload: WhatsAppOrderPayload) {
  const itemLines = payload.items
    .map(
      (item) =>
        `• ${item.name} — ${item.color} — ${item.size} — x${item.qty} — ${item.unitPrice * item.qty} EGP`,
    )
    .join("\n");

  return [
    `🖤 NEW ERA 99 ORDER #ERA-${String(payload.id).padStart(5, "0")}`,
    "───────────────",
    payload.customerName,
    payload.phone,
    `${payload.address}${payload.building ? `, ${payload.building}` : ""}, ${payload.city}, ${payload.governorate}`,
    "───────────────",
    "ITEMS:",
    itemLines,
    "───────────────",
    `SUBTOTAL: ${payload.subtotal} EGP`,
    `DELIVERY: ${payload.deliveryFee === 0 ? "FREE (Alexandria)" : `${payload.deliveryFee} EGP`}`,
    `TOTAL: ${payload.total} EGP`,
    `PAYMENT: ${payload.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}`,
    `NOTES: ${payload.notes || "-"}`,
    "───────────────",
    `View order: era99.co/admin/orders/${payload.id}`,
  ].join("\n");
}

export async function sendWhatsAppMessage(
  message: string,
  credentials?: WhatsAppCredentials,
) {
  const accountSid = credentials?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = credentials?.authToken || process.env.TWILIO_AUTH_TOKEN;
  const from = credentials?.from || process.env.TWILIO_WHATSAPP_FROM;
  const to = credentials?.to || process.env.ADMIN_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    console.log("[WHATSAPP_FALLBACK]", message);
    return;
  }

  const encoded = new URLSearchParams({
    From: from,
    To: to,
    Body: message,
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encoded,
    },
  );
}

export async function sendAdminWhatsApp(
  payload: WhatsAppOrderPayload,
  credentials?: WhatsAppCredentials,
) {
  const body = buildMessage(payload);

  await sendWhatsAppMessage(body, credentials);
}
