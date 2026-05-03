import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderValidationError, resolveOrderPricingAndItems } from "@/lib/order-checkout";

const { getAdminCatalogProducts } = vi.hoisted(() => ({
  getAdminCatalogProducts: vi.fn(),
}));

vi.mock("@/lib/catalog", () => ({
  getAdminCatalogProducts,
}));

describe("resolveOrderPricingAndItems", () => {
  beforeEach(() => {
    getAdminCatalogProducts.mockReset();
    getAdminCatalogProducts.mockResolvedValue([
      {
        id: "p1",
        slug: "qutb-boxy",
        name: "QUTB Boxy Tee",
        price: 450,
        active: true,
        colorVariants: [
          {
            colorName: "Black",
            images: ["/images/black.jpg"],
            sizes: {
              S: { active: true, stock: 5, sku: "p1-s" },
              M: { active: true, stock: 1, sku: "p1-m" },
            },
          },
        ],
      },
    ]);
  });

  it("recalculates totals server-side and ignores client unit price", async () => {
    const resolved = await resolveOrderPricingAndItems({
      governorate: "Alexandria",
      items: [
        {
          productId: "p1",
          size: "S",
          qty: 2,
          unitPrice: 1,
          color: "Black",
        },
      ],
    });

    expect(resolved.items[0]?.unitPrice).toBe(450);
    expect(resolved.subtotal).toBe(900);
    expect(resolved.deliveryFee).toBe(0);
    expect(resolved.total).toBe(900);
  });

  it("throws out-of-stock when requested quantity exceeds stock", async () => {
    await expect(
      resolveOrderPricingAndItems({
        governorate: "Cairo",
        items: [
          {
            productId: "p1",
            size: "M",
            qty: 2,
          },
        ],
      }),
    ).rejects.toMatchObject<OrderValidationError>({
      code: "OUT_OF_STOCK",
    });
  });
});
