import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

describe("enforceRateLimit", () => {
  it("returns 429 when limit is exceeded in the same window", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "1.2.3.4",
      },
    });

    const first = enforceRateLimit(request, {
      keyPrefix: "test-limit",
      limit: 1,
      windowMs: 60_000,
    });
    const second = enforceRateLimit(request, {
      keyPrefix: "test-limit",
      limit: 1,
      windowMs: 60_000,
    });

    expect(first).toBeNull();
    expect(second?.status).toBe(429);
  });
});
