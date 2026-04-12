import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";

export async function GET() {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
