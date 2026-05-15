import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

const trackSchema = z.object({
  orderNumber: z.string().min(1),
  phone: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const rateLimitError = await enforceRateLimit(req, {
    keyPrefix: "orders-track",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    const json = await req.json();
    const parsed = trackSchema.parse(json);

    const order = await prisma.order.findUnique({
      where: { orderNumber: parsed.orderNumber },
    });

    if (!order || order.phone !== parsed.phone) {
      return NextResponse.json(
        { message: "Order not found. Check your order number and phone number." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        customerName: order.customerName,
        phone: order.phone,
        governorate: order.governorate,
        city: order.city,
        address: order.address,
        building: order.building,
        items: order.items,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    console.error("[ORDER_TRACK_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to track order" },
      { status: 500 },
    );
  }
}
