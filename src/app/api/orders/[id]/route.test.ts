import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignedOrderToken } from "@/lib/order-tokens";
import { GET } from "./route";

const { prismaMock, getShopperSessionUserId } = vi.hoisted(() => ({
  prismaMock: {
    order: {
      findUnique: vi.fn(),
    },
  },
  getShopperSessionUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  isDatabaseConfigured: () => true,
  prisma: prismaMock,
}));

vi.mock("@/lib/shopper-auth", () => ({
  getShopperSessionUserId,
}));

describe("GET /api/orders/[id]", () => {
  beforeEach(() => {
    prismaMock.order.findUnique.mockReset();
    getShopperSessionUserId.mockReset();
  });

  it("returns 401 when user does not own order and token is missing", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: 14,
      userId: "owner-user",
      orderNumber: "QTB00014",
      customerName: "Tarek",
      phone: "01012345678",
      governorate: "Alexandria",
      city: "Alexandria",
      address: "Street 1",
      building: null,
      notes: null,
      items: [],
      subtotal: 900,
      deliveryFee: 0,
      total: 900,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "pending_confirmation",
      createdAt: new Date("2026-04-26T10:00:00.000Z"),
      updatedAt: new Date("2026-04-26T10:05:00.000Z"),
    });
    getShopperSessionUserId.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/orders/14"), {
      params: Promise.resolve({ id: "14" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns order when valid signed guest token is provided", async () => {
    const createdAt = new Date("2026-04-26T10:00:00.000Z");
    prismaMock.order.findUnique.mockResolvedValue({
      id: 15,
      userId: null,
      orderNumber: "QTB00015",
      customerName: "Guest",
      phone: "01012345678",
      governorate: "Alexandria",
      city: "Alexandria",
      address: "Street 2",
      building: null,
      notes: null,
      items: [{ productId: "p1", qty: 1 }],
      subtotal: 450,
      deliveryFee: 0,
      total: 450,
      paymentMethod: "ONLINE",
      paymentStatus: "paid",
      orderStatus: "paid",
      createdAt,
      updatedAt: createdAt,
    });
    getShopperSessionUserId.mockResolvedValue(null);

    process.env.NEXTAUTH_SECRET = "test-secret";
    const token = createSignedOrderToken({
      purpose: "view",
      orderId: 15,
      createdAt,
      ttlSeconds: 120,
    });

    const response = await GET(
      new Request(`http://localhost/api/orders/15?token=${token}`),
      {
        params: Promise.resolve({ id: "15" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.orderNumber).toBe("QTB00015");
    expect(payload.total).toBe(450);
  });
});
