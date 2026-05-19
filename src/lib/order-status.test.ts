import { describe, expect, it } from "vitest";
import {
  getAllowedOrderStatuses,
  isAllowedOrderStatus,
  paymentStatusForOrderStatus,
} from "@/lib/order-status";

describe("order-status helpers", () => {
  it("keeps payment failed out of the COD flow", () => {
    expect(getAllowedOrderStatuses("COD")).toEqual([
      "pending_confirmation",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ]);
    expect(isAllowedOrderStatus("payment_failed", "COD")).toBe(false);
  });

  it("marks delivered COD orders as paid revenue candidates", () => {
    expect(paymentStatusForOrderStatus("preparing", "COD")).toBe("pending");
    expect(paymentStatusForOrderStatus("shipped", "COD")).toBe("pending");
    expect(paymentStatusForOrderStatus("delivered", "COD")).toBe("paid");
  });
});
