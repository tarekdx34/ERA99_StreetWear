import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { removeCartItem, updateCartItemQty } from "@/lib/cart-service";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const updateSchema = z.object({
  qty: z.number().int().min(0).max(50),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payload = updateSchema.parse(await request.json());
    const items = await updateCartItemQty(userId, id, payload.qty);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const items = await removeCartItem(userId, id);
  return NextResponse.json({ items });
}
