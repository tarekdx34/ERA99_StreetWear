import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const schema = z.object({
  label: z.string().trim().max(40).optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  governorate: z.string().trim().min(1),
  city: z.string().trim().min(1),
  street: z.string().trim().min(1),
  building: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const userId = await getShopperSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());

    const count = await prisma.address.count({ where: { userId } });
    if (count >= 5) {
      return NextResponse.json(
        { message: "Maximum 5 saved addresses." },
        { status: 400 },
      );
    }

    const setDefault = payload.isDefault || count === 0;

    if (setDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: payload.label || null,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        governorate: payload.governorate,
        city: payload.city,
        street: payload.street,
        building: payload.building || null,
        isDefault: setDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid address payload." }, { status: 400 });
  }
}
