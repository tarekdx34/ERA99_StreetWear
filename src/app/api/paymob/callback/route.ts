import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(new URL("/checkout?error=server_config", req.url));
  }

  const { searchParams } = new URL(req.url);
  const orderId = Number(searchParams.get("orderId"));
  const success = searchParams.get("success") === "true";

  if (!orderId || Number.isNaN(orderId)) {
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
  }

  if (success) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        orderStatus: "paid",
      },
    });
    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?paid=1`, req.url));
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "failed",
      orderStatus: "payment_failed",
    },
  });

  return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
}
