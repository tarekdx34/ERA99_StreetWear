import { NextRequest, NextResponse } from "next/server";
import { clearCart, getHydratedCart } from "@/lib/cart-service";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

export async function GET() {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const items = await getHydratedCart(userId);
  return NextResponse.json({ items });
}

export async function DELETE(request: NextRequest) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const items = await clearCart(userId);
  return NextResponse.json({ items });
}
