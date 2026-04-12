import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth-email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

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
        emailVerified: true,
      },
    });

    if (user && !user.emailVerified) {
      const verification = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        token: verification.token,
      });
    }

    return NextResponse.json({
      message: "If an account exists for this email, a verification link has been sent.",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "If an account exists for this email, a verification link has been sent.",
      },
      { status: 200 },
    );
  }
}
