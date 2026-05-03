import { createHash, timingSafeEqual } from "crypto";

type OrderTokenPurpose = "view" | "payment_callback";

type TokenInput = {
  purpose: OrderTokenPurpose;
  orderId: number;
  createdAt: Date;
  expiresAt: number;
};

function getSigningSecret() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for order token signing");
  }
  return secret;
}

function signToken(input: TokenInput) {
  return createHash("sha256")
    .update(
      [
        input.purpose,
        String(input.orderId),
        input.createdAt.toISOString(),
        String(input.expiresAt),
        getSigningSecret(),
      ].join(":"),
    )
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function createSignedOrderToken(input: {
  purpose: OrderTokenPurpose;
  orderId: number;
  createdAt: Date;
  ttlSeconds: number;
}) {
  const expiresAt = Date.now() + input.ttlSeconds * 1000;
  const signature = signToken({
    purpose: input.purpose,
    orderId: input.orderId,
    createdAt: input.createdAt,
    expiresAt,
  });
  return `${expiresAt}.${signature}`;
}

export function verifySignedOrderToken(input: {
  token: string | null | undefined;
  purpose: OrderTokenPurpose;
  orderId: number;
  createdAt: Date;
}) {
  const token = input.token?.trim();
  if (!token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expected = signToken({
    purpose: input.purpose,
    orderId: input.orderId,
    createdAt: input.createdAt,
    expiresAt,
  });

  return safeEqual(signature, expected);
}
