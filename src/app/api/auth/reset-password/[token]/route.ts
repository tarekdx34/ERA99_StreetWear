import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const PASSWORD_SALT_ROUNDS = 12;

async function getUsableToken(token: string) {
  const now = new Date();
  const found = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: {
      id: true,
      userId: true,
      used: true,
      expiresAt: true,
    },
  });

  if (!found) return null;
  if (found.used || found.expiresAt <= now) return null;
  return found;
}

export async function GET(
  _: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const usable = await getUsableToken(token);

  return NextResponse.json({ valid: Boolean(usable) });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const parsed = bodySchema.parse(await request.json());
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    const passwordHash = await hash(parsed.password, PASSWORD_SALT_ROUNDS);

    const updated = await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          used: false,
          expiresAt: { gt: now },
        },
        data: {
          used: true,
        },
      });

      if (consumed.count !== 1) return false;

      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          authVersion: { increment: 1 },
        },
      });

      return true;
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password updated. Please sign in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid password input.", errors: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Unable to reset password right now." },
      { status: 500 },
    );
  }
}
