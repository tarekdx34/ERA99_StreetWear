export const ORDER_STATUSES = [
  "pending_confirmation",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "payment_failed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isCodPaymentMethod(paymentMethod?: string | null) {
  return String(paymentMethod || "").trim().toUpperCase() === "COD";
}

export function getAllowedOrderStatuses(paymentMethod?: string | null) {
  if (isCodPaymentMethod(paymentMethod)) {
    return [
      "pending_confirmation",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ] as const;
  }

  return ORDER_STATUSES;
}

export function isAllowedOrderStatus(
  orderStatus: string,
  paymentMethod?: string | null,
) {
  return (getAllowedOrderStatuses(paymentMethod) as readonly string[]).includes(
    orderStatus,
  );
}

export function paymentStatusForOrderStatus(
  orderStatus: OrderStatus,
  paymentMethod?: string | null,
) {
  if (isCodPaymentMethod(paymentMethod)) {
    return orderStatus === "delivered" ? "paid" : "pending";
  }

  if (orderStatus === "payment_failed") return "failed";
  if (orderStatus === "paid" || orderStatus === "delivered") return "paid";
  return "pending";
}

export function releasesInventory(orderStatus: string) {
  return orderStatus === "cancelled" || orderStatus === "payment_failed";
}

export function countsAsRevenue(order: {
  orderStatus: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}) {
  if (isCodPaymentMethod(order.paymentMethod)) {
    return order.orderStatus === "delivered" && order.paymentStatus === "paid";
  }

  return order.paymentStatus === "paid" || order.orderStatus === "paid";
}

export function countsAsPendingPayment(order: {
  orderStatus: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}) {
  if (isCodPaymentMethod(order.paymentMethod)) {
    return ["preparing", "shipped"].includes(order.orderStatus);
  }

  return order.paymentStatus === "pending" || order.orderStatus === "pending_payment";
}
