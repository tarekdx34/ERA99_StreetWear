import { prisma } from "@/lib/prisma";
import { getCatalogProductByIdRaw } from "@/lib/catalog";

type GuestCartItemInput = {
  productId: string;
  variantId: string;
  qty: number;
  name?: string;
  color?: string;
  price?: number;
  image?: string;
};

export type CartResponseItem = {
  id: string;
  productId: string;
  variantId: string;
  qty: number;
  name: string;
  color: string;
  price: number;
  image: string;
};

const MAX_QTY_PER_ITEM = 10;

function normalizeQty(value: number) {
  return Math.max(1, Math.min(MAX_QTY_PER_ITEM, Math.floor(value || 1)));
}

async function getVariantStock(productId: string, variantId: string) {
  const product = await getCatalogProductByIdRaw(productId);
  if (!product || !product.active) {
    return {
      inStock: false,
      maxQty: 0,
      name: "Unavailable product",
      color: "",
      price: 0,
      image: "/images/1.jpeg",
    };
  }

  const primaryVariant = product.colorVariants[0];
  const size = primaryVariant?.sizes?.[variantId as any];
  const stock = size?.active ? Number(size.stock || 0) : 0;

  return {
    inStock: stock > 0,
    maxQty: Math.max(0, Math.min(stock, MAX_QTY_PER_ITEM)),
    name: product.name,
    color: primaryVariant?.colorName || "Core",
    price: product.price,
    image: primaryVariant?.images?.[0] || "/images/1.jpeg",
  };
}

async function ensureCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true, userId: true },
  });
  return cart;
}

export async function getHydratedCart(userId: string): Promise<CartResponseItem[]> {
  const cart = await ensureCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { addedAt: "desc" },
  });

  const hydrated = await Promise.all(
    items.map(async (item) => {
      const meta = await getVariantStock(item.productId, item.variantId);
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        qty: item.quantity,
        name: meta.name,
        color: meta.color,
        price: meta.price,
        image: meta.image,
      };
    }),
  );

  return hydrated;
}

export async function addCartItem(userId: string, input: GuestCartItemInput) {
  const cart = await ensureCart(userId);
  const stock = await getVariantStock(input.productId, input.variantId);
  if (!stock.inStock) {
    throw new Error("OUT_OF_STOCK");
  }

  const desiredQty = normalizeQty(input.qty);
  const boundedQty = Math.min(desiredQty, stock.maxQty || desiredQty);
  if (boundedQty <= 0) throw new Error("OUT_OF_STOCK");

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId,
    },
  });

  if (existing) {
    const nextQty = Math.min(existing.quantity + boundedQty, stock.maxQty || MAX_QTY_PER_ITEM);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId,
        quantity: boundedQty,
      },
    });
  }

  return getHydratedCart(userId);
}

export async function updateCartItemQty(userId: string, itemId: string, qty: number) {
  const cart = await ensureCart(userId);
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) return getHydratedCart(userId);

  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return getHydratedCart(userId);
  }

  const stock = await getVariantStock(item.productId, item.variantId);
  const bounded = Math.min(normalizeQty(qty), stock.maxQty || MAX_QTY_PER_ITEM);
  if (bounded <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: bounded } });
  }

  return getHydratedCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await ensureCart(userId);
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return getHydratedCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await ensureCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return [] as CartResponseItem[];
}

export async function mergeGuestCart(userId: string, guestItems: GuestCartItemInput[]) {
  const cart = await ensureCart(userId);
  const serverItems = await prisma.cartItem.findMany({ where: { cartId: cart.id } });

  const guestMerged = new Map<string, GuestCartItemInput>();
  for (const raw of guestItems) {
    const key = `${raw.productId}::${raw.variantId}`;
    const current = guestMerged.get(key);
    const qty = normalizeQty(raw.qty);
    if (!current) {
      guestMerged.set(key, { ...raw, qty });
    } else {
      current.qty = Math.min(MAX_QTY_PER_ITEM, current.qty + qty);
      guestMerged.set(key, current);
    }
  }

  for (const [, guest] of guestMerged) {
    const stock = await getVariantStock(guest.productId, guest.variantId);
    if (!stock.inStock || stock.maxQty <= 0) continue;

    const existing = serverItems.find(
      (item) => item.productId === guest.productId && item.variantId === guest.variantId,
    );

    if (existing) {
      const mergedQty = Math.min(
        Math.max(existing.quantity, normalizeQty(guest.qty)),
        stock.maxQty,
      );
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: mergedQty },
      });
      continue;
    }

    const createQty = Math.min(normalizeQty(guest.qty), stock.maxQty);
    if (createQty <= 0) continue;

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: guest.productId,
        variantId: guest.variantId,
        quantity: createQty,
      },
    });
  }

  return getHydratedCart(userId);
}
