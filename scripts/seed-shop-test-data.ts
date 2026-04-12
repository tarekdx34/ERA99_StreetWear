import { PrismaClient } from "@prisma/client";
import type { CatalogProduct, CatalogSize, VariantSize } from "../src/lib/catalog";

const prisma = new PrismaClient();
const CATALOG_PRODUCTS_KEY = "catalog_products_v3";
const CATALOG_COLLECTIONS_KEY = "catalog_collections_v1";

const sizes: CatalogSize[] = ["S", "M", "L", "XL", "XXL"];

function makeSizeMap(productId: string, stockBySize: Partial<Record<CatalogSize, number>>) {
  const map = {} as Record<CatalogSize, VariantSize>;
  for (const size of sizes) {
    const stock = Math.max(0, Math.floor(stockBySize[size] || 0));
    map[size] = {
      active: stock > 0,
      stock,
      sku: `${productId}-${size}`.toUpperCase(),
    };
  }
  return map;
}

function makeProduct(input: {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  collection: string;
  shortDescription: string;
  fabric: string;
  colorName: string;
  colorHex: string;
  images: string[];
  newArrival?: boolean;
  featured?: boolean;
  createdAt: string;
  stockBySize: Partial<Record<CatalogSize, number>>;
}): CatalogProduct {
  const now = input.createdAt;
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    collection: input.collection,
    shortDescription: input.shortDescription,
    fullDescription: `<p>${input.fabric}</p>`,
    fabricComposition: input.fabric,
    fitType: "Boxy",
    careInstructions: "Cold wash, inside-out, no tumble dry.",
    weightGsm: 220,
    active: true,
    featured: Boolean(input.featured),
    newArrival: Boolean(input.newArrival),
    metaTitle: `${input.name} | 6 STREET`,
    metaDescription: input.shortDescription,
    mainImageAlt: input.name,
    colorVariants: [
      {
        id: `${input.id}-v1`,
        colorName: input.colorName,
        colorHex: input.colorHex,
        images: input.images,
        sizes: makeSizeMap(input.id, input.stockBySize),
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const seeded: CatalogProduct[] = [
    makeProduct({
      id: "shop-test-1",
      slug: "alex-heavyweight-boxy-white",
      name: "Alex Heavyweight Boxy Tee",
      price: 420,
      collection: "Drop 001",
      shortDescription: "Boxy heavyweight tee in optic white.",
      fabric: "220GSM heavyweight cotton jersey",
      colorName: "White",
      colorHex: "#F0EDE8",
      images: ["/images/1.jpeg", "/images/2.jpeg", "/images/3.jpeg"],
      newArrival: true,
      featured: true,
      createdAt: "2026-04-10T10:00:00.000Z",
      stockBySize: { S: 2, M: 3, L: 2, XL: 1, XXL: 0 },
    }),
    makeProduct({
      id: "shop-test-2",
      slug: "alex-heavyweight-boxy-black",
      name: "Alex Heavyweight Boxy Tee",
      price: 460,
      compareAtPrice: 520,
      collection: "Drop 001",
      shortDescription: "Boxy heavyweight tee in matte black.",
      fabric: "240GSM enzyme-washed cotton",
      colorName: "Black",
      colorHex: "#111111",
      images: ["/images/4.png", "/images/5.jpeg", "/images/6.jpeg"],
      newArrival: true,
      createdAt: "2026-04-11T11:00:00.000Z",
      stockBySize: { S: 0, M: 2, L: 2, XL: 1, XXL: 1 },
    }),
    makeProduct({
      id: "shop-test-3",
      slug: "nile-oversized-tee-sand",
      name: "Nile Oversized Tee",
      price: 390,
      collection: "Drop 002",
      shortDescription: "Relaxed oversized silhouette in sand.",
      fabric: "200GSM compact combed cotton",
      colorName: "Sand",
      colorHex: "#D7C5A1",
      images: ["/images/8.jpeg", "/images/9.jpeg", "/images/10.jpeg"],
      createdAt: "2026-04-09T09:00:00.000Z",
      stockBySize: { S: 1, M: 0, L: 0, XL: 0, XXL: 0 },
    }),
    makeProduct({
      id: "shop-test-4",
      slug: "delta-raw-cut-tee-olive",
      name: "Delta Raw Cut Tee",
      price: 510,
      collection: "Drop 002",
      shortDescription: "Raw hem boxy tee with structured drape.",
      fabric: "230GSM loopback cotton french terry",
      colorName: "Olive",
      colorHex: "#5A5F45",
      images: ["/images/11.jpeg", "/images/3.jpeg", "/images/1.jpeg"],
      createdAt: "2026-04-12T08:00:00.000Z",
      stockBySize: { S: 4, M: 4, L: 4, XL: 3, XXL: 2 },
    }),
    makeProduct({
      id: "shop-test-5",
      slug: "delta-raw-cut-tee-red",
      name: "Delta Raw Cut Tee",
      price: 530,
      compareAtPrice: 600,
      collection: "Drop 003",
      shortDescription: "Raw hem tee in blood red finish.",
      fabric: "260GSM heavyweight slub cotton",
      colorName: "Red",
      colorHex: "#8B0000",
      images: ["/images/2.jpeg", "/images/7.jpeg", "/images/6.jpeg"],
      createdAt: "2026-04-13T08:30:00.000Z",
      stockBySize: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    }),
    makeProduct({
      id: "shop-test-6",
      slug: "port-heavy-tee-navy",
      name: "Port Heavy Tee",
      price: 440,
      collection: "Drop 003",
      shortDescription: "Core heavy tee designed for daily wear.",
      fabric: "220GSM heavyweight cotton jersey",
      colorName: "Navy",
      colorHex: "#1F2A44",
      images: ["/images/5.jpeg", "/images/4.png", "/images/8.jpeg"],
      createdAt: "2026-04-08T08:30:00.000Z",
      stockBySize: { S: 2, M: 2, L: 1, XL: 0, XXL: 0 },
    }),
  ];

  await prisma.setting.upsert({
    where: { key: CATALOG_PRODUCTS_KEY },
    create: { key: CATALOG_PRODUCTS_KEY, value: JSON.stringify(seeded) },
    update: { value: JSON.stringify(seeded) },
  });

  await prisma.setting.upsert({
    where: { key: CATALOG_COLLECTIONS_KEY },
    create: { key: CATALOG_COLLECTIONS_KEY, value: JSON.stringify(["Drop 001", "Drop 002", "Drop 003"]) },
    update: { value: JSON.stringify(["Drop 001", "Drop 002", "Drop 003"]) },
  });

  await prisma.order.deleteMany({
    where: { orderNumber: { startsWith: "SHOPTEST-" } },
  });

  await prisma.order.createMany({
    data: [
      {
        orderNumber: "SHOPTEST-00001",
        customerName: "Test One",
        phone: "01000000001",
        governorate: "Alexandria",
        city: "Alexandria",
        address: "Street 1",
        items: [
          { productId: "shop-test-1", qty: 1, unitPrice: 420, size: "M" },
          { productId: "shop-test-4", qty: 3, unitPrice: 510, size: "L" },
        ],
        subtotal: 1950,
        deliveryFee: 0,
        total: 1950,
        paymentMethod: "cod",
        paymentStatus: "paid",
        orderStatus: "paid",
      },
      {
        orderNumber: "SHOPTEST-00002",
        customerName: "Test Two",
        phone: "01000000002",
        governorate: "Alexandria",
        city: "Alexandria",
        address: "Street 2",
        items: [
          { productId: "shop-test-4", qty: 2, unitPrice: 510, size: "XL" },
          { productId: "shop-test-6", qty: 1, unitPrice: 440, size: "M" },
        ],
        subtotal: 1460,
        deliveryFee: 0,
        total: 1460,
        paymentMethod: "cod",
        paymentStatus: "paid",
        orderStatus: "shipped",
      },
      {
        orderNumber: "SHOPTEST-00003",
        customerName: "Test Three",
        phone: "01000000003",
        governorate: "Alexandria",
        city: "Alexandria",
        address: "Street 3",
        items: [
          { productId: "shop-test-2", qty: 4, unitPrice: 460, size: "L" },
        ],
        subtotal: 1840,
        deliveryFee: 0,
        total: 1840,
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "cancelled",
      },
    ],
  });

  console.log("Seeded 6 shop test products and 3 test orders (2 count toward best-selling).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
