import type { Product } from "@/lib/products";
import { products, sizes } from "@/lib/products";
import { isDatabaseConfigured, markDatabaseUnavailable, prisma } from "@/lib/prisma";

const CATALOG_PRODUCTS_KEY = "catalog_products_v3";
const CATALOG_COLLECTIONS_KEY = "catalog_collections_v1";
type CatalogDbClient = Pick<typeof prisma, "setting">;

export type CatalogSize = (typeof sizes)[number];
export type FitType = "Boxy" | "Oversized" | "Regular";

export type VariantSize = {
  active: boolean;
  stock: number;
  sku: string;
};

export type ColorVariant = {
  id: string;
  colorName: string;
  colorHex: string;
  images: string[];
  sizes: Record<CatalogSize, VariantSize>;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  collection: string;
  shortDescription: string;
  fullDescription: string;
  fabricComposition: string;
  fitType: FitType;
  careInstructions: string;
  weightGsm: number;
  active: boolean;
  featured: boolean;
  newArrival: boolean;
  metaTitle: string;
  metaDescription: string;
  mainImageAlt: string;
  colorVariants: ColorVariant[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCatalogCardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  totalStock: number;
  active: boolean;
  featured: boolean;
  newArrival: boolean;
};

const DEFAULT_COLLECTIONS = ["Drop 001", "Drop 002"];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function buildDefaultSizes(productId: string) {
  const sizeMap = {} as Record<CatalogSize, VariantSize>;
  for (const size of sizes) {
    sizeMap[size] = {
      active: true,
      stock: 0,
      sku: `${productId}-${size}`.toUpperCase(),
    };
  }
  return sizeMap;
}

function seedFromStaticProducts(): CatalogProduct[] {
  const now = new Date().toISOString();
  return products.map((item, index) => {
    const id = item.id;
    const sizeMap = buildDefaultSizes(id);
    for (const size of sizes) {
      sizeMap[size].active = Boolean(item.stockBySize[size]);
      sizeMap[size].stock = item.stockBySize[size] ? 20 : 0;
    }

    return {
      id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      compareAtPrice: null,
      collection: DEFAULT_COLLECTIONS[index < 3 ? 0 : 1],
      shortDescription: item.shortDescription || `${item.name} ${item.color}`,
      fullDescription: `<p>${item.description.fabric}</p><p>${item.description.fit}</p><p>${item.description.care}</p>`,
      fabricComposition: item.description.fabric,
      fitType: "Boxy",
      careInstructions: item.description.care,
      weightGsm: 220,
      active: true,
      featured: index < 4,
      newArrival: index < 2,
      metaTitle: `${item.name} ${item.color} | QUTB`,
      metaDescription: item.description.fit,
      mainImageAlt: `${item.name} ${item.color}`,
      colorVariants: [
        {
          id: `${id}-v1`,
          colorName: item.color,
          colorHex: "#EDE9E0",
          images: item.images,
          sizes: sizeMap,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
  });
}

async function getCatalogProductsRaw(db: CatalogDbClient = prisma): Promise<CatalogProduct[]> {
  if (!isDatabaseConfigured()) return seedFromStaticProducts();

  let setting: { value: string } | null = null;
  try {
    setting = await db.setting.findUnique({
      where: { key: CATALOG_PRODUCTS_KEY },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn("Catalog DB unavailable, using static products.");
    return seedFromStaticProducts();
  }

  if (!setting?.value) {
    const seeded = seedFromStaticProducts();
    try {
      await db.setting.upsert({
        where: { key: CATALOG_PRODUCTS_KEY },
        create: { key: CATALOG_PRODUCTS_KEY, value: JSON.stringify(seeded) },
        update: { value: JSON.stringify(seeded) },
      });
    } catch (error) {
      markDatabaseUnavailable(error);
      console.warn("Catalog DB unavailable, skipping product seed init.");
    }
    return seeded;
  }

  const parsed = safeJsonParse<CatalogProduct[]>(setting.value, []);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return seedFromStaticProducts();
}

async function saveCatalogProductsRaw(
  items: CatalogProduct[],
  db: CatalogDbClient = prisma,
) {
  if (!isDatabaseConfigured()) return;
  try {
    await db.setting.upsert({
      where: { key: CATALOG_PRODUCTS_KEY },
      create: { key: CATALOG_PRODUCTS_KEY, value: JSON.stringify(items) },
      update: { value: JSON.stringify(items) },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn("Catalog DB unavailable, skipping product save.");
  }
}

export function calculateTotalStock(product: CatalogProduct) {
  return product.colorVariants.reduce((sum, variant) => {
    return (
      sum +
      sizes.reduce((sizeSum, size) => {
        const item = variant.sizes[size];
        if (!item?.active) return sizeSum;
        return sizeSum + Math.max(0, Number(item.stock || 0));
      }, 0)
    );
  }, 0);
}

function toStorefrontProduct(item: CatalogProduct): Product {
  const primaryVariant = item.colorVariants[0];
  const stockBySize: Record<string, boolean> = {};
  for (const size of sizes) {
    const sizeValue = primaryVariant?.sizes?.[size];
    stockBySize[size] = Boolean(sizeValue?.active && sizeValue.stock > 0);
  }

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    color: primaryVariant?.colorName || "Core",
    price: item.price,
    compareAtPrice: item.compareAtPrice || undefined,
    shortDescription: item.shortDescription,
    weightGsm: item.weightGsm || 220,
    qVariant:
      item.fitType === "Regular"
        ? "Q-02 Moving Q"
        : "Q-01 Industrial Block",
    fabricStory:
      "100% COTTON cotton holds the shape. Garment dye and enzyme wash give the surface its lived weight. Science you can feel.",
    images: primaryVariant?.images?.length
      ? primaryVariant.images
      : ["/images/1.jpeg"],
    description: {
      fabric: item.fabricComposition,
      fit: item.fitType,
      care: item.careInstructions,
    },
    stockBySize,
  };
}

export async function getCatalogCollections(): Promise<string[]> {
  if (!isDatabaseConfigured()) return DEFAULT_COLLECTIONS;

  let setting: { value: string } | null = null;
  try {
    setting = await prisma.setting.findUnique({
      where: { key: CATALOG_COLLECTIONS_KEY },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn("Catalog DB unavailable, using default collections.");
    return DEFAULT_COLLECTIONS;
  }

  const stored = safeJsonParse<string[]>(setting?.value, []);
  const merged = Array.from(
    new Set([...DEFAULT_COLLECTIONS, ...stored]),
  ).filter(Boolean);

  if (!setting?.value) {
    try {
      await prisma.setting.upsert({
        where: { key: CATALOG_COLLECTIONS_KEY },
        create: { key: CATALOG_COLLECTIONS_KEY, value: JSON.stringify(merged) },
        update: { value: JSON.stringify(merged) },
      });
    } catch (error) {
      markDatabaseUnavailable(error);
      console.warn("Catalog DB unavailable, skipping collections init.");
    }
  }

  return merged;
}

export async function addCatalogCollection(name: string): Promise<string[]> {
  const clean = name.trim();
  if (!clean) return getCatalogCollections();

  const current = await getCatalogCollections();
  if (current.includes(clean)) return current;

  const next = [...current, clean];
  if (isDatabaseConfigured()) {
    await prisma.setting.upsert({
      where: { key: CATALOG_COLLECTIONS_KEY },
      create: { key: CATALOG_COLLECTIONS_KEY, value: JSON.stringify(next) },
      update: { value: JSON.stringify(next) },
    });
  }
  return next;
}

export async function getAdminCatalogProducts(
  db: CatalogDbClient = prisma,
): Promise<CatalogProduct[]> {
  return getCatalogProductsRaw(db);
}

export async function getAdminCatalogCardProducts(): Promise<
  AdminCatalogCardProduct[]
> {
  const list = await getAdminCatalogProducts();
  return list.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    image: item.colorVariants[0]?.images?.[0] || "/images/1.jpeg",
    totalStock: calculateTotalStock(item),
    active: item.active,
    featured: item.featured,
    newArrival: item.newArrival,
  }));
}

export async function getAdminCatalogProductById(
  id: string,
): Promise<CatalogProduct | undefined> {
  const list = await getAdminCatalogProducts();
  return list.find((item) => item.id === id);
}

export async function getCatalogProducts(): Promise<Product[]> {
  const list = await getAdminCatalogProducts();
  return list.filter((item) => item.active).map(toStorefrontProduct);
}

export async function getHomepageCatalogProducts(): Promise<Product[]> {
  const list = await getAdminCatalogProducts();
  const active = list.filter((item) => item.active);
  const featured = active.filter((item) => item.featured);
  const ordered = [
    ...featured,
    ...active.filter((item) => !item.featured),
  ].slice(0, 4);
  return ordered.map(toStorefrontProduct);
}

export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const list = await getAdminCatalogProducts();
  const found = list.find((item) => item.slug === slug && item.active);
  return found ? toStorefrontProduct(found) : undefined;
}

export async function createCatalogProduct(input: Partial<CatalogProduct>) {
  const list = await getAdminCatalogProducts();
  const now = new Date().toISOString();
  const id = input.id?.trim() || `p-${Date.now()}`;

  const product: CatalogProduct = {
    id,
    slug: input.slug?.trim() || slugify(input.name || "new-product"),
    name: input.name?.trim() || "New Product",
    price: Number(input.price || 0) || 450,
    compareAtPrice:
      typeof input.compareAtPrice === "number" && input.compareAtPrice > 0
        ? input.compareAtPrice
        : null,
    collection:
      input.collection?.trim() ||
      (await getCatalogCollections())[0] ||
      "Drop 001",
    shortDescription: (input.shortDescription || "").slice(0, 160),
    fullDescription: input.fullDescription || "<p></p>",
    fabricComposition: input.fabricComposition || "",
    fitType: input.fitType || "Boxy",
    careInstructions: input.careInstructions || "",
    weightGsm: Number(input.weightGsm || 220),
    active: input.active ?? true,
    featured: input.featured ?? false,
    newArrival: input.newArrival ?? false,
    metaTitle: input.metaTitle || "",
    metaDescription: input.metaDescription || "",
    mainImageAlt: input.mainImageAlt || "",
    colorVariants:
      input.colorVariants && input.colorVariants.length > 0
        ? input.colorVariants
        : [buildDefaultVariant(id, "Default", "#EDE9E0")],
    createdAt: now,
    updatedAt: now,
  };

  const next = [product, ...list];
  await saveCatalogProductsRaw(next);
  return product;
}

export async function updateCatalogProduct(
  id: string,
  patch: Partial<CatalogProduct>,
) {
  const list = await getAdminCatalogProducts();
  const idx = list.findIndex((item) => item.id === id);
  if (idx < 0) return null;

  const current = list[idx];
  const next: CatalogProduct = {
    ...current,
    ...patch,
    shortDescription:
      typeof patch.shortDescription === "string"
        ? patch.shortDescription.slice(0, 160)
        : current.shortDescription,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = next;
  await saveCatalogProductsRaw(list);
  return next;
}

export async function quickUpdateCatalogProduct(
  id: string,
  patch: {
    active?: boolean;
    featured?: boolean;
    newArrival?: boolean;
    totalStock?: number;
  },
) {
  const target = await getAdminCatalogProductById(id);
  if (!target) return null;

  if (typeof patch.active === "boolean") target.active = patch.active;
  if (typeof patch.featured === "boolean") target.featured = patch.featured;
  if (typeof patch.newArrival === "boolean")
    target.newArrival = patch.newArrival;

  if (
    typeof patch.totalStock === "number" &&
    Number.isFinite(patch.totalStock)
  ) {
    const variant = target.colorVariants[0];
    if (variant) {
      let remaining = Math.max(0, Math.floor(patch.totalStock));
      for (const size of sizes) {
        if (!variant.sizes[size].active) continue;
        const next = Math.min(remaining, 999);
        variant.sizes[size].stock = next;
        remaining = Math.max(0, remaining - next);
      }
    }
  }

  return updateCatalogProduct(id, target);
}

export async function getProductQuickStats(productId: string) {
  if (!isDatabaseConfigured()) {
    return {
      totalUnitsSold: 0,
      revenueGenerated: 0,
      mostOrderedSize: "-",
      averageRating: "N/A",
    };
  }

  const orders = await prisma.order.findMany({
    where: {
      orderStatus: { in: ["paid", "delivered", "shipped", "preparing"] },
    },
    select: { items: true },
  });

  let totalUnitsSold = 0;
  let revenueGenerated = 0;
  const sizeCount: Record<string, number> = {};

  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items as Array<any>) {
      if (item?.productId !== productId) continue;
      const qty = Number(item.qty || 0);
      const lineValue = Number(item.unitPrice || 0) * qty;
      totalUnitsSold += qty;
      revenueGenerated += lineValue;
      const size = String(item.size || "-");
      sizeCount[size] = (sizeCount[size] || 0) + qty;
    }
  }

  const mostOrderedSize =
    Object.entries(sizeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return {
    totalUnitsSold,
    revenueGenerated,
    mostOrderedSize,
    averageRating: "N/A",
  };
}

export function makeSlugFromName(name: string) {
  return slugify(name);
}

export function buildDefaultVariant(
  productId: string,
  colorName = "Default",
  colorHex = "#EDE9E0",
): ColorVariant {
  return {
    id: `${productId}-v-${Date.now()}`,
    colorName,
    colorHex,
    images: [],
    sizes: buildDefaultSizes(productId),
  };
}

export async function getCatalogProductByIdRaw(
  id: string,
): Promise<CatalogProduct | undefined> {
  const list = await getAdminCatalogProducts();
  return list.find((item) => item.id === id);
}

export type InventoryOrderItem = {
  productId: string;
  size: string;
  qty: number;
  color?: string | null;
};

type InventoryAction = "reserve" | "release";

function pickVariantForInventory(
  product: CatalogProduct,
  size: string,
  color?: string | null,
) {
  const normalizedSize = size.trim().toUpperCase();
  const targetColor = color?.trim().toLowerCase();
  if (targetColor) {
    const byColor = product.colorVariants.find((variant) => {
      if (variant.colorName.trim().toLowerCase() !== targetColor) return false;
      return Boolean(variant.sizes[normalizedSize]?.active);
    });
    if (byColor) return byColor;
  }

  return (
    product.colorVariants.find((variant) =>
      Boolean(variant.sizes[normalizedSize]?.active),
    ) || null
  );
}

async function mutateInventoryForOrder(
  action: InventoryAction,
  orderItems: InventoryOrderItem[],
  db: CatalogDbClient = prisma,
) {
  if (orderItems.length === 0) return;

  const products = await getAdminCatalogProducts(db);
  const nextProducts = products.map((product) => ({
    ...product,
    colorVariants: product.colorVariants.map((variant) => ({
      ...variant,
      sizes: { ...variant.sizes },
    })),
  }));

  for (const item of orderItems) {
    const product = nextProducts.find(
      (entry) => entry.id === item.productId && entry.active,
    );
    if (!product) {
      throw new Error(`Product unavailable: ${item.productId}`);
    }

    const variant = pickVariantForInventory(product, item.size, item.color);
    if (!variant) {
      throw new Error(`Variant unavailable: ${item.productId} ${item.size}`);
    }

    const sizeKey = item.size.trim().toUpperCase() as CatalogSize;
    const slot = variant.sizes[sizeKey];
    const qty = Math.max(0, Math.floor(item.qty || 0));
    if (!slot?.active || qty <= 0) {
      throw new Error(`Invalid stock mutation for ${item.productId} ${item.size}`);
    }

    if (action === "reserve") {
      if (slot.stock < qty) {
        throw new Error(`Out of stock for ${item.productId} ${item.size}`);
      }
      slot.stock -= qty;
      continue;
    }

    slot.stock += qty;
  }

  await saveCatalogProductsRaw(nextProducts, db);
}

export function toInventoryOrderItems(orderItems: unknown): InventoryOrderItem[] {
  if (!Array.isArray(orderItems)) return [];
  return orderItems
    .map((rawItem) => {
      const item =
        rawItem && typeof rawItem === "object"
          ? (rawItem as Record<string, unknown>)
          : {};
      return {
        productId: String(item.productId || "").trim(),
        size: String(item.size || "").trim(),
        qty: Math.max(0, Math.floor(Number(item.qty || 0))),
        color: typeof item.color === "string" ? String(item.color).trim() : undefined,
      };
    })
    .filter(
      (item) => item.productId.length > 0 && item.size.length > 0 && item.qty > 0,
    );
}

export async function reserveInventoryForOrder(
  orderItems: InventoryOrderItem[],
  db?: CatalogDbClient,
) {
  await mutateInventoryForOrder("reserve", orderItems, db);
}

export async function releaseInventoryForOrder(
  orderItems: InventoryOrderItem[],
  db?: CatalogDbClient,
) {
  await mutateInventoryForOrder("release", orderItems, db);
}
