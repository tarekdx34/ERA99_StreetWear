import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  generateSessionId,
  getSessionCookieName,
  getSessionCookieMaxAge,
} from "@/lib/session-cookie";
import {
  extractAttributionFromUrl,
  getAttributionCookieName,
  getAttributionMaxAge,
  hasAttribution,
} from "@/lib/attribution";

const ALLOWLIST = [
  "/admin/login",
  "/admin/setup-2fa",
  "/api/admin/auth/start",
  "/api/admin/setup-2fa/generate",
  "/api/admin/setup-2fa/confirm",
];

const PUBLIC_FILE_PATTERN =
  /\.(?:avif|css|gif|ico|jpeg|jpg|js|map|mp4|png|svg|webp|woff2?)$/i;

async function getEarlyAccessActiveFromInternalState(request: NextRequest) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl.origin ||
      "http://localhost:3250";
    const stateUrl = new URL("/api/internal/early-access-state", origin);
    const response = await fetch(stateUrl.toString(), {
      cache: "no-store",
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    if (!response.ok) {
      console.log("Internal state fetch failed:", response.status);
      return false;
    }
    const data = (await response.json().catch(() => null)) as {
      earlyAccessActive?: unknown;
      countdownEnabled?: unknown;
    } | null;
    return Boolean(data?.earlyAccessActive) || Boolean(data?.countdownEnabled);
  } catch (error) {
    console.log("Internal state fetch error:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (request.headers.get("next-router-prefetch")) {
    return NextResponse.next();
  }
  console.log("MIDDLEWARE HIT:", pathname);
  const isAllowed = ALLOWLIST.some((path) => pathname.startsWith(path));
  const isAdminArea = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isApiRoute = pathname.startsWith("/api/");
  const isEarlyAccessPage = pathname === "/early-access";
  const isPublicFile = PUBLIC_FILE_PATTERN.test(pathname);

  const nextRequestHeaders = new Headers(request.headers);
  nextRequestHeaders.set("x-pathname", pathname);
  if (isAdminArea) {
    nextRequestHeaders.set("x-admin-area", "1");
  }

  const response = NextResponse.next({
    request: { headers: nextRequestHeaders },
  });

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

  const attributionCookieName = getAttributionCookieName();
  const existingAttribution = request.cookies.get(attributionCookieName)?.value;

  if (!existingAttribution) {
    const attribution = extractAttributionFromUrl(request.url);
    if (hasAttribution(attribution)) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set(
        attributionCookieName,
        encodeURIComponent(JSON.stringify(attribution)),
        {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: getAttributionMaxAge(),
        },
      );
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const tokenRole =
    typeof token === "object" && token && "role" in token
      ? (token as Record<string, unknown>).role
      : null;
  const isAdmin = tokenRole === "admin";

  const isInternalApi = pathname.startsWith("/api/internal/");

  if (!isAdmin && !isAdminArea && !isAdminApi) {
    if (!isApiRoute && !isEarlyAccessPage && !isPublicFile) {
      const isLocked = await getEarlyAccessActiveFromInternalState(request);
      if (isLocked) {
        return NextResponse.redirect(new URL("/early-access", request.url));
      }
    }
  }

  // Internal API routes are only called by the middleware itself — no further
  // processing needed (auth, redirects, etc. don't apply).
  if (isInternalApi) {
    return response;
  }

  if (isAllowed) {
    return response;
  }

  if (isAdminArea || isAdminApi) {
    if (isAdmin) {
      return response;
    }

    if (isAdminApi) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|favicon.ico|api/internal/).*)",
  ],
};
