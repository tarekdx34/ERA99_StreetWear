import { compare, hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const patchSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(8).max(128).optional(),
  currentPassword: z.string().min(1).optional(),
});

export async function GET() {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = patchSchema.parse(await request.json());

    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (typeof payload.firstName === "string") updates.firstName = payload.firstName;
    if (typeof payload.lastName === "string") updates.lastName = payload.lastName;

    const emailChanged =
      typeof payload.email === "string" && payload.email !== current.email;

    if (emailChanged) {
      if (!payload.currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to change email." },
          { status: 400 },
        );
      }

      const valid = await compare(payload.currentPassword, current.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 },
        );
      }

      const existing = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true },
      });
      if (existing && existing.id !== current.id) {
        return NextResponse.json(
          { message: "Email already in use." },
          { status: 409 },
        );
      }

      updates.email = payload.email;
      updates.emailVerified = true;
    }

    if (payload.password) {
      if (!payload.currentPassword) {
        return NextResponse.json(
          { message: "Current password is required." },
          { status: 400 },
        );
      }
      const valid = await compare(payload.currentPassword, current.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 },
        );
      }

      updates.passwordHash = await hash(payload.password, 12);
      updates.authVersion = { increment: 1 };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: "Invalid profile update payload." },
      { status: 400 },
    );
  }
}
