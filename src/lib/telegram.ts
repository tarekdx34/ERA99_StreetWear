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
        `• ${item.name} — ${item.size} — x${item.qty} — ${(item.unitPrice * item.qty).toLocaleString()} EGP`,
    )
    .join("\n");

  const adminBaseUrl = (
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://qutb.co"
  ).replace(/\/$/, "");

  return [
    `🖤 NEW QUTB ORDER #${payload.orderNumber}`,
    "───────────────",
    payload.customerName,
    payload.phone,
    `${payload.address}${payload.building ? `, ${payload.building}` : ""}, ${payload.city}, ${payload.governorate}`,
    "───────────────",
    "ITEMS:",
    itemLines,
    "───────────────",
    `SUBTOTAL: ${payload.subtotal.toLocaleString()} EGP`,
    `DELIVERY: ${payload.deliveryFee === 0 ? "FREE" : `${payload.deliveryFee.toLocaleString()} EGP`}`,
    `TOTAL: ${payload.total.toLocaleString()} EGP`,
    "PAYMENT: Cash on Delivery",
    `NOTES: ${payload.notes?.trim() || "None"}`,
    "───────────────",
    `View: ${adminBaseUrl}/admin/orders/${payload.id}`,
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
