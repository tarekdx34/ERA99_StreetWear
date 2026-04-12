import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
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
    },
  });

  return NextResponse.json({
    updatedCount: updated.count,
    cutoff: cutoff.toISOString(),
  });
}
