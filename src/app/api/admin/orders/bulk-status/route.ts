import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bulkSchema.parse(body);
    const nextPaymentStatus =
      parsed.orderStatus === "delivered" ? "paid" : undefined;

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
