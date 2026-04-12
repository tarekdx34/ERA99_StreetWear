import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  if (!isAdminArea && !isAdminApi) {
    return NextResponse.next({ request: { headers: nextRequestHeaders } });
  }

  if (isAllowed) {
    return NextResponse.next({ request: { headers: nextRequestHeaders } });
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    return NextResponse.next({ request: { headers: nextRequestHeaders } });
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
