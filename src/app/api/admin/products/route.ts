import { NextResponse } from "next/server";

import { z } from "zod";

import { requireAdminRole } from "@/lib/admin-security";
import { createCatalogProduct, getAdminCatalogProducts } from "@/lib/catalog";
import { sizes } from "@/lib/products";
import type { ColorVariant } from "@/lib/catalog";

const stockSchema = z.object(
  Object.fromEntries(
    sizes.map((size) => [
      size,
      z.object({
        active: z.boolean(),
        stock: z.number().int().nonnegative(),
        sku: z.string().min(1),
      }),
    ]),
  ) as Record<string, z.ZodTypeAny>,
);

const colorVariantSchema = z.object({
  id: z.string().min(1),
  colorName: z.string().min(1),
  colorHex: z.string().min(4),
  images: z.array(z.string().url()).max(8),
  sizes: stockSchema,
});

const createSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  collection: z.string().min(1),
  shortDescription: z.string().max(160).optional(),
  fullDescription: z.string().optional(),
  fabricComposition: z.string().optional(),
  fitType: z.enum(["Boxy", "Oversized", "Regular"]).optional(),
  careInstructions: z.string().optional(),
  weightGsm: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  mainImageAlt: z.string().optional(),
  colorVariants: z.array(colorVariantSchema).min(1).optional(),
});

export async function GET() {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const products = await getAdminCatalogProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  try {
    const payload = createSchema.parse(await req.json());
    const normalizedVariants: ColorVariant[] | undefined = payload.colorVariants
      ? payload.colorVariants.map((variant) => {
          const normalizedSizes = Object.fromEntries(
            sizes.map((size) => [size, variant.sizes[size]]),
          ) as ColorVariant["sizes"];

          return {
            ...variant,
            sizes: normalizedSizes,
          };
        })
      : undefined;

    const created = await createCatalogProduct({
      ...payload,
      colorVariants: normalizedVariants,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid create payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
