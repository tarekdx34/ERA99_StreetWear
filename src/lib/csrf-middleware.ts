import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken, getCsrfCookieName, getCsrfHeaderName } from "@/lib/csrf";

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  const headerName = getCsrfHeaderName();
  return request.headers.get(headerName) || request.nextUrl.searchParams.get("csrf_token");
}

export async function requireCsrf(request: NextRequest): Promise<NextResponse | null> {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(request.method)) return null;

  const cookieName = getCsrfCookieName();
  const cookieToken = request.cookies.get(cookieName)?.value;
  const headerToken = getCsrfTokenFromRequest(request);

  if (!cookieToken || !headerToken) {
    return NextResponse.json({ message: "CSRF token missing" }, { status: 403 });
  }

  // The header token should be the full signed token (raw|hash)
  // The cookie also stores the full signed token
  // We verify that the header matches the cookie, then validate the signature
  if (cookieToken !== headerToken) {
    return NextResponse.json({ message: "CSRF token mismatch" }, { status: 403 });
  }

  if (!validateCsrfToken(cookieToken)) {
    return NextResponse.json({ message: "CSRF token invalid" }, { status: 403 });
  }

  return null;
}
