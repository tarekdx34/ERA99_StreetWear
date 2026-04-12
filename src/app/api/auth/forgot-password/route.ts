import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/auth-email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const GENERIC_RESPONSE = {
  message: "If an account exists for this email, a reset link has been sent.",
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email } = schema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        token: token.token,
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch {
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
