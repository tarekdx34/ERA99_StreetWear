import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getActiveSessionsSnapshot,
  getRecentLoginAttempts,
  getSessionVersion,
  rotateSessionVersion,
} from "@/lib/admin-security";

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
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  const [activeSessions, loginAttempts] = await Promise.all([
    getActiveSessionsSnapshot(),
    getRecentLoginAttempts(20),
  ]);

  return NextResponse.json({
    activeSessions,
    loginAttempts,
  });
}

export async function POST() {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  await rotateSessionVersion();
  return NextResponse.json({ ok: true });
}
