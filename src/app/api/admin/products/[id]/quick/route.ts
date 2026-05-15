import { NextResponse } from "next/server";

import { z } from "zod";

import { requireAdminRole } from "@/lib/admin-security";
import { quickUpdateCatalogProduct } from "@/lib/catalog";

const quickSchema = z.object({
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  totalStock: z.number().int().nonnegative().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  try {
    const { id } = await params;
    const payload = quickSchema.parse(await req.json());
    const updated = await quickUpdateCatalogProduct(id, payload);
    if (!updated) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid quick update payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed quick update" },
      { status: 500 },
    );
  }
}
