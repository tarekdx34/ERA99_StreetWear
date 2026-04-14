import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { getClientIp } from "@/lib/admin-security";
import { getAttributionCookieName } from "@/lib/attribution";

const schema = z.object({
  event: z.string().min(1),
  sessionId: z.string().optional(),
  productId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  orderId: z.number().int().optional(),
  page: z.string().optional(),
  value: z.number().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.parse(await request.json());
    const userId = await getShopperSessionUserId();
    const headers = request.headers instanceof Headers ? request.headers : new Headers(request.headers as HeadersInit);
    const ip = getClientIp(headers);

    // Extract attribution from cookie
    let attribution: Record<string, any> | null = null;
    const attributionCookie = request.cookies.get(getAttributionCookieName());
    if (attributionCookie?.value) {
      try {
        attribution = JSON.parse(decodeURIComponent(attributionCookie.value));
      } catch {
        // ignore
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        event: parsed.event,
        userId: userId || null,
        sessionId: parsed.sessionId || null,
        productId: null,
        productIds: parsed.productIds ?? [],
        orderId: parsed.orderId || null,
        page: parsed.page || null,
        value: typeof parsed.value === "number" ? parsed.value : null,
        data: parsed.data ?? Prisma.JsonNull,
        attribution: attribution ? (attribution as any) : Prisma.JsonNull,
        ip,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Invalid analytics payload." }, { status: 400 });
  }
}
