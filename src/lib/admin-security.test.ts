import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateSecret, generateSync } from "otplib";
import {
  createChallengeToken,
  verifyChallengeToken,
  verifyTotpCode,
} from "@/lib/admin-security";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

describe("verifyTotpCode", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
    vi.useRealTimers();
  });

  it("rejects arbitrary six digit values", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
    const secret = generateSecret();
    const validCode = generateSync({
      secret,
      strategy: "totp",
      period: 30,
      digits: 6,
      epoch: Math.floor(Date.now() / 1000),
    });

    expect(verifyTotpCode(validCode, secret)).toBe(true);
    expect(
      verifyTotpCode(validCode === "123456" ? "654321" : "123456", secret),
    ).toBe(false);
  });

  it("accepts a short clock skew without accepting arbitrary codes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
    const secret = generateSecret();
    const nextWindowCode = generateSync({
      secret,
      strategy: "totp",
      period: 30,
      digits: 6,
      epoch: Math.floor(Date.now() / 1000) + 30,
    });

    expect(verifyTotpCode(nextWindowCode, secret)).toBe(true);
    expect(verifyTotpCode("000000", secret)).toBe(false);
  });
});

describe("verifyChallengeToken", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
    vi.useRealTimers();
  });

  it("accepts signed short-lived challenges when proxy IP changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
    const token = createChallengeToken({
      username: "qutb_admin",
      ip: "127.0.0.1",
      setupMode: false,
    });

    expect(verifyChallengeToken(token, "unknown")?.username).toBe("qutb_admin");
  });
});
