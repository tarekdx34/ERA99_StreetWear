import { NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  buildOtpAuthUri,
  generatePendingTotpSecret,
  getClientIp,
  getTotpSecret,
  verifyChallengeToken,
} from "@/lib/admin-security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const challengeToken = String(body?.challengeToken || "");
    const ip = getClientIp(req.headers);

    const challenge = verifyChallengeToken(challengeToken, ip);
    if (!challenge || !challenge.setupMode) {
      return NextResponse.json(
        { message: "Invalid setup challenge." },
        { status: 401 },
      );
    }

    const existing = await getTotpSecret();
    if (existing) {
      return NextResponse.json({ alreadyConfigured: true });
    }

    const pendingSecret = await generatePendingTotpSecret();
    const otpauth = buildOtpAuthUri(pendingSecret);
    const qrDataUrl = await QRCode.toDataURL(otpauth, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });

    return NextResponse.json({
      qrDataUrl,
      manualKey: pendingSecret,
      storageNote:
        "Secret is stored encrypted in database table Setting under key admin_totp_secret_enc after verification.",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to generate 2FA setup." },
      { status: 400 },
    );
  }
}
