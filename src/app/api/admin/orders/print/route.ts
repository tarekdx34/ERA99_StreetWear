import { NextResponse } from "next/server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

import { requireAdminRole } from "@/lib/admin-security";

const bodySchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1).max(100),
});

export async function POST(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const orderIds = parsedBody.data.orderIds;
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      governorate: true,
      city: true,
      address: true,
      building: true,
      notes: true,
      items: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      createdAt: true,
    },
  });

  const byId = new Map(orders.map((order) => [order.id, order]));
  const ordered = orderIds.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json({ orders: ordered });
}
