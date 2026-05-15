import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

const globalState = globalThis as unknown as {
  qutbRateLimitStore?: Map<string, Bucket>;
};

const store = globalState.qutbRateLimitStore ?? new Map<string, Bucket>();
if (!globalState.qutbRateLimitStore) {
  globalState.qutbRateLimitStore = store;
}

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function enforceRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  return enforceDistributedRateLimit(request, options);
}

async function enforceDistributedRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  if (
    !isDatabaseConfigured() ||
    typeof (prisma as unknown as { $queryRaw?: unknown }).$queryRaw !== "function"
  ) {
    return enforceInMemoryRateLimit(request, options);
  }

  const ip = getClientIp(request);
  const now = Date.now();
  const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
  const windowEnd = windowStart + options.windowMs;
  const key = `rate_limit:${options.keyPrefix}:${ip}:${windowStart}`;

  try {
    const rows = await prisma.$queryRaw<Array<{ value: string }>>`
      INSERT INTO "Setting" ("key", "value")
      VALUES (${key}, '1')
      ON CONFLICT ("key")
      DO UPDATE SET "value" = CAST((CAST("Setting"."value" AS INTEGER) + 1) AS TEXT)
      RETURNING "value"
    `;

    const count = Number(rows[0]?.value || "0");
    if (count <= options.limit) {
      return null;
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((windowEnd - now) / 1000));
    return NextResponse.json(
      {
        message: "Too many requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  } catch {
    return enforceInMemoryRateLimit(request, options);
  }
}

function enforceInMemoryRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${options.keyPrefix}:${ip}`;
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    return NextResponse.json(
      {
        message: "Too many requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  existing.count += 1;
  store.set(key, existing);
  return null;
}
