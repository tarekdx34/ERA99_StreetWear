import { randomBytes, createHash, timingSafeEqual } from "crypto";

const CSRF_SECRET_NAME = "__csrf_secret";
const CSRF_TOKEN_NAME = "__csrf_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSigningKey(): string {
  const key = process.env.NEXTAUTH_SECRET;
  if (!key) throw new Error("NEXTAUTH_SECRET is required for CSRF signing");
  return key;
}

function signToken(raw: string): string {
  const key = getSigningKey();
  const hash = createHash("sha256").update(`${raw}${key}`).digest("hex");
  return `${raw}|${hash}`;
}

function verifyToken(token: string): boolean {
  const [raw, hash] = token.split("|");
  if (!raw || !hash) return false;
  const expected = createHash("sha256").update(`${raw}${getSigningKey()}`).digest("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
}

export function generateCsrfToken(): string {
  const raw = randomBytes(32).toString("hex");
  return signToken(raw);
}

export function validateCsrfToken(token: string): boolean {
  if (!token) return false;
  return verifyToken(token);
}

export function getCsrfCookieName() {
  return CSRF_SECRET_NAME;
}

export function getCsrfHeaderName() {
  return "x-csrf-token";
}
