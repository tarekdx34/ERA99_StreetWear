import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import {
  beginTotpRotation,
  confirmTotpRotation,
  getSessionVersion,
} from "@/lib/admin-security";

const confirmSchema = z.object({
  code: z.string().min(6),
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

  const mode = req.headers.get("x-settings-action") || "start";

  if (mode === "confirm") {
    try {
      const payload = confirmSchema.parse(await req.json());
      const result = await confirmTotpRotation(payload.code);
      if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid 2FA confirm payload" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { message: "Failed to confirm 2FA rotation" },
        { status: 500 },
      );
    }
  }

  const begin = await beginTotpRotation();
  if (!begin.ok) {
    return NextResponse.json({ message: begin.message }, { status: 400 });
  }

  const qrDataUrl = await QRCode.toDataURL(begin.uri, {
    margin: 1,
    width: 220,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return NextResponse.json({
    manualKey: begin.secret,
    qrDataUrl,
  });
}
