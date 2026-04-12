import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/checkout?error=server_config", req.url),
    );
  }

  const { searchParams } = new URL(req.url);
  const orderId = Number(searchParams.get("orderId"));
  const success = searchParams.get("success") === "true";

  if (!orderId || Number.isNaN(orderId)) {
    return NextResponse.redirect(
      new URL("/checkout?error=payment_failed", req.url),
    );
  }

  if (success) {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        orderStatus: "paid",
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        event: "order_completed",
        userId: updated.userId,
        orderId: updated.id,
        value: updated.total,
        page: `/order-confirmation/${updated.id}`,
        data: {
          paymentMethod: updated.paymentMethod,
          paymentStatus: updated.paymentStatus,
        },
      },
    });

    return NextResponse.redirect(
      new URL(`/order-confirmation/${orderId}?paid=1`, req.url),
    );
  }

  const failed = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "failed",
      orderStatus: "payment_failed",
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      event: "failed_payment",
      userId: failed.userId,
      orderId: failed.id,
      value: failed.total,
      page: "/checkout",
      data: {
        reason: "paymob_callback_failed",
      },
    },
  });

  return NextResponse.redirect(
    new URL("/checkout?error=payment_failed", req.url),
  );
}
