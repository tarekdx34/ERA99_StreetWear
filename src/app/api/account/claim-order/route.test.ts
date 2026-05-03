import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedOrderToken } from "@/lib/order-tokens";
import { POST } from "./route";

const { prismaMock, getShopperSessionUserId, requireCsrf } = vi.hoisted(() => ({
  prismaMock: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  getShopperSessionUserId: vi.fn(),
  requireCsrf: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  isDatabaseConfigured: () => true,
  prisma: prismaMock,
}));

vi.mock("@/lib/shopper-auth", () => ({
  getShopperSessionUserId,
}));

vi.mock("@/lib/csrf-middleware", () => ({
  requireCsrf,
}));

describe("POST /api/account/claim-order", () => {
  beforeEach(() => {
    prismaMock.order.findUnique.mockReset();
    prismaMock.order.update.mockReset();
    getShopperSessionUserId.mockReset();
    requireCsrf.mockReset();
    requireCsrf.mockResolvedValue(null);
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  it("rejects tokenless claims", async () => {
    const createdAt = new Date("2026-04-26T10:00:00.000Z");
    prismaMock.order.findUnique.mockResolvedValue({
      id: 30,
      userId: null,
      phone: "01012345678",
      createdAt,
    });
    getShopperSessionUserId.mockResolvedValue("shopper-1");

    const response = await POST(
      new Request("http://localhost/api/account/claim-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderId: 30,
          token: "",
        }),
      }) as any,
    );

    expect(response.status).toBe(400);
  });

  it("links order when claim token is valid", async () => {
    const createdAt = new Date("2026-04-26T10:00:00.000Z");
    prismaMock.order.findUnique.mockResolvedValue({
      id: 31,
      userId: null,
      phone: "01012345678",
      createdAt,
    });
    prismaMock.order.update.mockResolvedValue({
      id: 31,
      userId: "shopper-1",
    });
    getShopperSessionUserId.mockResolvedValue("shopper-1");

    const token = createSignedOrderToken({
      purpose: "view",
      orderId: 31,
      createdAt,
      ttlSeconds: 120,
    });

    const response = await POST(
      new Request("http://localhost/api/account/claim-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderId: 31,
          token,
        }),
      }) as any,
    );

    expect(response.status).toBe(200);
    expect(prismaMock.order.update).toHaveBeenCalledTimes(1);
  });
});
