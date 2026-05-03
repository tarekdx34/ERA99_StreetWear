import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { verifySignedOrderToken } from "@/lib/order-tokens";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { message: "Server configuration error: DATABASE_URL is missing" },
      { status: 500 },
    );
  }

  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  const userId = await getShopperSessionUserId();
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const ownsOrder = Boolean(userId && order.userId === userId);
  const hasGuestToken = verifySignedOrderToken({
    token,
    purpose: "view",
    orderId: order.id,
    createdAt: order.createdAt,
  });

  if (!ownsOrder && !hasGuestToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    building: order.building,
    notes: order.notes,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}
