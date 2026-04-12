import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import type { ColorVariant } from "@/lib/catalog";
import { getCatalogProductByIdRaw, updateCatalogProduct } from "@/lib/catalog";
import { sizes } from "@/lib/products";

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

const patchSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable(),
  collection: z.string().min(1),
  shortDescription: z.string().max(160),
  fullDescription: z.string(),
  fabricComposition: z.string(),
  fitType: z.enum(["Boxy", "Oversized", "Regular"]),
  careInstructions: z.string(),
  weightGsm: z.number().int().positive(),
  active: z.boolean(),
  featured: z.boolean(),
  newArrival: z.boolean(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  mainImageAlt: z.string(),
  colorVariants: z.array(colorVariantSchema).min(1),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, message: "Unauthorized" };

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const product = await getCatalogProductByIdRaw(id);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const payload = patchSchema.parse(await req.json());

    const normalizedVariants: ColorVariant[] = payload.colorVariants.map((variant) => {
      const normalizedSizes = Object.fromEntries(
        sizes.map((size) => [size, variant.sizes[size]]),
      ) as ColorVariant["sizes"];

      return {
        ...variant,
        sizes: normalizedSizes,
      };
    });

    const updated = await updateCatalogProduct(id, {
      ...payload,
      colorVariants: normalizedVariants,
    });
    if (!updated) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid product payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}
