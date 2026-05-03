import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, {
    keyPrefix: "auth-check-email",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const json = await request.json();
    const { email } = schema.parse(json);

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ message: "Invalid email." }, { status: 400 });
  }
}
