import { NextResponse } from "next/server";
import {
  createChallengeToken,
  getClientIp,
  getTotpSecret,
  validatePrimaryCredentials,
} from "@/lib/admin-security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    const ip = getClientIp(req.headers);

    const result = await validatePrimaryCredentials({ username, password, ip });
    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.message,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: result.status },
      );
    }

    const secret = await getTotpSecret();
    const requiresSetup = !secret;

    const challengeToken = createChallengeToken({
      username,
      ip,
      setupMode: requiresSetup,
    });

    return NextResponse.json({
      challengeToken,
      requires2fa: !requiresSetup,
      requiresSetup,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to start login flow." },
      { status: 400 },
    );
  }
}
