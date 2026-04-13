import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { getAdminSettings } from "@/lib/admin-settings";
import { parseCloudinaryUrl } from "@/lib/utils";

const bodySchema = z.object({
  imageUrl: z.string().url(),
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

function cloudinaryPublicIdFromUrl(imageUrl: string, cloudName: string) {
  try {
    const parsed = new URL(imageUrl);
    const expectedSegment = `/${cloudName}/image/upload/`;
    const start = parsed.pathname.indexOf(expectedSegment);
    if (start === -1) return null;

    const uploadPath = parsed.pathname.slice(start + expectedSegment.length);
    const withoutTransformations = uploadPath
      .split("/")
      .filter(Boolean)
      .filter((segment) => !/^v\d+$/.test(segment));

    if (!withoutTransformations.length) return null;

    const joined = withoutTransformations.join("/");
    const dotIndex = joined.lastIndexOf(".");
    if (dotIndex <= 0) return joined;

    return joined.slice(0, dotIndex);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 },
    );
  }

  const settings = await getAdminSettings();
  const cloudinaryRaw = String(
    settings.cloudinaryUrl || process.env.CLOUDINARY_URL || "",
  ).trim();
  const cloudinary = parseCloudinaryUrl(cloudinaryRaw);

  if (!cloudinary) {
    return NextResponse.json(
      { message: "Cloudinary URL is missing or invalid in Admin Settings" },
      { status: 400 },
    );
  }

  const imageUrl = parsedBody.data.imageUrl;
  const publicId = cloudinaryPublicIdFromUrl(imageUrl, cloudinary.cloudName);

  if (!publicId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(
      `public_id=${publicId}&timestamp=${timestamp}${cloudinary.apiSecret}`,
    )
    .digest("hex");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", cloudinary.apiKey);
  formData.append("signature", signature);

  const destroyRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await destroyRes.json().catch(() => ({}));
  if (!destroyRes.ok) {
    return NextResponse.json(
      { message: payload?.error?.message || "Cloudinary delete failed" },
      { status: 500 },
    );
  }

  if (
    payload?.result &&
    payload.result !== "ok" &&
    payload.result !== "not found"
  ) {
    return NextResponse.json(
      { message: "Cloudinary delete failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, result: payload?.result || "ok" });
}
