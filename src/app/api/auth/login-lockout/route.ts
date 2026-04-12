import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/admin-security";
import { getShopperLockout } from "@/lib/shopper-security";

export async function GET(request: Request) {
  const headers =
    request.headers instanceof Headers
      ? request.headers
      : new Headers(request.headers as HeadersInit);
  const ip = getClientIp(headers);
  const lock = await getShopperLockout(ip);

  return NextResponse.json(lock);
}
