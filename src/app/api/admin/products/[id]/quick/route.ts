import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { quickUpdateCatalogProduct } from "@/lib/catalog";

const quickSchema = z.object({
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  totalStock: z.number().int().nonnegative().optional(),
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
    const payload = quickSchema.parse(await req.json());
    const updated = await quickUpdateCatalogProduct(id, payload);
    if (!updated) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid quick update payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed quick update" }, { status: 500 });
  }
}
