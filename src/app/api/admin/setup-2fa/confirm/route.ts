import { NextResponse } from "next/server";
import {
  confirmTotpSecret,
  getClientIp,
  getPendingTotpSecret,
  verifyChallengeToken,
  verifyTotpCode,
} from "@/lib/admin-security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const challengeToken = String(body?.challengeToken || "");
    const code = String(body?.code || "");
    const ip = getClientIp(req.headers);

    const challenge = verifyChallengeToken(challengeToken, ip);
    if (!challenge || !challenge.setupMode) {
      return NextResponse.json(
        { message: "Invalid setup challenge." },
        { status: 401 },
      );
    }

    const pending = await getPendingTotpSecret();
    if (!pending) {
      return NextResponse.json(
        { message: "No pending 2FA setup found." },
        { status: 400 },
      );
    }

    const valid = verifyTotpCode(code, pending);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid verification code." },
        { status: 400 },
      );
    }

    await confirmTotpSecret();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to confirm 2FA setup." },
      { status: 400 },
    );
  }
}
