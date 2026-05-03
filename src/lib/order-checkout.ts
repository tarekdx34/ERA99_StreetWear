import { z } from "zod";
import { getAdminCatalogProducts } from "@/lib/catalog";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().optional().default(""),
  name: z.string().optional().default(""),
  color: z.string().optional().default(""),
  size: z.string().min(1),
  qty: z.number().int().positive().max(20),
  unitPrice: z.number().nonnegative().optional(),
  image: z.string().optional().default(""),
});

const alexandriaLabel = "alexandria";
const baseDeliveryFee = 75;

export class OrderValidationError extends Error {
  code:
    | "PRODUCT_NOT_FOUND"
    | "OUT_OF_STOCK"
    | "INVALID_ITEM"
    | "INVALID_DESTINATION";

  constructor(
    code:
      | "PRODUCT_NOT_FOUND"
      | "OUT_OF_STOCK"
      | "INVALID_ITEM"
      | "INVALID_DESTINATION",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

export type NormalizedOrderItem = {
  productId: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
};

function normalizeGovernorate(value: string) {
  return value.trim().toLowerCase();
}

function deliveryFeeForGovernorate(governorate: string) {
  return normalizeGovernorate(governorate) === alexandriaLabel
    ? 0
    : baseDeliveryFee;
}

function findVariantForItem(
  colorVariants: Array<{
    colorName: string;
    images: string[];
    sizes: Record<string, { active: boolean; stock: number }>;
  }>,
  color: string,
  size: string,
) {
  const targetColor = color.trim().toLowerCase();
  const exactColor = targetColor
    ? colorVariants.find((variant) => {
        if (variant.colorName.trim().toLowerCase() !== targetColor) return false;
        const sizeSlot = variant.sizes[size];
        return Boolean(sizeSlot?.active);
      })
    : null;

  if (exactColor) return exactColor;

  return (
    colorVariants.find((variant) => {
      const sizeSlot = variant.sizes[size];
      return Boolean(sizeSlot?.active);
    }) || null
  );
}

export async function resolveOrderPricingAndItems(input: {
  items: unknown;
  governorate: string;
}) {
  if (!input.governorate.trim()) {
    throw new OrderValidationError("INVALID_DESTINATION", "Governorate is required");
  }

  const parsedItems = z.array(orderItemSchema).min(1).safeParse(input.items);
  if (!parsedItems.success) {
    throw new OrderValidationError("INVALID_ITEM", "Invalid order items");
  }

  const catalog = await getAdminCatalogProducts();
  const normalized: NormalizedOrderItem[] = [];

  for (const item of parsedItems.data) {
    const product = catalog.find((entry) => entry.id === item.productId && entry.active);
    if (!product) {
      throw new OrderValidationError(
        "PRODUCT_NOT_FOUND",
        `Product not found: ${item.productId}`,
      );
    }

    const size = item.size.trim().toUpperCase();
    const variant = findVariantForItem(product.colorVariants, item.color, size);
    if (!variant) {
      throw new OrderValidationError(
        "OUT_OF_STOCK",
        `Size ${size} is unavailable for ${product.name}`,
      );
    }

    const sizeSlot = variant.sizes[size];
    const stock = Number(sizeSlot?.stock || 0);
    if (!sizeSlot?.active || stock < item.qty) {
      throw new OrderValidationError(
        "OUT_OF_STOCK",
        `Only ${Math.max(0, stock)} left for ${product.name} (${size})`,
      );
    }

    normalized.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: variant.colorName || item.color || "",
      size,
      qty: item.qty,
      unitPrice: product.price,
      image: variant.images[0] || "/images/1.jpeg",
    });
  }

  const subtotal = normalized.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0,
  );
  const deliveryFee = deliveryFeeForGovernorate(input.governorate);
  const total = subtotal + deliveryFee;

  return {
    items: normalized,
    subtotal,
    deliveryFee,
    total,
  };
}
