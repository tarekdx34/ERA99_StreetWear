import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: since },
      items: { some: {} },
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          orders: {
            where: { createdAt: { gte: since } },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  let created = 0;

  for (const cart of carts) {
    if (cart.user.orders.length > 0) continue;

    const existing = await prisma.analyticsEvent.findFirst({
      where: {
        event: "cart_abandonment",
        userId: cart.userId,
        createdAt: { gte: since },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.analyticsEvent.create({
      data: {
        event: "cart_abandonment",
        userId: cart.userId,
        value: null,
        page: "/checkout",
        data: {
          cartId: cart.id,
          itemCount: cart.items.length,
        },
      },
    });
    created += 1;
  }

  return NextResponse.json({ scanned: carts.length, created });
}
