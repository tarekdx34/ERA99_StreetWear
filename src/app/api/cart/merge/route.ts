import { NextResponse } from "next/server";
import { z } from "zod";
import { mergeGuestCart } from "@/lib/cart-service";
import { getShopperSessionUserId } from "@/lib/shopper-auth";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        qty: z.number().int().min(1).max(50),
        name: z.string().optional(),
        color: z.string().optional(),
        price: z.number().optional(),
        image: z.string().optional(),
      }),
    )
    .default([]),
});

export async function POST(request: Request) {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = schema.parse(await request.json());
    const items = await mergeGuestCart(userId, parsed.items);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}
