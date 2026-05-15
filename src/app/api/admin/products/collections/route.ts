import { NextResponse } from "next/server";

import { z } from "zod";

import { requireAdminRole } from "@/lib/admin-security";
import { addCatalogCollection, getCatalogCollections } from "@/lib/catalog";

const payloadSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const collections = await getCatalogCollections();
  return NextResponse.json({ collections });
}

export async function POST(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  try {
    const payload = payloadSchema.parse(await req.json());
    const collections = await addCatalogCollection(payload.name);
    return NextResponse.json({ collections });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid collection payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to save collection" },
      { status: 500 },
    );
  }
}
