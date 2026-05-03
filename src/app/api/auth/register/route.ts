import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth-email";

const schema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const PASSWORD_SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, {
    keyPrefix: "auth-register",
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const json = await request.json();
    const payload = schema.parse(json);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Account already exists.", code: "EMAIL_EXISTS" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(payload.password, PASSWORD_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        emailVerified: false,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    const verification = await createEmailVerificationToken(user.id);
    await sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      token: verification.token,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Account already exists.", code: "EMAIL_EXISTS" },
        { status: 409 },
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid registration data.", errors: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Unable to register at the moment." },
      { status: 500 },
    );
  }
}
