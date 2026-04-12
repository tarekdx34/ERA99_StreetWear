import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = statusSchema.parse(body);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: parsed.orderStatus },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid status payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}
