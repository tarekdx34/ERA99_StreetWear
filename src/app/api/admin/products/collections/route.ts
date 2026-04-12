import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { addCatalogCollection, getCatalogCollections } from "@/lib/catalog";

const payloadSchema = z.object({
  name: z.string().min(1),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, message: "Unauthorized" };

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function GET() {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const collections = await getCatalogCollections();
  return NextResponse.json({ collections });
}

export async function POST(req: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    const payload = payloadSchema.parse(await req.json());
    const collections = await addCatalogCollection(payload.name);
    return NextResponse.json({ collections });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid collection payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to save collection" }, { status: 500 });
  }
}
