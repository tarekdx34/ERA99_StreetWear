import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addCartItem } from "@/lib/cart-service";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const schema = z.object({
  orderId: z.number().int().positive(),
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

    const order = await prisma.order.findFirst({
      where: { id: payload.orderId, userId },
      select: { items: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const items = Array.isArray(order.items) ? order.items : [];

    for (const raw of items as Array<any>) {
      if (!raw?.productId || !raw?.size) continue;
      try {
        await addCartItem(userId, {
          productId: String(raw.productId),
          variantId: String(raw.size),
          qty: Number(raw.qty || 1),
        });
      } catch {
        // Skip unavailable items during reorder.
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
