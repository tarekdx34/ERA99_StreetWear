import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { z } from "zod";

import {
  beginTotpRotation,
  confirmTotpRotation,
  requireAdminRole,
} from "@/lib/admin-security";

const confirmSchema = z.object({
  code: z.string().min(6),
});

export async function POST(req: Request) {
  const auth = await requireAdminRole();
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
