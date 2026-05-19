import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-security";
import { releaseInventoryForOrder, toInventoryOrderItems } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUSES,
  isAllowedOrderStatus,
  paymentStatusForOrderStatus,
  releasesInventory,
} from "@/lib/order-status";

const bulkSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1).max(200),
  orderStatus: z.enum(ORDER_STATUSES),
});

export async function PATCH(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = bulkSchema.parse(body);

    const orders = await prisma.order.findMany({
      where: { id: { in: parsed.orderIds } },
      select: {
        id: true,
        orderStatus: true,
        paymentMethod: true,
        items: true,
      },
    });

    const invalidOrder = orders.find(
      (order) => !isAllowedOrderStatus(parsed.orderStatus, order.paymentMethod),
    );

    if (invalidOrder) {
      return NextResponse.json(
        {
          message: `Invalid status for ${invalidOrder.paymentMethod} order ${invalidOrder.id}`,
        },
        { status: 400 },
      );
    }

    const movingToReleasedState = releasesInventory(parsed.orderStatus);

    if (movingToReleasedState) {
      for (const order of orders) {
        if (releasesInventory(order.orderStatus)) continue;
        await releaseInventoryForOrder(toInventoryOrderItems(order.items));
      }
    }

    const updatedRows = await prisma.$transaction(
      orders.map((order) =>
        prisma.order.update({
          where: { id: order.id },
          data: {
            orderStatus: parsed.orderStatus,
            paymentStatus: paymentStatusForOrderStatus(
              parsed.orderStatus,
              order.paymentMethod,
            ),
          },
        }),
      ),
    );

    return NextResponse.json({
      updatedCount: updatedRows.length,
      orderStatus: parsed.orderStatus,
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
