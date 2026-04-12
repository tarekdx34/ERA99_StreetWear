import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";

const schema = z.object({
  label: z.string().trim().max(40).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(8).optional(),
  governorate: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  street: z.string().trim().min(1).optional(),
  building: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payload = schema.parse(await request.json());

    if (payload.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id, userId },
      data: {
        ...(typeof payload.label === "string" ? { label: payload.label } : {}),
        ...(typeof payload.firstName === "string"
          ? { firstName: payload.firstName }
          : {}),
        ...(typeof payload.lastName === "string" ? { lastName: payload.lastName } : {}),
        ...(typeof payload.phone === "string" ? { phone: payload.phone } : {}),
        ...(typeof payload.governorate === "string"
          ? { governorate: payload.governorate }
          : {}),
        ...(typeof payload.city === "string" ? { city: payload.city } : {}),
        ...(typeof payload.street === "string" ? { street: payload.street } : {}),
        ...(typeof payload.building === "string" ? { building: payload.building } : {}),
        ...(typeof payload.isDefault === "boolean"
          ? { isDefault: payload.isDefault }
          : {}),
      },
    });

    if (address.count === 0) {
      return NextResponse.json({ message: "Address not found." }, { status: 404 });
    }

    const fresh = await prisma.address.findUnique({ where: { id } });
    return NextResponse.json({ address: fresh });
  } catch {
    return NextResponse.json({ message: "Invalid address payload." }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const target = await prisma.address.findFirst({ where: { id, userId } });
  if (!target) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  if (target.isDefault) {
    const remaining = await prisma.address.findFirst({
      where: { userId },
      orderBy: { id: "desc" },
    });
    if (remaining) {
      await prisma.address.update({
        where: { id: remaining.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
