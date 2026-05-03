import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { verifySignedOrderToken } from "@/lib/order-tokens";
import { requireCsrf } from "@/lib/csrf-middleware";
import { enforceRateLimit } from "@/lib/rate-limit";

const claimSchema = z.object({
  orderId: z.number().int().positive(),
  token: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const csrfError = await requireCsrf(req);
  if (csrfError) return csrfError;

  const rateLimitError = enforceRateLimit(req, {
    keyPrefix: "claim-order",
    limit: 6,
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

    const userId = await getShopperSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    const json = await req.json();
    const parsed = claimSchema.parse(json);

    const order = await prisma.order.findUnique({
      where: { id: parsed.orderId },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 },
      );
    }

    const validToken = verifySignedOrderToken({
      token: parsed.token,
      purpose: "view",
      orderId: order.id,
      createdAt: order.createdAt,
    });

    if (!validToken) {
      return NextResponse.json(
        { message: "Claim token is invalid or expired." },
        { status: 403 },
      );
    }

    if (order.userId && order.userId !== userId) {
      return NextResponse.json(
        { message: "This order belongs to another account." },
        { status: 403 },
      );
    }

    if (order.userId === userId) {
      return NextResponse.json(
        { message: "This order is already linked to your account.", order },
        { status: 200 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: parsed.orderId },
      data: { userId },
    });

    return NextResponse.json({
      message: "Order linked to your account.",
      order: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    console.error("[CLAIM_ORDER_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to claim order" },
      { status: 500 },
    );
  }
}
