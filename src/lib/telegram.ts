type TelegramOrderPayload = {
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
  createdAt?: string;
};

type TelegramCredentials = {
  botToken?: string;
  chatId?: string;
};

function buildOrderMessage(payload: TelegramOrderPayload) {
  const itemLines = payload.items
    .map(
      (item) =>
        `• ${item.name} — ${item.color} — ${item.size} — x${item.qty} — ${(item.unitPrice * item.qty).toLocaleString()} EGP`,
    )
    .join("\n");

  const orderTime = payload.createdAt
    ? new Date(payload.createdAt).toLocaleString("en-GB", {
        timeZone: "Africa/Cairo",
      })
    : new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

  return [
    `🖤 <b>NEW QUTB ORDER #${payload.orderNumber}</b>`,
    `🕐 <b>Time:</b> ${orderTime}`,
    "───────────────",
    `👤 <b>Customer:</b> ${payload.customerName}`,
    `📞 <b>Phone:</b> ${payload.phone}`,
    `📍 <b>Address:</b> ${payload.address}${payload.building ? `, ${payload.building}` : ""}, ${payload.city}, ${payload.governorate}`,
    "───────────────",
    `📦 <b>ITEMS:</b>`,
    itemLines,
    "───────────────",
    `💰 <b>SUBTOTAL:</b> ${payload.subtotal.toLocaleString()} EGP`,
    `🚚 <b>DELIVERY:</b> ${payload.deliveryFee === 0 ? "FREE (Alexandria)" : `${payload.deliveryFee.toLocaleString()} EGP`}`,
    `💵 <b>TOTAL:</b> ${payload.total.toLocaleString()} EGP`,
    `💳 <b>PAYMENT:</b> ${payload.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}`,
    `📝 <b>NOTES:</b> ${payload.notes || "-"}`,
    "───────────────",
    `🔗 <b>View order:</b> qutb.co/admin/orders/${payload.id}`,
  ].join("\n");
}

export async function sendTelegramMessage(
  message: string,
  credentials?: TelegramCredentials,
) {
  const botToken = credentials?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = credentials?.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[TELEGRAM_FALLBACK]", message);
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("[TELEGRAM_ERROR]", error);
    throw new Error(`Failed to send Telegram message: ${error?.description || response.statusText}`);
  }

  return response.json();
}

export async function sendAdminTelegramNotification(
  payload: TelegramOrderPayload,
  credentials?: TelegramCredentials,
) {
  const message = buildOrderMessage(payload);
  await sendTelegramMessage(message, credentials);
}
