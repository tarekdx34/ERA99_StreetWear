import { NextResponse } from "next/server";


import {
  getActiveSessionsSnapshot,
  getRecentLoginAttempts,
  requireAdminRole,
  rotateSessionVersion,
} from "@/lib/admin-security";

export async function GET() {
  const auth = await requireAdminRole();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

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
  const auth = await requireAdminRole();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  await rotateSessionVersion();
  return NextResponse.json({ ok: true });
}
