import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { orderNumberFromId } from "@/lib/utils";
import { getShopperSessionUserId } from "@/lib/shopper-auth";

export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { message: "Server configuration error: DATABASE_URL is missing" },
        { status: 500 },
      );
    }

    const payload = await req.json();
    const userId = await getShopperSessionUserId();

    const created = await prisma.order.create({
      data: {
        userId,
        orderNumber: "TEMP",
        customerName: payload.customerName,
        phone: payload.phone,
        governorate: payload.governorate,
        city: payload.city,
        address: payload.address,
        building: payload.building || null,
        notes: payload.notes || null,
        items: payload.items,
        subtotal: payload.subtotal,
        deliveryFee: payload.deliveryFee,
        total: payload.total,
        paymentMethod: "ONLINE",
        paymentStatus: "pending",
        orderStatus: "pending_payment",
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        event: "checkout_start",
        userId,
        orderId: created.id,
        value: created.total,
        page: "/checkout",
        data: {
          paymentMethod: "ONLINE",
          itemCount: Array.isArray(payload.items) ? payload.items.length : 0,
        },
      },
    });

    const orderNumber = orderNumberFromId(created.id);
    await prisma.order.update({
      where: { id: created.id },
      data: { orderNumber },
    });

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/paymob/callback?orderId=${created.id}&success=true`;
    const failureUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/checkout?error=payment_failed`;

    const paymobHosted = process.env.PAYMOB_HOSTED_URL;
    if (paymobHosted) {
      return NextResponse.json({ redirectUrl: paymobHosted });
    }

    return NextResponse.json({
      redirectUrl: successUrl,
      fallbackFailure: failureUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Payment initialization failed" },
      { status: 400 },
    );
  }
}
