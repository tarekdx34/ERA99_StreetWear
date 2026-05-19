import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const cutoff = new Date(Date.now() - 15 * 60 * 1000);

  const updated = await prisma.order.updateMany({
    where: {
      paymentMethod: "COD",
      orderStatus: "pending_confirmation",
      createdAt: { lte: cutoff },
    },
    data: {
      orderStatus: "preparing",
      paymentStatus: "pending",
    },
  });

  return NextResponse.json({
    updatedCount: updated.count,
    cutoff: cutoff.toISOString(),
  });
}
