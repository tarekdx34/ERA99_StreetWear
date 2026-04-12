import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const valid = await compare(payload.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
