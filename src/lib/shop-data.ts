import { prisma } from "@/lib/prisma";
import { calculateTotalStock, getAdminCatalogProducts, type CatalogProduct } from "@/lib/catalog";

export const SHOP_PAGE_SIZE = 16;
const ORDERED_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const BEST_SELLING_STATUSES = ["paid", "delivered", "shipped", "preparing"];

export type ShopSort = "newest" | "best-selling" | "price-asc" | "price-desc" | "name";
export type ShopAvailability = "all" | "in-stock";

export type ShopQueryParams = {
  collection?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
  page?: string;
  availability?: string;
};

export type ShopVariantSize = {
  size: string;
  stock: number;
  active: boolean;
};

export type ShopProductVariant = {
  id: string;
  colorName: string;
  colorHex: string;
  images: string[];
  sizes: ShopVariantSize[];
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  collectionSlug: string;
  price: number;
  compareAtPrice: number | null;
  shortDescription: string;
  fabric: string;
  newArrival: boolean;
  createdAt: string;
  totalStock: number;
  lowStock: boolean;
  soldOut: boolean;
  images: string[];
  primaryImage: string;
  secondaryImage: string;
  variants: ShopProductVariant[];
};

export type ShopFacet = {
  label: string;
  slug: string;
};

export type ShopColorFacet = {
  label: string;
  slug: string;
  hex: string;
};

