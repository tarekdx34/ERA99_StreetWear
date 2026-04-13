import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { getAdminSettings } from "@/lib/admin-settings";
import { parseCloudinaryUrl } from "@/lib/utils";

const bodySchema = z.object({
  folder: z.string().min(1).max(120).optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const settings = await getAdminSettings();
  const cloudinaryRaw = String(settings.cloudinaryUrl || process.env.CLOUDINARY_URL || "").trim();
  const cloudinary = parseCloudinaryUrl(cloudinaryRaw);

  if (!cloudinary) {
    return NextResponse.json(
      { message: "Cloudinary URL is missing or invalid in Admin Settings" },
      { status: 400 },
    );
  }

  const folder = parsedBody.data.folder || "qutb-products";
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${paramsToSign}${cloudinary.apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    timestamp,
    folder,
    signature,
  });
}
