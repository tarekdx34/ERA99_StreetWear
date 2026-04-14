import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addCartItem } from "@/lib/cart-service";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const schema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(50),
});

export async function POST(request: NextRequest) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const items = await addCartItem(userId, payload);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return NextResponse.json(
        { message: "Item is out of stock." },
        { status: 409 },
      );
    }

    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}
