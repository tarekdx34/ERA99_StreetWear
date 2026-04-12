import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { changeAdminPassword, getSessionVersion } from "@/lib/admin-security";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { ok: false as const, status: 401, message: "Unauthorized" };

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  try {
    const payload = schema.parse(await req.json());
    const result = await changeAdminPassword(
      payload.currentPassword,
      payload.newPassword,
    );
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid password payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 },
    );
  }
}
