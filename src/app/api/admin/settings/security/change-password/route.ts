import { NextResponse } from "next/server";

import { z } from "zod";

import { changeAdminPassword, requireAdminRole } from "@/lib/admin-security";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const auth = await requireAdminRole();
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