export type ShopDataResult = {
  products: ShopProduct[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  collections: ShopFacet[];
  colors: ShopColorFacet[];
  availableSizes: string[];
  minPriceBound: number;
  maxPriceBound: number;
  query: {
    collection: string;
    sizes: string[];
    colors: string[];
    minPrice: number;
    maxPrice: number;
    sort: ShopSort;
    search: string;
    page: number;
    availability: ShopAvailability;
  };
};

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseCsvValue(input?: string) {
  return (input || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePositiveNumber(raw: string | undefined, fallback: number) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function parsePage(raw: string | undefined) {
  const parsed = Number(raw || "1");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function parseSort(raw: string | undefined): ShopSort {
  if (raw === "price-asc") return "price-asc";
  if (raw === "price-desc") return "price-desc";
  if (raw === "name") return "name";
  if (raw === "best-selling") return "best-selling";
  return "newest";
}

function parseAvailability(raw: string | undefined): ShopAvailability {
  return raw === "in-stock" ? "in-stock" : "all";
}

function flattenImages(product: CatalogProduct) {
  const images = product.colorVariants.flatMap((variant) => variant.images || []);
  const unique = Array.from(new Set(images.filter(Boolean)));
  if (unique.length > 0) return unique;
  return ["/images/1.jpeg"];
}

function toShopProduct(product: CatalogProduct): ShopProduct {
  const images = flattenImages(product);
  const variants: ShopProductVariant[] = product.colorVariants.map((variant) => ({
    id: variant.id,
    colorName: variant.colorName,
    colorHex: variant.colorHex,
    images: variant.images,
    sizes: ORDERED_SIZES.map((size) => {
      const slot = variant.sizes[size];
      return {
        size,
        stock: slot?.stock || 0,
        active: Boolean(slot?.active),
      };
    }),
  }));

  const totalStock = calculateTotalStock(product);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    collection: product.collection,
    collectionSlug: slugifyValue(product.collection),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    shortDescription: product.shortDescription,
    fabric: product.fabricComposition,
    newArrival: Boolean(product.newArrival),
    createdAt: product.createdAt,
    totalStock,
    lowStock: totalStock > 0 && totalStock <= 5,
    soldOut: totalStock <= 0,
    images,
    primaryImage: images[0],
    secondaryImage: images[1] || images[0],
    variants,
  };
}

async function getBestSellingMap() {
  const orders = await prisma.order.findMany({
    where: { orderStatus: { in: BEST_SELLING_STATUSES } },
    select: { items: true },
  });

  const scores = new Map<string, number>();
  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items as Array<any>) {
      const productId = String(item?.productId || "").trim();
      if (!productId) continue;
      const qty = Number(item?.qty || 0);
      const normalizedQty = Number.isFinite(qty) ? Math.max(0, qty) : 0;
      scores.set(productId, (scores.get(productId) || 0) + normalizedQty);
    }
  }
  return scores;
}

function buildCollections(products: ShopProduct[]): ShopFacet[] {
  return Array.from(new Map(products.map((item) => [item.collectionSlug, item.collection])).entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildColors(products: ShopProduct[]): ShopColorFacet[] {
  const map = new Map<string, ShopColorFacet>();
  for (const product of products) {
    for (const variant of product.variants) {
      const slug = slugifyValue(variant.colorName);
      if (!slug) continue;
      if (!map.has(slug)) {
        map.set(slug, {
          label: variant.colorName,
          slug,
          hex: variant.colorHex || "#F0EDE8",
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function buildAvailableSizes(products: ShopProduct[]) {
  const stockBySize = new Map<string, number>();
  for (const size of ORDERED_SIZES) {
    stockBySize.set(size, 0);
  }

  for (const product of products) {
    for (const variant of product.variants) {
      for (const size of variant.sizes) {
        if (!size.active) continue;
        stockBySize.set(size.size, (stockBySize.get(size.size) || 0) + Math.max(0, size.stock));
      }
    }
  }

  return ORDERED_SIZES.filter((size) => (stockBySize.get(size) || 0) > 0);
}

function getPriceBounds(products: ShopProduct[]) {
  if (products.length === 0) {
    return { min: 0, max: 1000 };
  }
  const prices = products.map((item) => item.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

export async function getShopData(params: ShopQueryParams): Promise<ShopDataResult> {
  const sourceProducts = (await getAdminCatalogProducts())
    .filter((item) => item.active)
    .map(toShopProduct);

  const collections = buildCollections(sourceProducts);
  const colors = buildColors(sourceProducts);
  const availableSizes = buildAvailableSizes(sourceProducts);
  const bounds = getPriceBounds(sourceProducts);

  const queryCollection = (params.collection || "all").trim().toLowerCase();
  const querySizes = parseCsvValue(params.size).map((item) => item.toUpperCase());
  const queryColors = parseCsvValue(params.color).map((item) => item.toLowerCase());
  const queryMinPrice = parsePositiveNumber(params.minPrice, bounds.min);
  const queryMaxPrice = parsePositiveNumber(params.maxPrice, Math.max(bounds.max, queryMinPrice));
  const querySort = parseSort(params.sort);
  const querySearch = (params.search || "").trim();
  const queryAvailability = parseAvailability(params.availability);
  const requestedPage = parsePage(params.page);

  const normalizedCollection = queryCollection && queryCollection !== "all" ? queryCollection : "all";

  let filtered = sourceProducts.filter((product) => {
    if (normalizedCollection !== "all" && product.collectionSlug !== normalizedCollection) {
      return false;
    }

    if (querySearch) {
      const needle = querySearch.toLowerCase();
      const matches =
        product.name.toLowerCase().includes(needle) ||
        product.collection.toLowerCase().includes(needle) ||
        product.fabric.toLowerCase().includes(needle);
      if (!matches) return false;
    }

    if (product.price < queryMinPrice || product.price > queryMaxPrice) {
      return false;
    }

    if (queryAvailability === "in-stock" && product.totalStock <= 0) {
      return false;
    }

    if (queryColors.length > 0) {
      const colorSlugs = product.variants.map((variant) => slugifyValue(variant.colorName));
      const hasColor = queryColors.some((item) => colorSlugs.includes(item));
      if (!hasColor) return false;
    }

    if (querySizes.length > 0) {
      const hasSize = product.variants.some((variant) =>
        variant.sizes.some(
          (size) =>
            querySizes.includes(size.size.toUpperCase()) &&
            size.active &&
            (queryAvailability === "all" ? true : size.stock > 0),
        ),
      );
      if (!hasSize) return false;
    }

    return true;
  });

  if (querySort === "name") {
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (querySort === "price-asc") {
    filtered = filtered.sort((a, b) => a.price - b.price || b.createdAt.localeCompare(a.createdAt));
  } else if (querySort === "price-desc") {
    filtered = filtered.sort((a, b) => b.price - a.price || b.createdAt.localeCompare(a.createdAt));
  } else if (querySort === "best-selling") {
    const bestSellingMap = await getBestSellingMap();
    filtered = filtered.sort((a, b) => {
      const aScore = bestSellingMap.get(a.id) || 0;
      const bScore = bestSellingMap.get(b.id) || 0;
      if (aScore !== bScore) return bScore - aScore;
      return b.createdAt.localeCompare(a.createdAt);
    });
  } else {
    filtered = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * SHOP_PAGE_SIZE;
  const products = filtered.slice(skip, skip + SHOP_PAGE_SIZE);

  return {
    products,
    total,
    page,
    perPage: SHOP_PAGE_SIZE,
    totalPages,
    collections,
    colors,
    availableSizes,
    minPriceBound: bounds.min,
    maxPriceBound: Math.max(bounds.max, queryMaxPrice, bounds.min),
    query: {
      collection: normalizedCollection,
      sizes: querySizes,
      colors: queryColors,
      minPrice: queryMinPrice,
      maxPrice: queryMaxPrice,
      sort: querySort,
      search: querySearch,
      page,
      availability: queryAvailability,
    },
  };
}
