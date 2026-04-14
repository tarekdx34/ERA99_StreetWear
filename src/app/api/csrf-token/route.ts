import { NextResponse } from "next/server";
import { generateCsrfToken, getCsrfCookieName } from "@/lib/csrf";

export async function GET() {
  const token = generateCsrfToken();
  const cookieName = getCsrfCookieName();
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
