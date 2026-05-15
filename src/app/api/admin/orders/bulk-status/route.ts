import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-security";
import { releaseInventoryForOrder, toInventoryOrderItems } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1).max(200),
  orderStatus: z.enum([
    "pending_confirmation",
    "pending_payment",
    "paid",
    "preparing",
    "shipped",
    "delivered",
    "payment_failed",
    "cancelled",
  ]),
});

export async function PATCH(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = bulkSchema.parse(body);
    const nextPaymentStatus =
      parsed.orderStatus === "delivered" ? "paid" : undefined;
    const movingToReleasedState =
      parsed.orderStatus === "cancelled" || parsed.orderStatus === "payment_failed";

    if (movingToReleasedState) {
      const releasableOrders = await prisma.order.findMany({
        where: {
          id: { in: parsed.orderIds },
          orderStatus: { notIn: ["cancelled", "payment_failed"] },
        },
        select: {
          id: true,
          items: true,
        },
      });

      for (const order of releasableOrders) {
        await releaseInventoryForOrder(toInventoryOrderItems(order.items));
      }
    }

    const updated = await prisma.order.updateMany({
      where: { id: { in: parsed.orderIds } },
      data: {
        orderStatus: parsed.orderStatus,
        ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {}),
      },
    });

    return NextResponse.json({
      updatedCount: updated.count,
      orderStatus: parsed.orderStatus,
      ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid bulk payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to bulk update orders" },
      { status: 500 },
    );
  }
}
