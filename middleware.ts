import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { generateSessionId, getSessionCookieName, getSessionCookieMaxAge } from "@/lib/session-cookie";
import { extractAttributionFromUrl, getAttributionCookieName, getAttributionMaxAge, hasAttribution } from "@/lib/attribution";

const ALLOWLIST = [
  "/admin/login",
  "/admin/setup-2fa",
  "/api/admin/auth/start",
  "/api/admin/setup-2fa/generate",
  "/api/admin/setup-2fa/confirm",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAllowed = ALLOWLIST.some((path) => pathname.startsWith(path));
  const isAdminArea = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  const nextRequestHeaders = new Headers(request.headers);
  nextRequestHeaders.set("x-pathname", pathname);
  if (isAdminArea) {
    nextRequestHeaders.set("x-admin-area", "1");
  }

  const response = NextResponse.next({ request: { headers: nextRequestHeaders } });

  // Set session ID cookie for guest cart persistence
  const sessionCookieName = getSessionCookieName();
  const existingSessionId = request.cookies.get(sessionCookieName)?.value;

  if (!existingSessionId) {
    const isProduction = process.env.NODE_ENV === "production";
    const newSessionId = generateSessionId();
    response.cookies.set(sessionCookieName, newSessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: getSessionCookieMaxAge(),
    });
  }

  // Capture UTM attribution on first visit
  const attributionCookieName = getAttributionCookieName();
  const existingAttribution = request.cookies.get(attributionCookieName)?.value;

  if (!existingAttribution) {
    const attribution = extractAttributionFromUrl(request.url);
    if (hasAttribution(attribution)) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set(attributionCookieName, encodeURIComponent(JSON.stringify(attribution)), {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: getAttributionMaxAge(),
      });
    }
  }

  if (!isAdminArea && !isAdminApi) {
    return response;
  }

  if (isAllowed) {
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (token) {
    return response;
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const redirectUrl = new URL("/admin/login", request.url);
  redirectUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
