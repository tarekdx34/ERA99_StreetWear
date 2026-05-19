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

const statusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = statusSchema.parse(body);

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderStatus: true,
        items: true,
        paymentMethod: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!isAllowedOrderStatus(parsed.orderStatus, existing.paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid status for this payment method" },
        { status: 400 },
      );
    }

    const movingToReleasedState = releasesInventory(parsed.orderStatus);
    const wasAlreadyReleased = releasesInventory(existing.orderStatus);

    if (movingToReleasedState && !wasAlreadyReleased) {
      await releaseInventoryForOrder(toInventoryOrderItems(existing.items));
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: parsed.orderStatus,
        paymentStatus: paymentStatusForOrderStatus(
          parsed.orderStatus,
          existing.paymentMethod,
        ),
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid status payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 },
    );
  }
}
